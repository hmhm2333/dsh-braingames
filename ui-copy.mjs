
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

export const CHALLENGE_WORDS = {
  zh: {
    title: 'Agent 挑战', off: '关闭', dsh: '当前 DSH', local: '本机已接入的 Agent',
    target: '各游戏目标成绩', saveTarget: '修改后按 Enter 或离开输入框保存。',
    note: '未达标结算会暂停所选范围的新任务。本机模式涵盖当前 DSH 和已接入的 Agent。',
    windows: '本机 Agent 接入目前支持 Windows 宿主。',
    reading: '正在读取挑战状态…', waiting: '等待一局游戏结算。', locked: '正在暂停接收新任务。', unlocked: '已达标，可以提交新任务。',
    inputLocked: '已暂停发送，点击输入框查看挑战。', play: '继续挑战', dismiss: '知道了',
    resume: '达标后可以继续发送。已有草稿会保留。',
    roundScore: '本局', goalScore: '目标',
    result: (game, score, target) => game + ' 本局 ' + score + '，目标 ' + target + '。',
    readFailed: '挑战状态读取或更新失败。', bridgeFailed: '本机 Agent 接口启动失败',
    inventory: '本机 Agent', refresh: '刷新接入状态',
    observed: '已验证钩子运行', written: '已写入，待验证', found: '已检测到命令', missing: 'PATH 中未发现命令',
    setup: '手动接入',
    setupNote: '将下方钩子合并到用户配置文件，提交一次任务后刷新状态。',
    connect: '一键接入', connecting: '正在接入…',
    connectInstalled: 'BrainGames 钩子已写入。', connectExisting: '文件里已有这条钩子。',
    codexTrust: '在 Codex「设置 → Hooks」（CLI 用 /hooks）信任命令含 agent-submit-hook.mjs 的钩子，再提交一次验证。',
    connectVerify: '在客户端提交后，刷新接入状态。',
    connectErrors: {
      'config-format': '现有配置格式有误。请展开手动接入，检查配置文件。',
      'config-path': '客户端的配置目录需要使用绝对路径。',
      'config-changed': '配置正在被修改，请稍后再试。',
      'scope-not-local': '请先选中「本机已接入的 Agent」。',
      'hook-path': 'BrainGames 安装路径含钩子命令无法安全使用的字符。',
      'bridge-unavailable': '本机 Agent 接口未就绪，请先刷新接入状态。',
      'connect-unavailable': 'DSH 的一键接入接口暂不可用。请刷新接入状态后再试。',
      'connect-response': '未收到有效的接入结果。请刷新接入状态后再试。',
      'write-failed': '写入配置失败，请检查文件权限及接入路径。',
    },
  },
  en: {
    title: 'Agent challenge', off: 'Off', dsh: 'Current DSH', local: 'Connected agents on this device',
    target: 'Target scores', saveTarget: 'Press Enter or leave the field to save.',
    note: 'Finishing below the target pauses new tasks in the selected scope. Local mode includes the current DSH and connected agents.',
    windows: 'Connecting local agents currently requires a Windows host.',
    reading: 'Reading challenge status…', waiting: 'Waiting for a round to finish.', locked: 'New tasks are paused.', unlocked: 'Target met. New tasks are available.',
    inputLocked: 'Sending paused. Click the input box to view the challenge.', play: 'Continue challenge', dismiss: 'Got it',
    resume: 'Meet the target to send again. Your draft will stay in the composer.',
    roundScore: 'This round', goalScore: 'Target',
    result: (game, score, target) => game + ' finished with ' + score + '. Target ' + target + '.',
    readFailed: 'Could not read or update the challenge status.', bridgeFailed: 'Could not start the local agent connection',
    inventory: 'Local agents', refresh: 'Refresh connection status',
    observed: 'Hook ran successfully', written: 'Saved. Awaiting verification.', found: 'Command detected', missing: 'Command not found on PATH',
    setup: 'Set up manually',
    setupNote: 'Merge this hook into the user configuration file, submit a task, then refresh the connection status.',
    connect: 'Connect', connecting: 'Connecting…',
    connectInstalled: 'The BrainGames hook was saved.', connectExisting: 'This hook is already in the file.',
    codexTrust: 'In Codex Settings → Hooks (or /hooks in the CLI), trust the hook that runs agent-submit-hook.mjs. Submit once to verify.',
    connectVerify: 'Submit in the client, then refresh to verify the connection.',
    connectErrors: {
      'config-format': 'Open Set up manually to find the existing configuration file and check its format.',
      'config-path': 'The client configuration directory must be an absolute path.',
      'config-changed': 'The configuration is being edited. Try again shortly.',
      'scope-not-local': 'Select Connected agents on this device first.',
      'hook-path': 'The BrainGames installation path contains characters the hook command cannot safely use.',
      'bridge-unavailable': 'The local connection is unavailable. Refresh the connection status first.',
      'connect-unavailable': 'DSH’s connection endpoint is unavailable. Refresh the connection status and try again.',
      'connect-response': 'DSH returned no valid connection result. Refresh the connection status and try again.',
      'write-failed': 'Could not save the hook. Check the configuration path and file permissions.',
    },
  },
};

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
    quota: '存储空间不足，无法导入备份。', importFailed: '无法导入备份，请检查文件格式。',
    importErrors: {
      incomplete: '备份文件不完整。', 'line-too-large': '备份文件中的单条记录过大。',
      'invalid-json': '备份文件中的记录无法解析。', 'unsupported-version': '备份文件版本不支持。',
      'trailing-records': '备份文件结尾有多余记录。', 'record-count': '备份文件的记录数量不符。',
      'invalid-record': '备份文件中的成绩或判定记录有误。',
      'partial-import': '备份只导入了一部分，再次导入可继续。',
    },
    saved: (rounds, parts) => '已导入 ' + rounds + ' 局成绩、' + parts + ' 段判定记录。',
    writeQuota: '存储空间不足，部分练习记录未保存。', writeFailed: '部分练习记录未保存。'
  },
  en: {
    title: 'Record backup', export: 'Export backup', import: 'Import backup', choose: 'Choose a backup file',
    preparing: 'Preparing backup…', ready: 'Backup file ready.', exportFailed: 'Could not export the backup.',
    checking: 'Checking and importing backup…', duplicate: 'These records are already on this device.',
    quota: 'Not enough space to import the backup.', importFailed: 'Could not import the backup. Check the file format.',
    importErrors: {
      incomplete: 'The backup file is incomplete.', 'line-too-large': 'A record in the backup is too large.',
      'invalid-json': 'A record in the backup could not be parsed.', 'unsupported-version': 'This backup version is unsupported.',
      'trailing-records': 'The backup contains extra records after its end.', 'record-count': 'The backup record counts do not match.',
      'invalid-record': 'The backup contains an invalid score or event record.',
      'partial-import': 'Part of the backup was imported. Import it again to continue.',
    },
    saved: (rounds, parts) => 'Imported ' + rounds + (rounds === 1 ? ' score' : ' scores') + ' and ' +
      parts + (parts === 1 ? ' event block.' : ' event blocks.'),
    writeQuota: 'Not enough space to save all practice records.', writeFailed: 'Some practice records could not be saved.'
  }
};

export function sharedWords(locale) {
  return locale === 'zh' ? SHARED_COPY : EN_SHARED;
}
