import {validPracticeBackupEntry} from './practice-store.mjs';

const PENDING_KEY = 'braingames.practice.pending.v1';
const nextTask = () => new Promise(resolve => setTimeout(resolve, 0));

export function createPracticeWriter({store, onChange}) {
  const pending = new Map();
  let partQueue = Promise.resolve();

  function queue(entry) {
    const key = entry.type === 'round' ? entry.record.id + ':round' : entry.part.id + ':' + entry.part.part;
    if (pending.has(key)) return;
    pending.set(key, entry);

    const save = async () => {
      await nextTask();
      if (entry.type === 'round') return store.save(entry.record);
      return store.savePart(entry.part);
    };
    const job = entry.type === 'round' ? save() : partQueue.then(save);
    if (entry.type === 'part') partQueue = job.then(() => undefined, () => undefined);
    void job.then(changed => {
      pending.delete(key);
      if (changed && entry.type === 'round') onChange(null);
    }, error => {
      pending.delete(key);
      onChange(error);
    });
  }

  return {
    save: record => queue({type: 'round', record}),
    savePart: part => queue({type: 'part', part}),
    savePending(storage) {
      if (pending.size) storage.setItem(PENDING_KEY, JSON.stringify([...pending.values()]));
      else storage.removeItem(PENDING_KEY);
    },
    resumePending(storage) {
      const raw = storage.getItem(PENDING_KEY);
      if (!raw) return;
      const entries = JSON.parse(raw);
      if (!Array.isArray(entries) || !entries.every(validPracticeBackupEntry)) {
        throw Error('尚未写入的练习记录无法读取');
      }
      for (const entry of entries) queue(entry);
      // Keep the previous copy until pagehide can replace it with the remaining writes.
    }
  };
}
