import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { COMPACT_VIEWPORT, GAME_COPY, SHARED_COPY, STANDARD_VIEWPORT } from './runtime/game-catalog.mjs';
import { EN_GAMES, EN_SHARED } from './runtime/english-copy.mjs';

// Version 1 uses the keys from 1.1.0 so existing personal bests remain visible.
export const GAME_REGISTRY = [
  {
    id: 'regulars-g04', folder: 'rice-bowls', chunk: 'g04', icon: 'regulars',
    challengeTarget: 30,
    trainingProcesses: ['工作记忆更新', '人物与偏好绑定', '延迟回忆'],
    interaction: '鼠标单击菜品',
    description: '记住每位小动物最新的点单；未重新点单时按旧单上菜，新订单替换旧偏好。',
    rulesVersion: 1, originalRulesKey: '5DwN3iVetMXLzJXBdXIov30qqW4JM5vc-T7rzwXeqGQ',
    markup: 'service-markup.html', style: 'service.css',
    atlas: {stem: 'sprites', fields: ['version', 'image', 'width', 'height', 'decodedBytes', 'frames',
      'groups', 'clips', 'guests', 'mealImages', 'docks', 'counter']},
  },
  {
    id: 'rice-bubbles-g10', folder: 'rice-bubbles', chunk: 'game', icon: 'rice',
    challengeTarget: 150,
    trainingProcesses: ['反应抑制', '选择性注意', '规则监测'],
    interaction: '按空格或不按键',
    description: '随机位置竖直落下食物与泡泡，按空格接裸露食物。泡泡、包着食物的泡泡和红牌标出的食物都要放过。持续答对会逐步加快节奏并增加干扰。',
    rulesVersion: 1, originalRulesKey: 'gnsqce20dLaYd8ciO62T8vV1K_0Vy_hafwPsCC10b00',
    atlas: {packed: true}, icons: ['ui/icons/clock.svg'],
  },
  {
    id: 'planks-g02', folder: 'ship-planks', chunk: 'g02', icon: 'planks',
    challengeTarget: 60,
    trainingProcesses: ['心理旋转', '形状匹配', '空间表征'],
    interaction: '鼠标单击破口',
    description: '想象手持木板旋转后的形状，从船体多个破口中选出匹配处；点击前不显示旋转过程。',
    rulesVersion: 1, originalRulesKey: 'oyNDvVULoiBGXdtYOk9mW47YaKnDtS4fz9XXq1jLkF8',
    atlas: {stem: 'whale', fields: ['image', 'width', 'height', 'clips', 'frames']},
  },
  {
    id: 'balloon-winds', folder: 'balloon-winds', chunk: 'winds', icon: 'balloon', compact: true,
    challengeTarget: 20,
    trainingProcesses: ['带符号心算', '横纵坐标差计算', '多步位移规划'],
    interaction: '鼠标左键加位移，右键减位移',
    description: '根据热气球与星星的坐标差，挑选云朵组合位移。左键加坐标，右键减坐标，逐步飞抵目标位置。',
    rulesVersion: 1, originalRulesKey: 'MThBfs100DVQ1ifQSC9u-xmkoVoLpo06nJHp0heNR9A',
    atlas: {stem: 'motion', fields: ['fps', 'end', 'dockFrame', 'pushFrame', 'landingFrame', 'smileFrame', 'layers', 'atlas']},
  },
  {
    id: 'fish-leap', folder: 'fish-leap', chunk: 'fish', icon: 'goldfish', compact: true,
    challengeTarget: 150,
    trainingProcesses: ['多目标追踪', '进场顺序记忆', '行动优先级判断'],
    interaction: '鼠标单击金鱼',
    description: '追踪外观相同的金鱼进场顺序。普通鱼游走不扣灯，部分鱼停留久了会变身，漏掉扣灯；趁网兜就绪优先捞停留最久的变身鱼。',
    rulesVersion: 1, originalRulesKey: '5bAeI_hDFc1C2cxFXMHmVn_niQ_HjmYOb3xsP26pIhw',
    atlas: {stem: 'motion', fields: ['fps', 'contactFrame', 'clips', 'atlas']},
  },
];

export const gameChunk = game => 'client.' + game.chunk + '.js';
export const assetDirectory = game => game.atlas.packed ? 'atlas' : game.chunk;

