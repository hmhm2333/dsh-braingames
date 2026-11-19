import {randomUUID} from 'node:crypto';
import {lstat, mkdir, open, readFile, realpath, rename, unlink} from 'node:fs/promises';
import {homedir} from 'node:os';
import {basename, dirname, isAbsolute, join} from 'node:path';
import {applyEdits, findNodeAtLocation, modify, parseTree} from 'jsonc-parser';

export class AgentHookConfigError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export function agentHookPaths(userHome = homedir(), env = process.env) {
  const codexDir = env.CODEX_HOME || env.DSH_BRAINGAMES_CODEX_CONFIG_DIR || join(userHome, '.codex');
  const claudeDir = env.CLAUDE_CONFIG_DIR || join(userHome, '.claude');
  return {
    codex: join(codexDir, 'hooks.json'),
    claude: join(claudeDir, 'settings.json'),
    cursor: join(userHome, '.cursor', 'hooks.json'),
  };
}

function property(node, key) {
  const matches = node?.children?.filter(entry => entry.children[0].value === key) ?? [];
  if (matches.length > 1) throw new AgentHookConfigError('config-format');
  return matches[0]?.children[1];
}

function mergeHook(text, definition) {
  const errors = [];
  const root = parseTree(text, errors, {allowTrailingComma: true});
  if (errors.length || root?.type !== 'object') throw new AgentHookConfigError('config-format');
  const [event, [addition]] = Object.entries(definition.hooks)[0];
  const hooks = property(root, 'hooks');
  if (hooks && hooks.type !== 'object') throw new AgentHookConfigError('config-format');
  const entries = property(hooks, event);
  if (entries && entries.type !== 'array') throw new AgentHookConfigError('config-format');
  const version = definition.version === undefined ? undefined : property(root, 'version');
  if (version && version.value !== definition.version) throw new AgentHookConfigError('config-format');

  const command = (addition.hooks?.[0] ?? addition).command;
  const sameCommand = node => {
    const type = findNodeAtLocation(node, ['type'])?.value;
    const windows = findNodeAtLocation(node, ['commandWindows'])?.value;
    const configured = findNodeAtLocation(node, ['command'])?.value;
    return (type === undefined || type === 'command') && (windows ?? configured) === command;
  };
  const installed = entries?.children?.some(node => {
    if (!addition.hooks) return sameCommand(node);
    const handlers = findNodeAtLocation(node, ['hooks']);
    return handlers?.type === 'array' && handlers.children.some(sameCommand);
  });

  const options = {formattingOptions: {tabSize: 2, insertSpaces: true, eol: text.includes('\r\n') ? '\r\n' : '\n'}};
  let result = text;
  if (!installed) {
    const path = ['hooks', event];
    if (entries) path.push(-1);
    result = applyEdits(result, modify(result, path, entries ? addition : [addition], options));
  }
  if (definition.version !== undefined && !version) {
    result = applyEdits(result, modify(result, ['version'], definition.version, options));
  }
  return result;
}

async function nullableFile(operation, path) {
  try { return await operation(path); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

export async function installAgentHook(file, definition) {
  if (!isAbsolute(file)) throw new AgentHookConfigError('config-path');
  // Preserve a user-managed symlink and coordinate installs against its target.
  const original = await nullableFile(lstat, file);
  const target = original ? await realpath(file) : file;
  await mkdir(dirname(target), {recursive: true});
  const directory = await realpath(dirname(target));
  const destination = join(directory, basename(target));
  const lockPath = join(directory, '.' + basename(target) + '.braingames.lock');
  let lock;
  try { lock = await open(lockPath, 'wx', 0o600); }
  catch (error) {
    if (error.code === 'EEXIST') throw new AgentHookConfigError('config-changed');
    throw error;
  }
  try {
    const info = await nullableFile(lstat, destination);
    if (info && !info.isFile()) throw new AgentHookConfigError('config-format');
    const bytes = info ? await readFile(destination) : null;
    let text = '{}\n';
    if (bytes) {
      try { text = new TextDecoder('utf-8', {fatal: true, ignoreBOM: true}).decode(bytes); }
      catch { throw new AgentHookConfigError('config-format'); }
    }
    const bom = text.startsWith('\ufeff') ? '\ufeff' : '';
    const source = text.slice(bom.length);
    const merged = mergeHook(source.trim() === '' ? '{}\n' : source, definition);
    if (merged === source) return 'already-installed';

    const temporary = join(directory, '.braingames-' + randomUUID() + '.tmp');
    const output = await open(temporary, 'wx', info ? info.mode & 0o777 : 0o600);
    let replaced = false;
    try {
      try {
        await output.writeFile(bom + merged);
        await output.sync();
      } finally { await output.close(); }
      const current = await nullableFile(readFile, destination);
      if (bytes ? !current?.equals(bytes) : current !== null) throw new AgentHookConfigError('config-changed');
      await rename(temporary, destination);
      replaced = true;
    } finally { if (!replaced) await unlink(temporary); }
    return 'installed';
  } finally {
    await lock.close();
    await unlink(lockPath);
  }
}
