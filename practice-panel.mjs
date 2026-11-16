import React from 'react';
import {scoreUnit} from './runtime/game-language.mjs';
import {RANK_WORDS, localizedGameCopy} from './ui-copy.mjs';
import {PracticeBackup} from './practice-backup-panel.mjs';

const h = React.createElement;
const timeFormats = {
  zh: new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }),
  en: new Intl.DateTimeFormat('en', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  })
};

export function PracticePanel({locale, catalog, store, revision, rules, storageError, onImported}) {
  const copy = RANK_WORDS[locale];
  const [expanded, setExpanded] = React.useState(false);
  const [gameId, selectGame] = React.useState(catalog[0].id);
  const tabsId = React.useId();
  const dialog = React.useRef(null);
  const [rank, setRank] = React.useState(null);
  React.useEffect(() => {
    if (!expanded) return;
    let current = true;
    void store.readRank(gameId, rules[gameId]).then(data => {
      if (current) setRank({gameId, revision, ...data});
    }, error => {
      console.error('个人榜读取失败', error);
      if (current) setRank({gameId, revision, unavailable: true, records: []});
    });
    return () => { current = false; };
  }, [expanded, gameId, revision, rules, store]);
  const data = rank?.gameId === gameId && rank.revision === revision ? rank : null;
  const results = data?.records ?? [];
  const gameCopy = localizedGameCopy(gameId, locale).game;

  function onTabKey(event, index) {
    const last = catalog.length - 1;
    let next;
    switch (event.key) {
      case 'ArrowLeft': next = index === 0 ? last : index - 1; break;
      case 'ArrowRight': next = index === last ? 0 : index + 1; break;
      case 'Home': next = 0; break;
      case 'End': next = last; break;
      default: return;
    }
    event.preventDefault();
    event.stopPropagation();
    selectGame(catalog[next].id);
    event.currentTarget.parentElement.children[next].focus();
  }

  const scores = results.length > 0
    ? h('table', {className: 'braingames-practice-results', 'data-practice-rank': true},
      h('thead', null, h('tr', null, h('th', {scope: 'col'}, copy.score), h('th', {scope: 'col'}, copy.completed))),
      h('tbody', null, results.map(record =>
        h('tr', {key: record.id},
          h('td', null, h('strong', {'data-practice-score': gameId}, record.score + ' ' + scoreUnit(gameCopy, record.score))),
          h('td', null, h('time', {dateTime: new Date(record.finishedAt).toISOString()}, timeFormats[locale].format(record.finishedAt)))
        )
      ))
    )
    : !data
      ? h('p', {className: 'braingames-practice-empty', role: 'status'}, copy.loading)
      : !data.unavailable && h('p', {className: 'braingames-practice-empty'}, copy.empty);

  function showLeaderboard() {
    dialog.current.showModal();
    setExpanded(true);
  }

  return h('div', {'data-braingames-practice': true},
    h('button', {
      type: 'button', className: 'braingames-practice-trigger', onClick: showLeaderboard,
      'aria-haspopup': 'dialog', 'aria-controls': tabsId + '-dialog'
    }, copy.open, h('span', {'aria-hidden': true}, '›')),
    h('dialog', {
      ref: dialog, id: tabsId + '-dialog', className: 'braingames-practice-dialog',
      'aria-labelledby': tabsId + '-title', onClose: () => { setExpanded(false); setRank(null); },
      onClick: event => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }
    },
      h('div', {className: 'braingames-practice-content'},
        h('header', {className: 'braingames-practice-header'},
          h('h2', {id: tabsId + '-title'}, copy.title),
          h('button', {
            type: 'button', className: 'braingames-practice-close',
            'aria-label': copy.close, onClick: () => dialog.current.close()
          }, '×')
        ),
        expanded && h('div', {className: 'braingames-practice-body'},
          h('div', {className: 'braingames-practice-tabs', role: 'tablist', 'aria-label': copy.games},
            catalog.map((game, index) => {
              const selected = game.id === gameId;
              const label = localizedGameCopy(game.id, locale).game;
              return h('button', {
                key: game.id, type: 'button', role: 'tab',
                id: tabsId + '-tab-' + game.id, 'aria-controls': tabsId + '-panel-' + game.id,
                'aria-selected': selected, tabIndex: selected ? 0 : -1,
                'aria-label': label.title, title: label.title,
                onClick: () => selectGame(game.id), onKeyDown: event => onTabKey(event, index)
              }, locale === 'en' ? label.shortTitle : label.title);
            })
          ),
          data?.unavailable && h('p', {role: 'status'}, copy.unavailable),
          data?.damaged && h('p', {role: 'status'}, copy.damaged),
          catalog.map(game => {
            const selected = game.id === gameId;
            return h('div', {
              key: game.id, role: 'tabpanel', hidden: !selected, tabIndex: selected ? 0 : -1,
              id: tabsId + '-panel-' + game.id, 'aria-labelledby': tabsId + '-tab-' + game.id
            }, selected && scores);
          })
        )
      )
    ),
    h(PracticeBackup, {locale, store, storageError, onImported})
  );
}