export function rankingKey({id, rulesVersion, originalRulesKey}) {
  if (rulesVersion === 1 && originalRulesKey) return originalRulesKey;
  return createHash('sha256').update(JSON.stringify(['braingames-rules', id, rulesVersion])).digest('base64url');
}

export function assertTranslation(source, translated, path) {
  for (const [key, value] of Object.entries(source)) {
    const field = path + '.' + key;
    const word = translated?.[key];
    if (value && typeof value === 'object') assertTranslation(value, word, field);
    else if (typeof word !== 'string' || !word.trim()) throw Error('Missing English translation: ' + field);
  }
}

export function catalogSource(registry = GAME_REGISTRY) {
  for (const key of ['id', 'folder', 'chunk']) {
    const values = registry.map(game => game[key]);
    const pattern = key === 'chunk' ? /^[a-z0-9]+$/ : /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (values.some(value => typeof value !== 'string' || !pattern.test(value)) || new Set(values).size !== values.length) {
      throw Error('Invalid or duplicate game ' + key);
    }
  }
  assertTranslation(SHARED_COPY, EN_SHARED, 'shared');
  const directories = new Set();
  const catalog = registry.map(game => {
    const {id, icon, trainingProcesses, interaction, description, rulesVersion, originalRulesKey, atlas, challengeTarget} = game;
    if (!Number.isSafeInteger(rulesVersion) || rulesVersion < 1 ||
        (originalRulesKey !== undefined && !/^[A-Za-z0-9_-]{43}$/.test(originalRulesKey))) {
      throw Error('Invalid game rules version: ' + id);
    }
    if (!Number.isSafeInteger(challengeTarget) || challengeTarget < 1) throw Error('Invalid challenge score target: ' + id);
    if (atlas?.packed !== true && (!/^[a-z0-9-]+$/.test(atlas?.stem ?? '') || !atlas.fields?.length)) {
      throw Error('Missing or invalid game atlas: ' + id);
    }
    const directory = assetDirectory(game);
    if (directories.has(directory)) throw Error('Duplicate game asset directory: ' + directory);
    directories.add(directory);
    const copy = GAME_COPY[id];
    if (!copy) throw Error('Missing game copy: ' + id);
    assertTranslation(copy, EN_GAMES[id], id);
    return {id, icon, challengeTarget, trainingProcesses, interaction, description, name: copy.title, hint: copy.invite, action: copy.start,
      chunk: './' + gameChunk(game), minimumSize: game.compact ? COMPACT_VIEWPORT : STANDARD_VIEWPORT};
  });
  return '// Generated by build.mjs from game-registry.mjs.\nexport const GAME_CATALOG = ' +
    JSON.stringify(catalog, null, 2) + ';\n';
}

// The explicit projection keeps source-art metadata out of compiled and public games.
export function publicManifest(source, fields) {
  return Object.fromEntries(fields.map(key => {
    if (!Object.hasOwn(source, key)) throw Error('Missing runtime asset field ' + key);
    return [key, source[key]];
  }));
}

export async function readGameInputs(project, game) {
  const dir = 'games/' + game.folder + '/';
  const entry = dir + 'dsh-stage.mjs';
  const markup = dir + (game.markup ?? 'markup.html');
  const style = dir + (game.style ?? 'style.css');
  const font = dir + 'ui/song-subset.ttf';
  const fontLicense = dir + 'ui/OFL.txt';
  const icons = (game.icons ?? []).map(file => [file, dir + file]);
  const files = [markup, style, font, fontLicense, ...icons.map(([, path]) => path)];
  if (game.atlas.packed) return {entry, markup, style, font, icons, files};
  const stem = dir + 'assets/' + game.atlas.stem;
  const manifestPath = stem + '.json';
  const image = stem + '.png';
  const manifest = publicManifest(JSON.parse(await readFile(resolve(project, manifestPath), 'utf8')), game.atlas.fields);
  const meals = Object.entries(manifest.mealImages ?? {}).map(([id, file]) => {
    const path = file.split('?')[0];
    if (!/^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.png$/.test(path)) throw Error('Invalid meal image path: ' + path);
    return [id, dir + 'assets/' + path];
  });
  files.push(image, ...new Set(meals.map(([, path]) => path)));
  return {entry, markup, style, font, icons, files, image, manifestPath, manifest, meals};
}
