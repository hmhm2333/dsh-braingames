import {isPracticeCount, isPracticeId, isPracticeRules, validPracticeBlock} from './runtime/practice-schema.mjs';
import {compressInteractionLog, decompressInteractionLog} from './interaction-store.mjs';

export const PRACTICE_PREFIX = 'braingames.practice.v2.';
export const LEGACY_PRACTICE_PREFIX = 'braingames.practice.v1.';
const DATABASE = 'dsh-braingames-practice';
const LEGACY_DATABASE = 'dsh-braingames-interactions';
const SUMMARIES = 'summaries';
const CHUNKS = 'chunks';
const META = 'meta';
const LEGACY_MIGRATION = 'legacy-import';
const MAX_DATE = 8.64e15;
const PAGE_SIZE = 32;

const validDate = value => isPracticeCount(value) && value <= MAX_DATE;
const validGameId = value => typeof value === 'string' && /^[a-z0-9-]{1,64}$/.test(value);

export function validPracticeSummary(row) {
  return !!row && isPracticeId(row.id) && validGameId(row.gameId) && isPracticeRules(row.rules) &&
    validDate(row.finishedAt) && (row.startedAt === null || validDate(row.startedAt)) &&
    isPracticeCount(row.activeMs) && isPracticeCount(row.score) &&
    (row.level === null || isPracticeCount(row.level) && row.level > 0) &&
    (row.correct === null && row.attempts === null ||
      isPracticeCount(row.correct) && isPracticeCount(row.attempts) && row.correct <= row.attempts) &&
    (row.trace === null || isPracticeCount(row.trace?.parts) && isPracticeCount(row.trace.events) &&
      row.trace.parts <= row.trace.events && typeof row.trace.partial === 'boolean');
}

function decodeLegacySummary(key, raw) {
  const legacy = key.startsWith(LEGACY_PRACTICE_PREFIX);
  const id = key.slice((legacy ? LEGACY_PRACTICE_PREFIX : PRACTICE_PREFIX).length);
  if (!isPracticeId(id)) return null;
  let value;
  try {
    value = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
  let row;
  if (legacy && value?.id === id && Number.isFinite(value.activeMs) && value.activeMs >= 0) {
    const {gameId, finishedAt, activeMs, score} = value;
    row = {id, gameId, rules: null, finishedAt, activeMs: Math.round(activeMs), score,
      level: null, correct: null, attempts: null};
  } else if (!legacy && Array.isArray(value) && value.length === 8) {
    const [gameId, rules, finishedAt, activeMs, score, level, correct, attempts] = value;
    row = {id, gameId, rules, finishedAt, activeMs, score, level, correct, attempts};
  }
  if (!row) return null;
  row.startedAt = null;
  row.trace = null;
  return validPracticeSummary(row) ? row : null;
}

export function readLegacyPractice(storage) {
  const records = new Map();
  let damaged = false;
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(PRACTICE_PREFIX) && !key?.startsWith(LEGACY_PRACTICE_PREFIX)) continue;
    const raw = storage.getItem(key);
    if (raw === null) continue;
    const record = decodeLegacySummary(key, raw);
    if (!record) damaged = true;
    else if (!records.has(record.id) || key.startsWith(PRACTICE_PREFIX)) records.set(record.id, record);
  }
  return {records: [...records.values()], damaged};
}

function openDatabase(factory, name, create) {
  return new Promise((resolve, reject) => {
    const request = create ? factory.open(name, 1) : factory.open(name);
    let missing = false;
    let blocked = false;
    request.onupgradeneeded = () => {
      if (create) create(request.result);
      else {
        missing = true;
        request.transaction.abort();
      }
    };
    request.onblocked = () => {
      blocked = true;
      reject(Error('记录数据库正被另一个窗口占用'));
    };
    request.onerror = () => missing ? resolve(null) : reject(request.error);
    request.onsuccess = () => {
      if (blocked) request.result.close();
      else resolve(request.result);
    };
  });
}

function createSchema(db) {
  const summaries = db.createObjectStore(SUMMARIES, {keyPath: 'id'});
  summaries.createIndex('rank', ['gameId', 'rules', 'rankScore', 'finishedAt']);
  summaries.createIndex('gameAndTime', ['gameId', 'finishedAt']);
  db.createObjectStore(CHUNKS, {keyPath: ['id', 'part']});
  db.createObjectStore(META);
}

function runTransaction(db, stores, mode, run) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    let value;
    tx.oncomplete = () => resolve(value);
    tx.onabort = () => reject(tx.error ?? Error('记录保存已中止'));
    try {
      run(tx, result => { value = result; });
    } catch (error) {
      tx.abort();
      reject(error);
    }
  });
}

function readRequest(db, store, request) {
  return runTransaction(db, store, 'readonly', (tx, done) => {
    const query = request(tx.objectStore(store));
    query.onsuccess = () => done(query.result);
  });
}

function insertNew(store, row, inserted) {
  const request = store.add(row);
  request.onsuccess = inserted;
  request.onerror = event => {
    // The key is the idempotency token for a restored write or backup import.
    if (request.error.name === 'ConstraintError') event.preventDefault();
  };
}

function indexedSummary(record) {
  return {...record, rankScore: -record.score};
}

function publicSummary({rankScore, ...record}) {
  return record;
}

