import React from 'react';
import {exportPracticeBackup, importPracticeBackup} from './practice-backup.mjs';
import {BACKUP_WORDS} from './ui-copy.mjs';

const h = React.createElement;

export function PracticeBackup({locale, store, storageError, onImported}) {
  const copy = BACKUP_WORDS[locale];
  const input = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState(null);

  async function exportBackup() {
    setBusy(true);
    setStatus({key: 'preparing'});
    try {
      const blob = await exportPracticeBackup(store);
      const url = URL.createObjectURL(blob);
      const download = document.createElement('a');
      download.download = 'dsh-braingames-' + new Date().toISOString().slice(0, 10) + '.jsonl.gz';
      download.href = url;
      download.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setStatus({key: 'ready'});
    } catch (error) {
      console.error('备份导出失败', error);
      setStatus({key: 'exportFailed'});
    } finally {
      setBusy(false);
    }
  }

  async function importBackup(event) {
    const input = event.currentTarget;
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    setBusy(true);
    setStatus({key: 'checking'});
    try {
      const {rounds, parts} = await importPracticeBackup(store, file);
      if (rounds || parts) {
        onImported();
        setStatus({key: 'saved', rounds, parts});
      } else setStatus({key: 'duplicate'});
    } catch (error) {
      console.error('备份导入失败', error);
      setStatus(error.name === 'QuotaExceededError' ? {key: 'quota'} :
        {key: 'importFailed', code: error.code, detail: error.message});
      onImported();
    } finally {
      setBusy(false);
    }
  }

  function statusText() {
    if (!status) return '';
    if (status.key === 'saved') return copy.saved(status.rounds, status.parts);
    if (status.key === 'importFailed') {
      if (locale === 'zh') return copy.importFailed + status.detail;
      if (status.code === 'partial-import') return copy.partial;
    }
    return copy[status.key];
  }

  return h(React.Fragment, null,
    h('details', {className: 'braingames-practice-backup'},
      h('summary', null, copy.title),
      h('div', {className: 'braingames-practice-backup-actions'},
        h('button', {type: 'button', className: 'braingames-practice-trigger', disabled: busy, onClick: exportBackup}, copy.export),
        h('button', {type: 'button', className: 'braingames-practice-trigger', disabled: busy, onClick: () => input.current.click()}, copy.import),
        h('input', {ref: input, type: 'file', hidden: true, accept: '.gz,application/gzip', onChange: importBackup,
          'aria-label': copy.choose})
      ),
      status && h('p', {role: 'status'}, statusText())
    ),
    storageError && h('p', {role: 'status', className: 'braingames-settings-error braingames-practice-note'}, storageError)
  );
}
