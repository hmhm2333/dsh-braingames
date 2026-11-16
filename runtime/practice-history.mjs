import {DECISION_COLUMNS, LEGACY_COLUMNS, PRACTICE_BLOCK_ROWS, PRACTICE_TRACE_VERSION, isPracticeCount, isPracticeId, validPracticeBlock} from './practice-schema.mjs';

function newRoundId() {
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), value =>
    value.toString(16).padStart(8, '0')).join('');
}

function restoreTrace(gameId, saved, columns) {
  const {trace, decisions} = saved ?? {};
  if (trace) {
    const {parts, events, partial, rows} = trace;
    if (trace.version !== PRACTICE_TRACE_VERSION || !isPracticeCount(parts) || !isPracticeCount(events) ||
        typeof partial !== 'boolean' || !Array.isArray(rows) || rows.length > PRACTICE_BLOCK_ROWS ||
        rows.length > events || events - rows.length !== parts * PRACTICE_BLOCK_ROWS ||
        (rows.length && !validPracticeBlock(gameId, {version: trace.version, columns, rows, truncated: false}))) {
      throw Error('保存的判定记录无法读取');
    }
    return {parts, events, partial, rows: rows.slice()};
  }
  if (decisions && LEGACY_COLUMNS[gameId]) {
    const previous = LEGACY_COLUMNS[gameId];
    if (!validPracticeBlock(gameId, {...decisions, columns: previous}) || decisions.version !== 1) {
      throw Error('保存的判定记录无法读取');
    }
    const rows = decisions.rows.map(row => columns.map(column => row[previous.indexOf(column)] ?? null));
    return {parts: 0, events: rows.length, partial: decisions.truncated, rows};
  }
  return {parts: 0, events: 0, partial: (saved?.activeMs ?? 0) > 0, rows: []};
}

export function createPracticeTracker({gameId, rules, write, writePart, saved, now = () => performance.now()}) {
  if (saved && (!isPracticeId(saved.id) || !Number.isFinite(saved.activeMs) || saved.activeMs < 0)) {
    throw Error('保存的练习计时无法读取');
  }
  const columns = DECISION_COLUMNS[gameId];
  const resumedRules = saved?.rules === rules ? rules : null;
  let round = saved ? {id: saved.id, activeMs: saved.activeMs, rules: resumedRules,
    startedAt: isPracticeCount(saved.startedAt) ? saved.startedAt : null} : null;
  let trace = saved && resumedRules !== null ? restoreTrace(gameId, saved, columns) : null;
  let started = null;

  const elapsed = () => round.activeMs + (started === null ? 0 : now() - started);

  function flush() {
    if (!trace?.rows.length) return;
    const {rows} = trace;
    const part = trace.parts++;
    trace.rows = [];
    writePart({
      id: round.id, gameId, rules: round.rules, part, first: trace.events - rows.length,
      log: {version: PRACTICE_TRACE_VERSION, columns, rows, truncated: false}
    });
  }

  function setPlaying(playing) {
    if (playing) {
      if (started !== null) return;
      round ??= {id: newRoundId(), activeMs: 0, rules, startedAt: Date.now()};
      trace ??= restoreTrace(gameId, null, columns);
      started = now();
      if (trace.rows.length === PRACTICE_BLOCK_ROWS) flush();
    } else if (started !== null) {
      round.activeMs = elapsed();
      started = null;
    }
  }

  function recordDecision(event) {
    if (!round || round.rules !== rules) return;
    trace ??= restoreTrace(gameId, null, columns);
    const row = columns.map(column => {
      const value = column === 'atMs' ? event.atMs ?? elapsed() : event[column];
      return typeof value === 'number' ? Math.round(value) : value ?? null;
    });
    trace.rows.push(row);
    trace.events++;
    if (trace.rows.length === PRACTICE_BLOCK_ROWS) flush();
  }

  function finish({score, level, correct = null, attempts = null}) {
    if (!round) return;
    setPlaying(false);
    flush();
    const record = {
      ...round, gameId, score, level, correct, attempts,
      activeMs: Math.round(round.activeMs), finishedAt: Date.now(),
      trace: trace && round.rules !== null ? {parts: trace.parts, events: trace.events, partial: trace.partial} : null
    };
    clear();
    write(record);
  }

  function clear() {
    round = null;
    started = null;
    trace = null;
  }

  return {
    setPlaying, recordDecision, finish,
    reset() { flush(); clear(); },
    checkpoint: () => round ? {
      ...round, activeMs: elapsed(),
      ...(trace && round.rules !== null ? {trace: {version: PRACTICE_TRACE_VERSION, ...trace}} : {})
    } : null
  };
}
