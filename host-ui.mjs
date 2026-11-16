import React from 'react';
import {createPixelText} from './runtime/pixel-text.mjs';
import {gameIconUrl} from './runtime/game-icons.mjs';
import {SETTINGS_WORDS, localizedGameCopy, sharedWords} from './ui-copy.mjs';

const h = React.createElement;

export function GameIcon({icon = 'brain'} = {}) {
  return h('img', {width: 20, height: 20, src: gameIconUrl(icon), alt: '', 'aria-hidden': true,
    style: {imageRendering: 'pixelated', flexShrink: 0}});
}

export function PixelPopup({children, ...attributes}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    // The invitation subset's thinnest horizontal stroke rasterizes at alpha 24.
    const text = createPixelText(ref.current, {alphaThreshold: 24});
    text.flush();
    void document.fonts.ready.then(() => text.flush());
    return text.dispose;
  }, []);
  return h('aside', {...attributes, ref, className: 'braingames-popup'}, children);
}

export const SETTINGS_FIELDS = SETTINGS_WORDS.zh.groups.flatMap(group => group.settings.map(([field]) => field));

export function GameSettings({locale, catalog, state, saving, error, onChange}) {
  const {value, writable} = state;
  const copy = SETTINGS_WORDS[locale];
  if (state.status !== 'ready') {
    return h('p', {role: 'status'}, state.status === 'loading' ? copy.loading : copy.unavailable);
  }
  return h('section', {'data-braingames-settings': true},
    h('fieldset', {className: 'braingames-settings-form', disabled: !writable || saving},
      h('legend', null, copy.title),
      h('p', {className: 'braingames-setting-note'}, sharedWords(locale).openingGuide),
      h('h4', null, copy.pool),
      h('div', {className: 'braingames-game-pool'}, ...catalog.map(game =>
        h('label', {key: game.id},
          h('input', {
            type: 'checkbox', 'data-braingames-game': game.id, checked: value.enabledGames.includes(game.id),
            onChange: event => {
              const ids = event.target.checked ? [...value.enabledGames, game.id] : value.enabledGames.filter(id => id !== game.id);
              void onChange('enabledGames', ids);
            }
          }),
          h(GameIcon, {icon: game.icon}), localizedGameCopy(game.id,locale).game.title)
      )),
      h('p', {className: 'braingames-setting-note'}, copy.poolNote),
      ...copy.groups.map(group => h('div', {key: group.title, className: 'braingames-settings-group'},
        h('h4', null, group.title),
        ...group.settings.map(([field, label, on, off, note]) =>
          h('fieldset', {key: field, className: 'braingames-setting'},
            h('legend', null, label),
            h('div', {className: 'braingames-setting-options'},
              off === null ? h('label', null,
                h('input', {
                  type: 'checkbox', 'data-braingames-setting': field, checked: value[field] === true,
                  onChange: event => { void onChange(field, event.target.checked); }
                }), h('span', null, on)
              ) : [[true, on], [false, off]].map(([enabled, text]) =>
                h('label', {key: String(enabled)},
                  h('input', {
                    type: 'radio', name: 'braingames-' + field, value: String(enabled),
                    'data-braingames-setting': field, checked: value[field] === enabled,
                    onChange: () => { void onChange(field, enabled); }
                  }), h('span', null, text))
              )
            ),
            note ? h('p', {className: 'braingames-setting-note'}, note) : null
          )
        )
      ))
    ),
    saving ? h('p', {role: 'status'}, copy.saving) : null,
    !writable ? h('p', {role: 'status'}, copy.readOnly) : null,
    error ? h('p', {role: 'alert', className: 'braingames-settings-error'}, copy.saveFailed) : null
  );
}
