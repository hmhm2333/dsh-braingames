import {createHash} from 'node:crypto';
import {once} from 'node:events';
import {existsSync} from 'node:fs';
import {createServer} from 'node:http';
import {homedir} from 'node:os';
import {delimiter, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {AgentHookConfigError, agentHookPaths, installAgentHook} from './agent-hook-config.mjs';
import {agentChallengePipe, blockReason} from './agent-submit-hook.mjs';
import {DEFAULT_CHALLENGE_TARGETS} from './games.mjs';

export const challengeScopes = ['off', 'dsh', 'local'];
const route = '/api/braingames/agent-challenge';
const submitHook = command => ({hooks: {UserPromptSubmit: [{hooks: [{type: 'command', command}]}]}});
const cursorHook = command => ({version: 1, hooks: {beforeSubmitPrompt: [{command}]}});
const agents = [
  {id: 'codex', name: 'Codex', executable: 'codex', config: submitHook},
  {id: 'claude', name: 'Claude Code', executable: 'claude', config: submitHook},
  {id: 'cursor', name: 'Cursor', executable: 'cursor', config: cursorHook},
];

async function readSmallJson(request) {
  const raw = await request.text();
  if (raw.length > 512) return null;
  try { return JSON.parse(raw); }
  catch (error) { if (error instanceof SyntaxError) return null; throw error; }
}

const json = (value, status = 200) => Response.json(value, {status, headers: {'Cache-Control': 'no-store'}});

function commandFound(command) {
  const paths = (process.env.PATH ?? '').split(delimiter).filter(Boolean);
  return paths.some(path => ['.exe', '.cmd', '.ps1'].some(ext => existsSync(join(path, command + ext))));
}

export function challengeHostKey(dshHome) {
  return createHash('sha256').update(resolve(dshHome).toLowerCase()).digest('hex').slice(0, 20);
}

export function applyAgentChallenge(ctx, {
  getScope, getTargets, hookPaths = agentHookPaths(),
  dshHome = process.env.DSH_HOME || join(homedir(), '.dsh'),
}) {
  const localAvailable = process.platform === 'win32';
  const key = challengeHostKey(dshHome);
  const hookPath = fileURLToPath(new URL('./agent-submit-hook.mjs', import.meta.url)).replaceAll('\\', '/');
  // The same command must be literal in the Agents' Windows shells.
  const hookPathSafe = !/["%$!\x60\r\n]/.test(hookPath);
  const hookConfig = agent => hookPathSafe ? agent.config('node "' + hookPath + '" ' + key + ' ' + agent.id) : null;
  const observed = new Set();
  let round = null;
  let bridgeStart;

  function state() {
    const scope = getScope();
    if (scope === 'off') round = null;
    const targetScore = round ? getTargets()[round.gameId] : null;
    return {scope, gameId: round?.gameId ?? null, score: round?.score ?? null, targetScore,
      locked: round !== null && round.score < targetScore, localAvailable};
  }

  const server = createServer((request, response) => {
    const agent = agents.find(agent => request.url === '/check/' + agent.id);
    if (!agent || request.method !== 'GET') return response.writeHead(404).end();
    const current = state();
    if (current.scope === 'local') observed.add(agent.id);
    return response.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'})
      .end(JSON.stringify({locked: current.scope === 'local' && current.locked}));
  });

  function startBridge() {
    if (getScope() !== 'local' || !localAvailable) return;
    if (!bridgeStart) {
      const listening = once(server, 'listening');
      server.listen(agentChallengePipe(key));
      bridgeStart = listening.then(() => null, error => {
        bridgeStart = undefined;
        ctx.logger('braingames-agent-challenge').error(error);
        return error.code || 'listen-failed';
      });
    }
    return bridgeStart;
  }

  async function status() {
    const bridgeError = await startBridge();
    const current = state();
    const available = current.scope === 'local' && localAvailable;
    const inventory = available ? agents.map(agent => ({
      id: agent.id, name: agent.name, found: commandFound(agent.executable), observed: observed.has(agent.id),
      file: hookPaths[agent.id], config: hookConfig(agent),
    })) : [];
    return {...current, bridgeError: bridgeError ?? null, agents: inventory};
  }

  ctx.on('agent/pre-step', async ({step}, next) => {
    if (step === 1 && state().locked) {
      ctx.logger('braingames-agent-challenge').info(blockReason());
      return {kind: 'reject'};
    }
    return next();
  });
  ctx.effect(() => ctx.connection.fetch.register({path: route, methods: ['GET', 'POST'], requestBody: 'buffered', async fetch(request) {
    if (request.method === 'POST') {
      const result = await readSmallJson(request);
      if (!Object.hasOwn(DEFAULT_CHALLENGE_TARGETS, result?.gameId) || !Number.isSafeInteger(result.score) || result.score < 0 ||
          !Number.isSafeInteger(result.finishedAt) || result.finishedAt <= 0) {
        return Response.json({error: 'Invalid BrainGames round settlement'}, {status: 400});
      }
      if (state().scope !== 'off' && (!round || result.finishedAt > round.finishedAt)) {
        round = {gameId: result.gameId, score: result.score, finishedAt: result.finishedAt};
      }
    }
    return json(await status());
  }}), 'BrainGames Agent challenge');
  // Connection's exact routes admit owner Peers and enforce browser request trust.
  ctx.effect(() => ctx.connection.fetch.register({path: route + '/connect', methods: ['POST'], requestBody: 'buffered', async fetch(request) {
    if (request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
      return json({error: 'bad-request'}, 415);
    }
    const input = await readSmallJson(request);
    const agent = agents.find(item => item.id === input?.agentId);
    if (!agent || Object.keys(input).length !== 1) return json({error: 'bad-request'}, 400);
    if (!localAvailable || getScope() !== 'local') return json({error: 'scope-not-local'}, 409);
    const definition = hookConfig(agent);
    if (!definition) return json({error: 'hook-path'}, 422);
    if (await startBridge()) return json({error: 'bridge-unavailable'}, 409);
    if (getScope() !== 'local') return json({error: 'scope-not-local'}, 409);
    try {
      const result = await installAgentHook(hookPaths[agent.id], definition);
      return json({result});
    } catch (error) {
      if (error instanceof AgentHookConfigError) {
        return json({error: error.code}, error.code === 'config-changed' ? 409 : 422);
      }
      ctx.logger('braingames-agent-challenge').error('Agent hook configuration write failed', agent.id, error.code || error.name);
      return json({error: 'write-failed'}, 500);
    }
  }}), 'BrainGames Agent hook installation');
  ctx.effect(() => async () => {
    await bridgeStart;
    if (!server.listening) return;
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }, 'BrainGames local Agent challenge bridge');
  void startBridge();
}
