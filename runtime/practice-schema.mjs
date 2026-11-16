export const PRACTICE_BLOCK_ROWS = 512;
export const PRACTICE_TRACE_VERSION = 2;

export const LEGACY_COLUMNS = {
  'rice-bubbles-g10': ['atMs', 'level', 'material', 'outcome', 'responseMs'],
  'regulars-g04': ['atMs', 'level', 'guest', 'kind', 'outcome', 'responseMs', 'gapVisits', 'independent']
};

export const DECISION_COLUMNS = {
  'rice-bubbles-g10': [...LEGACY_COLUMNS['rice-bubbles-g10'], 'foodId'],
  'regulars-g04': [...LEGACY_COLUMNS['regulars-g04'], 'ordered', 'chosen', 'teaching'],
  'planks-g02': ['atMs', 'level', 'outcome', 'responseMs', 'family', 'rotation', 'load', 'complexity', 'assisted', 'answer', 'selected'],
  'balloon-winds': ['atMs', 'level', 'outcome', 'responseMs', 'puzzle', 'wind', 'direction', 'windX', 'windY', 'x', 'y', 'targetX', 'targetY'],
  'fish-leap': ['atMs', 'level', 'outcome', 'responseMs', 'fishId', 'kind', 'cooldownMs']
};

export const isPracticeId = id => typeof id === 'string' && /^[0-9a-f]{32}$/.test(id);
export const isPracticeCount = value => Number.isSafeInteger(value) && value >= 0;
export const isPracticeRules = value => value === null || (typeof value === 'string' && /^[0-9A-Za-z_-]{43}$/.test(value));

export function validPracticeBlock(gameId, log) {
  const columns = log?.version === 1 ? LEGACY_COLUMNS[gameId] :
    log?.version === PRACTICE_TRACE_VERSION ? DECISION_COLUMNS[gameId] : null;
  return Array.isArray(columns) && Array.isArray(log.columns) && log.columns.length === columns.length &&
    columns.every((column, index) => log.columns[index] === column) &&
    typeof log.truncated === 'boolean' && Array.isArray(log.rows) &&
    log.rows.length > 0 && log.rows.length <= PRACTICE_BLOCK_ROWS &&
    log.rows.every(row => Array.isArray(row) && row.length === columns.length && row.every(value =>
      value === null || typeof value === 'boolean' || Number.isSafeInteger(value) ||
      (typeof value === 'string' && value.length <= 80)));
}
