import {SHARED_COPY} from './game-catalog.mjs';
import {LOBBY_CARD_WIDTH,LOBBY_COMPANION_SIZE} from './presentation.mjs';

// Shared layout, titles, settlement labels and input cues in the game panels.
export function mountControlGuide(root, {title, control}, shared = SHARED_COPY) {
  for (const heading of root.querySelectorAll('[data-braingames-title]')) heading.textContent = title;
  for (const label of root.querySelectorAll('[data-braingames-copy]')) {
    label.textContent = shared[label.dataset.braingamesCopy];
  }
  for (const guide of root.querySelectorAll('[data-braingames-controls]')) {
    const input = guide.dataset.braingamesControls;
    const text = control[input];
    if (input === 'space') {
      const key = document.createElement('kbd');
      key.dataset.pixelText = '';
      key.textContent = text;
      guide.replaceChildren(key);
      continue;
    }
    const left = input === 'left';
    const symbol = guide.dataset.controlSign;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', symbol ? '0 0 20 12' : '0 0 10 12');
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', symbol ? text : left ? shared.mouseLeft : shared.mouseRight);
    svg.innerHTML = '<path fill="#263248" d="M2 0h6v1h1v1h1v8H9v1H8v1H2v-1H1v-1H0V2h1V1h1z"/>' +
      '<path fill="#fff8e4" d="M2 1h6v1h1v8H8v1H2v-1H1V2h1z"/>' +
      '<path fill="#b67945" d="' + (left ? 'M2 1h2v4H1V2h1z' : 'M6 1h2v1h1v3H6z') + '"/>' +
      '<path fill="#263248" d="M4 1h2v4H4zM1 5h8v1H1z"/>' +
      (symbol ? '<path fill="#263248" d="' + (symbol === 'plus' ? 'M16 3h1v2h2v2h-2v2h-1V7h-3V5h3z' : 'M13 5h6v2h-6z') + '"/>' : '');
    guide.replaceChildren(svg);
    if (symbol) continue;
    const label = document.createElement('span');
    label.dataset.pixelText = '';
    label.textContent = text;
    guide.append(label);
  }

  if (root.querySelector('style[data-braingames-guide-style]')) return;
  const style = document.createElement('style');
  style.dataset.braingamesGuideStyle = '';
  style.textContent = `
    :host { --lobby-card-width: ${LOBBY_CARD_WIDTH}px; --lobby-companion-size: ${LOBBY_COMPANION_SIZE}px; }
    [aria-labelledby="game-title"] {
      display: flex; flex-direction: column; min-height: 328px; padding: 20px;
    }
    [data-opening-guide] { display: grid; align-content: center; flex: 1; }
    [data-braingames-lobby] {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      display: grid; grid-template-columns: var(--lobby-card-width) var(--lobby-companion-size);
      align-items: center; pointer-events: none;
    }
    [data-braingames-lobby] > section {
      position: relative; inset: auto; transform: none;
      width: var(--lobby-card-width); grid-area: 1 / 1;
    }
    [data-braingames-lobby] > canvas {
      width: var(--lobby-companion-size); height: var(--lobby-companion-size); grid-area: 1 / 2;
    }
    [data-braingames-lobby] > :is([role="alert"], [role="status"]) {
      grid-column: 1 / -1; justify-self: center;
    }
    [data-compact] > [data-braingames-lobby] {
      height: min(400px, calc(100% - 24px));
      grid-template-columns: var(--lobby-card-width); grid-template-rows: minmax(0, 1fr) auto;
      gap: 4px; justify-items: center;
    }
    [data-compact] > [data-braingames-lobby] > canvas {
      width: auto; height: 100%; max-height: 108px; grid-area: 1 / 1; align-self: end;
    }
    [data-compact] > [data-braingames-lobby] > section { grid-row: 2; }
    [data-compact] > [data-braingames-lobby] > [role="alert"] { grid-row: 1 / -1; }
    [data-compact] [aria-labelledby="game-title"] { min-height: 300px; padding-block: 12px; }
    #game-title, #game-result-title {
      margin: 0 0 12px; font: inherit; text-align: center; color: var(--ink);
    }
    [data-braingames-controls] {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin: 0 0 12px; font-size: 15px; line-height: 21px; text-align: center;
    }
    [data-braingames-controls] svg { width: 20px; height: 24px; flex: none; }
    [data-control-sign] svg { width: 40px; }
    [data-braingames-controls] kbd {
      box-sizing: border-box; width: auto; height: auto; padding: 0 6px;
      font: inherit; color: #263248; background: #fff8e4;
      border: 2px solid #9f8355; border-radius: 0; box-shadow: 0 2px 0 #9f8355;
      white-space: nowrap;
    }

    [data-game-record-notice]:not([hidden]) {
      display: grid; justify-items: center; gap: 4px; margin-top: 8px;
      font: 400 12px/17px system-ui, sans-serif; text-align: center; text-wrap: balance;
    }
    [data-game-record-notice] button:not([hidden]) {
      max-width: 100%; min-height: 24px; padding: 2px 6px; color: inherit; font: inherit;
      background: transparent; border: 1px solid currentColor; cursor: pointer;
    }
    [data-game-record-notice] button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
  `;
  root.prepend(style);
}
