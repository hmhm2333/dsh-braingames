import React from 'react';
import {createPixelText} from './runtime/pixel-text.mjs';
import {gameIconUrl} from './runtime/game-icons.mjs';
import {scoreUnit} from './runtime/game-language.mjs';
import {DEFAULT_CHALLENGE_TARGETS} from './games.mjs';
import {CHALLENGE_WORDS, SETTINGS_WORDS, localizedGameCopy, sharedWords} from './ui-copy.mjs';

const h = React.createElement;

export function GameIcon({icon = 'brain'} = {}) {
  return h('img', {width: 20, height: 20, src: gameIconUrl(icon), alt: '', 'aria-hidden': true,
    style: {imageRendering: 'pixelated', flexShrink: 0}});
}

export function PixelPopup({children, modal = false, ...attributes}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const popup = ref.current;
    if (modal) popup.showModal();
    // The invitation subset's thinnest horizontal stroke rasterizes at alpha 24.
    const text = createPixelText(popup, {alphaThreshold: 24});
    text.flush();
    void document.fonts.ready.then(() => text.flush());
    return () => { text.dispose(); if (modal) popup.close(); };
  }, [modal]);
  return h(modal ? 'dialog' : 'aside', {...attributes, ref, className: 'braingames-popup'}, children);
}

function challengeResult(status, locale) {
  const game = localizedGameCopy(status.gameId, locale).game;
  const {score, targetScore} = status;
  return CHALLENGE_WORDS[locale].result(game.title, `${score} ${scoreUnit(game, score)}`, `${targetScore} ${scoreUnit(game, targetScore)}`);
}

export function ChallengePopup({locale, status, onDismiss, onPlay}) {
  const copy = CHALLENGE_WORDS[locale];
  const {game} = localizedGameCopy(status.gameId, locale);
  const pixel = label => h('span', {'data-pixel-text': true}, label);
  const score = (label, value) => h('div', null,
    h('dt', null, pixel(label)),
    h('dd', null, pixel(`${value} ${scoreUnit(game, value)}`)));
  return h(PixelPopup, {modal: true, lang: locale === 'zh' ? 'zh-CN' : 'en',
    'data-braingames-challenge-modal': true, 'aria-labelledby': 'braingames-challenge-title',
    'aria-describedby': 'braingames-challenge-detail',
    onCancel: event => { event.preventDefault(); onDismiss(); }},
  h('h2', {id: 'braingames-challenge-title', className: 'braingames-popup-message'}, h(GameIcon), pixel(copy.locked)),
  h('div', {id: 'braingames-challenge-detail'},
    h('p', {className: 'braingames-challenge-game-name'}, pixel(game.title)),
    h('dl', {className: 'braingames-challenge-scoreboard'},
      score(copy.roundScore, status.score), score(copy.goalScore, status.targetScore)),
    h('p', {className: 'braingames-popup-detail'}, pixel(copy.resume))),
  h('div', {className: 'braingames-popup-actions'},
    h('button', {type: 'button', onClick: onDismiss}, pixel(copy.dismiss)),
    onPlay ? h('button', {type: 'button', 'data-braingames-action': true, onClick: onPlay}, pixel(copy.play)) : null));
}

export const SETTINGS_FIELDS = SETTINGS_WORDS.zh.groups.flatMap(group => group.settings.map(([field]) => field));

function SettingsFeedback({locale, feedback, writable}) {
  const copy = SETTINGS_WORDS[locale];
  return h(React.Fragment, null,
    feedback?.saving ? h('p', {role: 'status'}, copy.saving) : null,
    !writable ? h('p', {role: 'status'}, copy.readOnly) : null,
    feedback?.error ? h('p', {role: 'alert', className: 'braingames-settings-error'}, copy.saveFailed) : null);
}

