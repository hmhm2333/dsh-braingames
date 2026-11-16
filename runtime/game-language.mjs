import {GAME_COPY, SHARED_COPY} from './game-catalog.mjs';

export function createGameLanguage(gameId, options) {
  const chinese = {locale: 'zh', game: GAME_COPY[gameId], shared: SHARED_COPY};
  let copy = options.getGameCopy?.(options.checkpoint?.language) ?? chinese;
  let bindings;

  return {
    get id() { return copy.locale; },
    get game() { return copy.game; },
    get shared() { return copy.shared; },
    text(key, original) { return copy.detail?.[key] ?? original; },
    selectNext() {
      const next = options.getGameCopy?.() ?? chinese;
      if (next.locale === copy.locale) return false;
      copy = next;
      return true;
    },
    apply(root) {
      root.lang = copy.locale === 'zh' ? 'zh-CN' : 'en';
      if (copy.locale === 'en') root.style.fontFamily = '"BrainGames Latin", serif';
      else root.style.removeProperty('font-family');
      if (bindings === undefined) {
        const list = options.getGameCopy?.('en').markup ?? [];
        bindings = list.map(([selector, attribute, english]) => {
          const element = root.querySelector(selector);
          if (!element) throw Error('Missing localized game element: ' + selector);
          return {element, attribute, zh: attribute ? element.getAttribute(attribute) : element.textContent, en: english};
        });
      }
      for (const {element, attribute, ...values} of bindings) {
        const value = values[copy.locale];
        if (attribute) element.setAttribute(attribute, value);
        else element.textContent = value;
      }
    }
  };
}

export function scoreUnit(gameCopy, score) {
  return score === 1 ? gameCopy.resultUnitOne ?? gameCopy.resultUnit : gameCopy.resultUnit;
}
