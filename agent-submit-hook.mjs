import {get} from 'node:http';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function blockReason(locale = Intl.DateTimeFormat().resolvedOptions().locale) {
  return /^zh(?:[-_]|$)/i.test(locale)
    ? 'BrainGames 暂停接收新任务。本局未达标。达到目标成绩并结算，或在插件选项关闭挑战。'
    : 'BrainGames has paused new tasks. Your round missed its target. Meet the target in a new round or turn off the challenge in the plugin settings.';
}

export function agentChallengePipe(key) {
  if (!/^[a-f0-9]{20}$/.test(key)) throw Error('Invalid BrainGames local host ID');
  return '\\\\.\\pipe\\dsh-braingames-' + key;
}

export function queryAgentChallenge(key, agent) {
  return new Promise((resolve, reject) => {
    const request = get({socketPath: agentChallengePipe(key), path: '/check/' + encodeURIComponent(agent)}, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('error', reject);
      response.on('end', () => {
        try {
          if (response.statusCode !== 200) throw Error('BrainGames challenge returned HTTP ' + response.statusCode);
          const {locked} = JSON.parse(body);
          if (typeof locked !== 'boolean') throw Error('Invalid BrainGames challenge status');
          resolve(locked);
        } catch (error) { reject(error); }
      });
    });
    request.setTimeout(1200, () => request.destroy(Error('BrainGames challenge check timed out')));
    request.on('error', error => {
      // An inactive or closed DSH host does not own a local challenge.
      if (error.code === 'ENOENT' || error.code === 'ECONNREFUSED') resolve(false);
      else reject(error);
    });
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const agent = process.argv[3];
    const locked = await queryAgentChallenge(process.argv[2], agent);
    if (agent === 'cursor') {
      console.log(JSON.stringify(locked ? {continue: false, user_message: blockReason()} : {continue: true}));
    } else if (locked) {
      console.log(JSON.stringify({decision: 'block', reason: blockReason()}));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
