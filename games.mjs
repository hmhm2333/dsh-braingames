import { GAME_CATALOG } from './lib/catalog.mjs';
export { GAME_CATALOG };

export const DEFAULT_CHALLENGE_TARGETS = Object.fromEntries(GAME_CATALOG.map(game => [game.id, game.challengeTarget]));