export function AgentChallengeSettings({locale, catalog, state, saving, feedback, status, failed, onChange, onRefresh, hookConnections, onConnectAgent}) {
  if (state.status !== 'ready') return null;
  const {value, writable} = state;
  const scope = value.agentChallengeScope ?? 'off';
  const targets = value.agentChallengeTargets ?? DEFAULT_CHALLENGE_TARGETS;
  const copy = CHALLENGE_WORDS[locale];
  const current = status?.scope === scope ? status : null;
  const phase = current?.gameId ? (current.locked ? 'locked' : 'unlocked') : (current ? 'waiting' : 'reading');
  const scoreInputs = catalog.map(({id, icon}) => {
    const {game} = localizedGameCopy(id, locale);
    const target = targets[id];
    return h('label', {key: id},
      h('span', {className: 'braingames-challenge-game'}, h(GameIcon, {icon}), h('span', null, game.title)),
      h('input', {
        key: target, type: 'number', inputMode: 'numeric', min: 1, max: Number.MAX_SAFE_INTEGER, step: 1, required: true,
        'data-braingames-target': id, defaultValue: target,
        onBlur: event => {
          const input = event.currentTarget;
          if (input.reportValidity() && input.valueAsNumber !== target) {
            void onChange('agentChallengeTargets', {...targets, [id]: input.valueAsNumber});
          }
        },
        onKeyDown: event => {
          if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
        },
      }), h('span', {className: 'braingames-challenge-unit'}, game.resultUnit));
  });
  const agentRows = scope === 'local' && current ? current.agents.map(agent => {
    const connection = hookConnections.get(agent.id);
    const label = agent.observed ? copy.observed : connection?.result ? copy.written : agent.found ? copy.found : copy.missing;
    const problem = connection?.error ?? (!agent.config ? 'hook-path' : null);
    return h('li', {key: agent.id, 'data-braingames-agent': agent.id},
      h('div', {className: 'braingames-agent-row'},
        h('div', {className: 'braingames-agent-identity'}, h('strong', null, agent.name),
          h('span', {className: 'braingames-agent-status', 'data-verified': agent.observed || undefined}, label)),
        h('button', {type: 'button', className: 'braingames-challenge-button',
          'data-braingames-connect': agent.id, 'aria-label': copy.connect + ' ' + agent.name,
          disabled: !!connection?.pending || !!current.bridgeError || !agent.config,
          onClick: () => void onConnectAgent(agent.id)}, connection?.pending ? copy.connecting : copy.connect)),
      problem ? h('p', {role: 'alert', className: 'braingames-agent-feedback'}, copy.connectErrors[problem] ?? copy.connectErrors['connect-response']) : null,
      connection?.result ? h('p', {role: 'status', className: 'braingames-agent-feedback', 'data-braingames-connect-result': connection.result},
        connection.result === 'installed' ? copy.connectInstalled : copy.connectExisting,
        agent.observed ? null : ' ' + (agent.id === 'codex' ? copy.codexTrust : copy.connectVerify)) : null,
      h('details', {className: 'braingames-agent-details'}, h('summary', null, copy.setup),
        h('code', {className: 'braingames-agent-path'}, agent.file),
        agent.config ? h(React.Fragment, null,
          h('p', {className: 'braingames-setting-note'}, copy.setupNote),
          h('pre', null, JSON.stringify(agent.config, null, 2))) : null));
  }) : [];
  const form = h('fieldset', {className: 'braingames-settings-form braingames-setting braingames-challenge',
    'data-braingames-challenge': true, disabled: !writable || saving},
    h('legend', null, copy.title),
    h('div', {className: 'braingames-setting-options braingames-challenge-scopes'}, ...['off', 'dsh', 'local'].map(mode =>
      h('label', {key: mode}, h('input', {type: 'radio', name: 'braingames-agentChallengeScope', value: mode,
        'data-braingames-setting': 'agentChallengeScope', checked: scope === mode,
        disabled: mode === 'local' && !status?.localAvailable && scope !== 'local',
        onChange: () => void onChange('agentChallengeScope', mode)}), h('span', null, copy[mode])))),
    h('p', {className: 'braingames-setting-note'}, copy.note),
    status?.localAvailable === false ? h('p', {className: 'braingames-setting-note'}, copy.windows) : null,
    failed ? h('p', {role: 'alert', className: 'braingames-agent-feedback'}, copy.readFailed) : null,
    scope !== 'off' && (current || !failed) ? h('div', {role: 'status', className: 'braingames-challenge-status',
      'data-braingames-challenge-state': phase},
      h('strong', null, copy[phase]),
      current?.gameId ? h('span', null, challengeResult(current, locale)) : null) : null,
    scope === 'local' ? h('div', {className: 'braingames-challenge-panel'},
      h('div', {className: 'braingames-challenge-panel-heading'},
        h('h4', null, copy.inventory),
        h('button', {type: 'button', className: 'braingames-challenge-button', onClick: onRefresh}, copy.refresh)),
      current?.bridgeError ? h('p', {role: 'alert', className: 'braingames-agent-feedback'}, copy.bridgeFailed + ' (' + current.bridgeError + ')') : null,
      agentRows.length ? h('ul', {className: 'braingames-agent-list'}, ...agentRows) : null) : null,
    h('fieldset', {className: 'braingames-setting braingames-challenge-panel'}, h('legend', null, copy.target),
      h('div', {className: 'braingames-challenge-targets'}, ...scoreInputs),
      h('p', {className: 'braingames-setting-note'}, copy.saveTarget)));
  return h('section', {className: 'braingames-challenge-options'}, form, h(SettingsFeedback, {locale, feedback, writable}));
}

export function GameSettings({locale, catalog, state, saving, feedback, onChange}) {
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
    h(SettingsFeedback, {locale, feedback, writable})
  );
}
