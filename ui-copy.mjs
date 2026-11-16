
import {GAME_COPY, SHARED_COPY} from './runtime/game-catalog.mjs';
import {EN_SHARED, EN_GAMES, EN_DETAIL, EN_MARKUP} from './runtime/english-copy.mjs';

export function pluginLanguage(active) {
  return /^zh(?:-|$)/i.test(active) ? 'zh' : 'en';
}

export function localizedGameCopy(id, locale) {
  return locale === 'zh' ? {locale, game: GAME_COPY[id], shared: SHARED_COPY} :
    {locale: 'en', game: EN_GAMES[id], shared: EN_SHARED, detail: EN_DETAIL[id], markup: EN_MARKUP[id]};
}

const chineseSettings = {
  loading: '设置加载中…', unavailable: 'dsh-braingames 设置不可用。',
  title: '游戏设置', pool: '游戏池',
  poolNote: '仅从勾选的游戏中开始新局。至少勾选两款，结算时才能切换游戏。',
  saving: '保存中…', readOnly: '当前设置为只读状态。', saveFailed: '设置未保存，请重新操作。',
  groups: [
    {
      title: '邀请',
      settings: [
        ['autoInvite', '游戏邀请', '自动弹出邀请', '只从任务标题栏打开'],
        ['inviteRequireRunning', '自动邀请的时机', '有任务运行才邀请', '空闲时也可邀请'],
        ['inviteRequireNoUnread', '有未读完成提醒时', '暂不自动邀请', '照常自动邀请']
      ]
    },
    {
      title: '开局与继续',
      settings: [
        ['modelRecommendation', '模型推荐', '开局时按最近对话标题推荐', null,
          '默认在本地随机选择游戏。开启后，首次开局如有多款可玩，会用 DSH 默认模型推荐。最多发送最近 10 个主对话标题（每条最多 64 个 UTF-16 代码单元），可能计费。等待最多 5 秒，没拿到推荐就随机。'],
        ['keepVisibleOnPause', '切回任务时', '保留画面，点鲸鱼娘继续', '收起画面，从标题栏继续'],
        ['keepOnRefresh', '刷新页面后', '保留本局', '下次打开从头开始', '当前对局仅在本次 DSH 运行期间保留。']
      ]
    }
  ]
};

const englishSettings = {
  loading: 'Loading settings…', unavailable: 'dsh-braingames settings are unavailable.',
  title: 'Game settings', pool: 'Game pool',
  poolNote: 'New rounds use selected games. Select at least two to switch games after a round.',
  saving: 'Saving…', readOnly: 'Settings are read-only.', saveFailed: 'Settings could not be saved. Try again.',
  groups: [
    {
      title: 'Invitations',
      settings: [
        ['autoInvite', 'Game invitations', 'Show invitations', 'Task header only'],
        ['inviteRequireRunning', 'When to show invitations', 'While a task is running', 'On breaks, too'],
        ['inviteRequireNoUnread', 'Unread completion alerts', 'Pause invitations', 'Keep showing invitations']
      ]
    },
    {
      title: 'Start and resume',
      settings: [
        ['modelRecommendation', 'Model recommendation', 'Use recent chat titles to suggest a game', null,
          'Games are picked at random on this device by default. With this on, DSH uses its default model for the first pick when several games are available. It may send up to 10 recent main chat titles, up to 64 UTF-16 code units each. Charges may apply. After 5 seconds, it picks at random.'],
        ['keepVisibleOnPause', 'When you return to work', 'Show paused game. Click DeepSeek-chan to resume.', 'Hide game. Resume from the task header.'],
        ['keepOnRefresh', 'After refreshing', 'Keep this round', 'Start over next time', 'The round is kept for this DSH run.']
      ]
    }
  ]
};

export const SETTINGS_WORDS = {zh: chineseSettings, en: englishSettings};

export const RANK_WORDS = {
  zh: {open: '查看个人榜', title: '个人榜', close: '关闭个人榜', games: '游戏',
    score: '成绩', completed: '完成时间', loading: '正在读取成绩…', empty: '当前规则下还没有成绩。',
    unavailable: '本机成绩读取失败。', damaged: '部分旧记录无法读取。'},
  en: {open: 'View personal bests', title: 'Personal bests', close: 'Close personal bests', games: 'Games',
    score: 'Score', completed: 'Completed', loading: 'Loading scores…', empty: 'No scores for these rules yet.',
    unavailable: 'Could not read local scores.', damaged: 'Some older records could not be read.'}
};

export const BACKUP_WORDS = {
  zh: {
    title: '记录备份', export: '导出备份', import: '导入备份', choose: '选择备份文件',
    preparing: '正在生成备份…', ready: '备份文件已生成。', exportFailed: '备份导出失败。',
    checking: '正在检查和导入备份…', duplicate: '备份中的记录已在本机。',
    quota: '存储空间不足，无法导入备份。', importFailed: '导入失败。',
    saved: (rounds, parts) => '已导入 ' + rounds + ' 局成绩、' + parts + ' 段判定记录。',
    writeQuota: '存储空间不足，部分练习记录未保存。', writeFailed: '部分练习记录未保存。'
  },
  en: {
    title: 'Record backup', export: 'Export backup', import: 'Import backup', choose: 'Choose a backup file',
    preparing: 'Preparing backup…', ready: 'Backup file ready.', exportFailed: 'Could not export the backup.',
    checking: 'Checking and importing backup…', duplicate: 'These records are already on this device.',
    quota: 'Not enough space to import the backup.', importFailed: 'Could not import the backup.',
    partial: 'Part of the backup was imported. Import it again to continue.',
    saved: (rounds, parts) => 'Imported ' + rounds + (rounds === 1 ? ' score' : ' scores') + ' and ' +
      parts + (parts === 1 ? ' event block.' : ' event blocks.'),
    writeQuota: 'Not enough space to save all practice records.', writeFailed: 'Some practice records could not be saved.'
  }
};

export function sharedWords(locale) {
  return locale === 'zh' ? SHARED_COPY : EN_SHARED;
}