async function migrateLegacy(db, factory, getStorage) {
  if (await readRequest(db, META, store => store.get(LEGACY_MIGRATION))) return;
  const {records, damaged} = readLegacyPractice(getStorage());
  const prior = await openDatabase(factory, LEGACY_DATABASE);
  let chunks = [];
  if (prior) {
    try {
      chunks = await readRequest(prior, 'rounds', store => store.getAll());
    } finally {
      prior.close();
    }
  }
  const validChunks = chunks.filter(row => row && isPracticeId(row.id) && validGameId(row.gameId) &&
    isPracticeRules(row.rules) && row.gzipJson instanceof ArrayBuffer);
  await runTransaction(db, [SUMMARIES, CHUNKS, META], 'readwrite', tx => {
    const meta = tx.objectStore(META);
    const marker = meta.get(LEGACY_MIGRATION);
    marker.onsuccess = () => {
      if (marker.result) return;
      const summaries = tx.objectStore(SUMMARIES);
      for (const record of records) summaries.add(indexedSummary(record));
      const blocks = tx.objectStore(CHUNKS);
      for (const {id, gameId, rules, gzipJson} of validChunks) {
        blocks.add({id, gameId, rules, part: 0, first: 0, gzipJson});
      }
      meta.add({damaged: damaged || validChunks.length !== chunks.length}, LEGACY_MIGRATION);
    };
  });
}

const validPart = row => !!row && isPracticeId(row.id) && validGameId(row.gameId) &&
  isPracticeRules(row.rules) && isPracticeCount(row.part) && isPracticeCount(row.first);

const partRange = id => IDBKeyRange.bound([id, 0], [id, Infinity]);

async function encodePart({log, ...part}) {
  if (!validPart(part) || !validPracticeBlock(part.gameId, log)) throw TypeError('练习判定记录格式无效');
  return {...part, gzipJson: await compressInteractionLog(log)};
}

async function decodePart({gzipJson, ...part}) {
  const log = await decompressInteractionLog(gzipJson);
  if (!validPracticeBlock(part.gameId, log)) throw Error('练习判定记录无法读取');
  return {...part, log};
}

export function createPracticeStore({getStorage = () => localStorage, getFactory = () => indexedDB} = {}) {
  let opened;
  function database() {
    opened ??= (async () => {
      const factory = getFactory();
      const db = await openDatabase(factory, DATABASE, createSchema);
      db.onversionchange = () => { db.close(); opened = undefined; };
      try {
        await migrateLegacy(db, factory, getStorage);
        return db;
      } catch (error) {
        db.close();
        throw error;
      }
    })().catch(error => { opened = undefined; throw error; });
    return opened;
  }

  async function putMissing(summaries, chunks) {
    const db = await database();
    return runTransaction(db, [SUMMARIES, CHUNKS], 'readwrite', (tx, done) => {
      const added = {rounds: 0, parts: 0};
      done(added);
      const rounds = tx.objectStore(SUMMARIES);
      for (const row of summaries) insertNew(rounds, indexedSummary(row), () => { added.rounds++; });
      const blocks = tx.objectStore(CHUNKS);
      for (const row of chunks) insertNew(blocks, row, () => { added.parts++; });
    });
  }

  async function* entries(store, lower, upper) {
    const db = await database();
    let after = lower;
    let exclusive = false;
    for (;;) {
      const range = upper !== undefined ? IDBKeyRange.bound(after, upper, exclusive) :
        after === undefined ? undefined : IDBKeyRange.lowerBound(after, exclusive);
      const rows = await readRequest(db, store, target => target.getAll(range, PAGE_SIZE));
      for (const row of rows) yield row;
      if (rows.length < PAGE_SIZE) break;
      const last = rows.at(-1);
      after = store === CHUNKS ? [last.id, last.part] : last.id;
      exclusive = true;
    }
  }

  return {
    async save(record) {
      if (!validPracticeSummary(record)) throw TypeError('练习记录的结算数据不完整');
      return (await putMissing([record], [])).rounds === 1;
    },
    async savePart(part) {
      return (await putMissing([], [await encodePart(part)])).parts === 1;
    },
    async readRank(gameId, rules) {
      const db = await database();
      const range = IDBKeyRange.bound([gameId, rules, -Infinity], [gameId, rules, Infinity]);
      const [records, migration] = await Promise.all([
        readRequest(db, SUMMARIES, store => store.index('rank').getAll(range, 10)),
        readRequest(db, META, store => store.get(LEGACY_MIGRATION))
      ]);
      return {records: records.map(publicSummary), damaged: migration.damaged};
    },
    async readRound(id) {
      const db = await database();
      const [record, availableParts] = await Promise.all([
        readRequest(db, SUMMARIES, store => store.get(id)),
        readRequest(db, CHUNKS, store => store.count(partRange(id)))
      ]);
      let complete = null;
      if (record?.trace) complete = !record.trace.partial && availableParts === record.trace.parts;
      else if (availableParts) {
        const first = await readRequest(db, CHUNKS, store => store.get([id, 0]));
        if (first) complete = !((await decodePart(first)).log.truncated);
      }
      return {record: record ? publicSummary(record) : null, availableParts, complete};
    },
    async *readParts(id) {
      for await (const row of entries(CHUNKS, [id, 0], [id, Infinity])) yield await decodePart(row);
    },
    async *backupEntries() {
      for await (const row of entries(SUMMARIES)) yield {type: 'round', record: publicSummary(row)};
      for await (const row of entries(CHUNKS)) yield {type: 'part', part: await decodePart(row)};
    },
    async mergeBackup(batch) {
      const summaries = batch.filter(item => item.type === 'round').map(item => item.record);
      const chunks = await Promise.all(batch.filter(item => item.type === 'part').map(item => encodePart(item.part)));
      return putMissing(summaries, chunks);
    }
  };
}

export function validPracticeBackupEntry(entry) {
  if (entry?.type === 'round') return validPracticeSummary(entry.record);
  if (entry?.type === 'part') return validPart(entry.part) && validPracticeBlock(entry.part.gameId, entry.part.log);
  return false;
}
