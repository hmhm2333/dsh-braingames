import {validPracticeBackupEntry} from './practice-store.mjs';

const HEADER = {type: 'dsh-braingames-practice', version: 1};
const MAX_LINE = 1024 * 1024;
const IMPORT_BATCH = 24;

function backupError(code, message, options) {
  return Object.assign(new Error(message, options), {code});
}

async function* backupLines(store) {
  yield HEADER;
  let rounds = 0;
  let parts = 0;
  for await (const entry of store.backupEntries()) {
    if (entry.type === 'round') rounds++;
    else parts++;
    yield entry;
  }
  yield {type: 'end', rounds, parts};
}

export function exportPracticeBackup(store) {
  const lines = backupLines(store);
  const text = new ReadableStream({
    async pull(controller) {
      const {value, done} = await lines.next();
      if (done) controller.close();
      else controller.enqueue(JSON.stringify(value) + '\n');
    },
    cancel: () => lines.return()
  });
  return new Response(text.pipeThrough(new TextEncoderStream()).pipeThrough(new CompressionStream('gzip'))).blob();
}

async function* linesFrom(file) {
  const reader = file.stream().pipeThrough(new DecompressionStream('gzip'))
    .pipeThrough(new TextDecoderStream('utf-8', {fatal: true})).getReader();
  let buffered = '';
  let finished = false;
  try {
    for (;;) {
      const {value, done} = await reader.read();
      if (done) {
        finished = true;
        if (buffered) throw backupError('incomplete', '备份文件结尾不完整');
        break;
      }
      buffered += value;
      let offset = 0;
      for (let end = buffered.indexOf('\n', offset); end !== -1; end = buffered.indexOf('\n', offset)) {
        if (end - offset > MAX_LINE) throw backupError('line-too-large', '备份文件中的单条记录过大');
        yield buffered.slice(offset, end);
        offset = end + 1;
      }
      buffered = buffered.slice(offset);
      if (buffered.length > MAX_LINE) throw backupError('line-too-large', '备份文件中的单条记录过大');
    }
  } finally {
    try {
      if (!finished) await reader.cancel();
    } finally {
      reader.releaseLock();
    }
  }
}

async function* checkedEntries(file) {
  let header = false;
  let ended = false;
  let rounds = 0;
  let parts = 0;
  for await (const line of linesFrom(file)) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch (cause) {
      throw backupError('invalid-json', '备份文件中的记录无法解析', {cause});
    }
    if (!header) {
      if (entry?.type !== HEADER.type || entry.version !== HEADER.version) throw backupError('unsupported-version', '备份文件版本不支持');
      header = true;
    } else if (ended) {
      throw backupError('trailing-records', '备份文件结尾有多余记录');
    } else if (entry?.type === 'end') {
      if (entry.rounds !== rounds || entry.parts !== parts) throw backupError('record-count', '备份文件的记录数量不符');
      ended = true;
    } else {
      if (!validPracticeBackupEntry(entry)) throw backupError('invalid-record', '备份文件中的成绩或判定记录有误');
      if (entry.type === 'round') rounds++;
      else parts++;
      yield entry;
    }
  }
  if (!ended) throw backupError('incomplete', '备份文件不完整');
}

export async function importPracticeBackup(store, file) {
  // Validate the entire stream before inserting any user data.
  for await (const entry of checkedEntries(file)) void entry;
  const added = {rounds: 0, parts: 0};
  let batch = [];
  async function commit() {
    if (!batch.length) return;
    const result = await store.mergeBackup(batch);
    added.rounds += result.rounds;
    added.parts += result.parts;
    batch = [];
  }
  try {
    for await (const entry of checkedEntries(file)) {
      batch.push(entry);
      if (batch.length === IMPORT_BATCH) await commit();
    }
    await commit();
  } catch (cause) {
    if (added.rounds || added.parts) {
      throw backupError('partial-import', '备份只导入了一部分，再次导入可继续', {cause});
    }
    throw cause;
  }
  return added;
}
