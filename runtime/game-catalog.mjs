// Game labels, rules and feedback shared by the standalone and bundled clients.
export const SHARED_COPY={
  "appLabel": "dsh-braingames",
  "headerStart": "来一局",
  "headerContinue": "继续本局",
  "headerPlaying": "游戏中",
  "invite": "有任务在跑，来一局试试？",
  "inviteIdle": "休息一下，来一局试试？",
  "inviteLabel": "训练邀请",
  "inviteAccept": "来一局",
  "inviteDismiss": "先不玩了",
  "selecting": "正在挑选游戏",
  "retry": "重试",
  "discardSavedRound": "放弃本局，重新开始",
  "next": "换个玩玩",
  "reload": "重新加载",
  "freezeHint": "点鲸鱼娘继续",
  "moveHint": "长按鲸鱼娘并拖动",
  "replay": "再玩一局",
  "roundLabel": "本局成绩",
  "mouseLeft": "鼠标左键",
  "mouseRight": "鼠标右键",
  "chancesLeft": "还剩 {lives} 次机会。",
  "bestLabel": "最高记录",
  "badRecord": "存在损坏的本机记录，暂用默认值。",
  "storageUnavailable": "本机存储不可用，仍可继续游玩。未保存的最高分或位置无法保留。",
  "clearRecord": "清理损坏记录",
  "loadedError": "游戏加载失败",
  "bootError": "游戏初始化失败，请重试。",
  "loading": "游戏准备中…",
  "noGames": "请前往插件设置，至少勾选一款游戏。",
  "viewportError": "本款游戏区域至少需 {width} × {height}，请放大窗口后重试。",
  "openingGuide": "点击任务标题栏的游戏图标即可开局或继续本局。"
};
export const STANDARD_VIEWPORT = {width: 640, height: 480};
export const COMPACT_VIEWPORT = {width: 320, height: 400};
export const GAME_COPY={
  "rice-bubbles-g10": {
    "title": "吃白饭吐泡泡",
    "shortTitle": "接饭",
    "invite": "鱼饿了，帮我接两口饭？",
    "start": "开饭",
    "loading": "正在端来饭碗",
    "resultUnit": "秒",
    "control": {
      "space": "空格键"
    },
    "rules": {
      "catch": "接住",
      "skip": "放过"
    },
    "ruleNote": "按空格键接住食物。空泡泡、包着食物的泡泡和红牌标出的食物都要放过。",
    "pickyHint": "红牌标的是{food}，要放过。",
    "feedback": {
      "rice_caught": "接住食物了。",
      "bubble_mistake": "误接泡泡了。",
      "bubble_pass": "放过泡泡了。",
      "rice_miss": "漏接食物了。",
      "food_refused": "放过了红牌食物。",
      "food_mistake": "误接了红牌食物。",
      "interrupted": "已暂停，本次不计分。",
      "meal": "收好一颗饭团。"
    }
  },
  "regulars-g04": {
    "title": "大肥鱼茶餐厅",
    "shortTitle": "上菜",
    "invite": "熟客上门了，帮我记下菜？",
    "start": "上菜",
    "loading": "正在擦桌子",
    "resultUnit": "单",
    "scoreLabel": "上对的订单数",
    "control": {
      "left": "选中菜品"
    },
    "rules": [
      "记住点单",
      "照旧上菜"
    ],
    "ruleAccess": "有点单时记住菜品。没点单时，按这位客人上次的点单上菜。",
    "feedback": {
      "timeout": "上菜超时了。",
      "correct": "给{guest}上对了菜。",
      "wrong": "给{guest}上错了菜。",
      "last": "已失误 {max} 次，本单后结算。"
    }
  },
  "planks-g02": {
    "title": "忒修斯之渔船",
    "shortTitle": "补船",
    "invite": "船又漏了，搭把手呗？",
    "start": "补船",
    "loading": "正在找木板",
    "resultUnit": "块船板",
    "control": {
      "left": "选中破口"
    },
    "rules": [
      "想象木板旋转",
      "寻找吻合破口"
    ],
    "feedback": {
      "correct": "修补好了。",
      "wrong": "木板与破口不吻合。"
    }
  },
  "balloon-winds": {
    "title": "大肥鱼热气球",
    "shortTitle": "摘星",
    "invite": "风正好，去摘一颗星？",
    "start": "出发摘星",
    "loading": "正在给气球充气",
    "resultUnit": "颗星",
    "control": {
      "left": "左键加上云的坐标",
      "right": "右键减去云的坐标"
    },
    "ruleNote": "借云移动气球，到达星星处",
    "feedback": {
      "controls": "左键加上云坐标，右键减去云坐标",
      "edge": "会飞出边界",
      "cold": "时间到了",
      "spent": "风力用尽了",
      "timeout": "时间到了，扣一颗心。",
      "empty": "风力用尽了，扣一颗心。",
      "add": "加上这朵云的坐标。",
      "subtract": "减去这朵云的坐标。",
      "moved": "移到 {point}，已换新云。",
      "needsWind": "借助云移动气球到星星处。",
      "unreachable": "剩下的云到不了星星处。",
      "star": "在 {point} 摘到了星星。",
      "landed": "停在 {point}。"
    }
  },
  "fish-leap": {
    "title": "快逮住小金鱼",
    "shortTitle": "捞鱼",
    "invite": "金鱼要变身了，帮我捞一条？",
    "start": "开捞",
    "loading": "正在准备网兜",
    "resultUnit": "秒",
    "control": {
      "left": "捞起金鱼"
    },
    "ruleCatch": "变身前捞起",
    "ruleLampLoss": "鱼变身扣一盏灯",
    "ruleWait": "等普通鱼游走",
    "ruleNote": "优先捞起留得最久的鱼",
    "ruleAccess": "普通鱼游走不扣灯。网兜备好后，先捞起留得最久的鱼。漏掉会变身的鱼扣一盏灯。",
    "netCooling": "网兜正在冷却",
    "netReady": "网兜准备好了",
    "netLoss": "有金鱼变身了。",
    "netCasting": "正在下网",
    "lives": "还剩 {lives} 盏灯。",
    "feedback": {
      "evolving": "赶在变身前捞起了。",
      "ordinary": "捞起了普通金鱼。"
    }
  }
};
export const GAME_METADATA=[
  {
    "id": "regulars-g04",
    "icon": "regulars",
    "trainingProcesses": [
      "工作记忆更新",
      "人物与偏好绑定",
      "延迟回忆"
    ],
    "interaction": "鼠标单击菜品",
    "description": "记住每位小动物最新的点单；未重新点单时按旧单上菜，新订单替换旧偏好。"
  },
  {
    "id": "rice-bubbles-g10",
    "icon": "rice",
    "trainingProcesses": [
      "反应抑制",
      "选择性注意",
      "规则监测"
    ],
    "interaction": "按空格或不按键",
    "description": "随机位置竖直落下食物与泡泡，按空格接裸露食物。泡泡、包着食物的泡泡和红牌标出的食物都要放过。持续答对会逐步加快节奏并增加干扰。"
  },
  {
    "id": "planks-g02",
    "icon": "planks",
    "trainingProcesses": [
      "心理旋转",
      "形状匹配",
      "空间表征"
    ],
    "interaction": "鼠标单击破口",
    "description": "想象手持木板旋转后的形状，从船体多个破口中选出匹配处；点击前不显示旋转过程。"
  },
  {
    "id": "balloon-winds",
    "icon": "balloon",
    "trainingProcesses": [
      "带符号心算",
      "横纵坐标差计算",
      "多步位移规划"
    ],
    "interaction": "鼠标左键加位移，右键减位移",
    "description": "根据热气球与星星的坐标差，挑选云朵组合位移。左键加坐标，右键减坐标，逐步飞抵目标位置。"
  },
  {
    "id": "fish-leap",
    "icon": "goldfish",
    "trainingProcesses": [
      "多目标追踪",
      "进场顺序记忆",
      "行动优先级判断"
    ],
    "interaction": "鼠标单击金鱼",
    "description": "追踪外观相同的金鱼进场顺序。普通鱼游走不扣灯，部分鱼停留久了会变身，漏掉扣灯；趁网兜就绪优先捞停留最久的变身鱼。"
  }
].map(game=>({...game,name:GAME_COPY[game.id].title,hint:GAME_COPY[game.id].invite,action:GAME_COPY[game.id].start}));
