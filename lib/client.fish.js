// Generated; 2D animation and bundled font.
window.__ModuleLoader__.load({id:'dsh-braingames/client.fish.js',factory:require=>{
const __defs=Object.create(null),__cache=Object.create(null);const __get=id=>__cache[id]??(__cache[id]=__defs[id]());
__defs["runtime/move-handle.mjs"]=()=>{
// Shared long-press gesture; each game owns placement and rendering.
const HOLD_TO_MOVE_MS=450;
function createMoveHandle(button,callbacks){
  let press=null,timer=null,tap=false,disposed=false,cancelledPointer=null;
  const listeners=[];
  const on=(name,fn)=>{button.addEventListener(name,fn);listeners.push(()=>button.removeEventListener(name,fn));};
  const eat=e=>{e.preventDefault();e.stopPropagation();};
  function releaseTail(){const id=cancelledPointer;cancelledPointer=null;if(id!==null&&button.hasPointerCapture(id))button.releasePointerCapture(id);}
  function release(keepCapture=false){
    const current=press;press=null;if(timer!==null)clearTimeout(timer);timer=null;
    delete button.dataset.holding;delete button.dataset.dragging;
    if(current&&button.hasPointerCapture(current.id)){if(keepCapture)cancelledPointer=current.id;else button.releasePointerCapture(current.id);}
    return current;
  }
  function cancel({untilRelease=false}={}){tap=false;if(!press){if(!untilRelease)releaseTail();return false;}release(untilRelease);if(!untilRelease)releaseTail();callbacks.onCancel();return true;}
  function fail(error){release();releaseTail();tap=false;callbacks.onError(error);}
  on('pointerdown',e=>{
    if(disposed||press||e.button!==0||e.isPrimary===false||!callbacks.canMove())return;
    eat(e);tap=false;releaseTail();press={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,active:false};
    try{
      const current=press;button.setPointerCapture(e.pointerId);button.dataset.holding='true';callbacks.onGrab();
      if(press!==current)return;
      timer=setTimeout(()=>{
        timer=null;if(press!==current)return;press.active=true;button.dataset.dragging='true';
        try{callbacks.onActivate();if(press===current)callbacks.onMove(current.lastX-current.x,current.lastY-current.y);}catch(error){fail(error);}
      },HOLD_TO_MOVE_MS);
    }catch(error){fail(error);}
  });
  on('pointermove',e=>{
    if(!press||press.id!==e.pointerId)return;eat(e);press.lastX=e.clientX;press.lastY=e.clientY;
    if(press.active)try{callbacks.onMove(e.clientX-press.x,e.clientY-press.y);}catch(error){fail(error);}
  });
  on('pointerup',e=>{
    if(cancelledPointer===e.pointerId){eat(e);releaseTail();return;}
    if(!press||press.id!==e.pointerId)return;eat(e);
    const current=release(),dx=e.clientX-current.x,dy=e.clientY-current.y,rect=button.getBoundingClientRect();
    tap=!current.active&&Math.hypot(dx,dy)<=6&&e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
    try{callbacks.onDrop(current.active,dx,dy);}catch(error){fail(error);}
  });
  on('pointercancel',()=>{cancel();});on('lostpointercapture',e=>{if(press?.id===e.pointerId||cancelledPointer===e.pointerId)cancel();});
  // Keep the original game-owned click; never replay it onto the task beneath.
  on('click',e=>{eat(e);const shortTap=tap;tap=false;if(shortTap)callbacks.onTap();});
  on('contextmenu',e=>{if(press)eat(e);});
  return{cancel,isPressed:()=>!!press,dispose(){if(disposed)return;disposed=true;cancel();for(const remove of listeners)remove();}};
}

return {HOLD_TO_MOVE_MS,createMoveHandle};
};
__defs["runtime/game-catalog.mjs"]=()=>{
// Game labels, rules and feedback shared by the standalone and bundled clients.
const SHARED_COPY={
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
const STANDARD_VIEWPORT = {width: 640, height: 480};
const COMPACT_VIEWPORT = {width: 320, height: 400};
const GAME_COPY={
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
const GAME_METADATA=[
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

return {SHARED_COPY,STANDARD_VIEWPORT,COMPACT_VIEWPORT,GAME_COPY,GAME_METADATA};
};
__defs["runtime/presentation.mjs"]=()=>{
const {STANDARD_VIEWPORT}=__get("runtime/game-catalog.mjs");
// Three authored pixel-animation frames; wall time here never advances training.
const RECOVERY_MS=3*1000/16;
const playableSize=(width,height)=>width>=STANDARD_VIEWPORT.width&&height>=STANDARD_VIEWPORT.height;
const LOBBY_CARD_WIDTH=280;
const LOBBY_COMPANION_SIZE=200;
const LOBBY_COMPANION_BASELINE=184;
const LOBBY_COMPANION_OFFSET_Y=LOBBY_COMPANION_BASELINE-LOBBY_COMPANION_SIZE/2;
const VERDICT_COLORS={edge:0xfff8e4,ink:0x263248,correct:0x94bbb5,incorrect:0xe5a2a1};
const VERDICT_TICK=[[-5,0],[-3,2],[-1,4],[1,2],[3,0],[5,-2],[7,-4]];
const VERDICT_CROSS=Array.from({length:5},(_,i)=>i-2).flatMap(i=>[-1,1].map(side=>[i*2,side*i*2]));

return {RECOVERY_MS,playableSize,LOBBY_CARD_WIDTH,LOBBY_COMPANION_SIZE,LOBBY_COMPANION_BASELINE,LOBBY_COMPANION_OFFSET_Y,VERDICT_COLORS,VERDICT_TICK,VERDICT_CROSS};
};
__defs["runtime/apply-copy.mjs"]=()=>{
function applyCopy(root,labels){
  for(const [selector,text]of Object.entries(labels)){
    const node=root.querySelector(selector);if(!node)throw Error('Missing UI copy target '+selector);node.textContent=text;
  }
}

return {applyCopy};
};
__defs["runtime/control-guide.mjs"]=()=>{
const {SHARED_COPY}=__get("runtime/game-catalog.mjs");
const {LOBBY_CARD_WIDTH,LOBBY_COMPANION_SIZE}=__get("runtime/presentation.mjs");
// Shared layout, titles, settlement labels and input cues in the game panels.
function mountControlGuide(root, {title, control}) {
  for (const heading of root.querySelectorAll('[data-braingames-title]')) heading.textContent = title;
  for (const label of root.querySelectorAll('[data-braingames-copy]')) {
    label.textContent = SHARED_COPY[label.dataset.braingamesCopy];
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
    svg.setAttribute('aria-label', symbol ? text : left ? SHARED_COPY.mouseLeft : SHARED_COPY.mouseRight);
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

  const style = document.createElement('style');
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

return {mountControlGuide};
};
__defs["runtime/game-records.mjs"]=()=>{
const {SHARED_COPY}=__get("runtime/game-catalog.mjs");
function parseScore(value) {
  const score = Number(value);
  return value.trim() !== '' && Number.isSafeInteger(score) && score >= 0 ? score : null;
}

function parsePosition(value) {
  let position;
  try {
    position = JSON.parse(value);
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
  const {x, y} = position ?? {};
  return Number.isFinite(x) && x >= 0 && x <= 1 && Number.isFinite(y) && y >= 0 && y <= 1 ? {x, y} : null;
}

function createRecordStore(onChange = () => {}, getStorage = () => localStorage) {
  const damaged = new Map();
  let unavailable = false;

  function access(operation) {
    try {
      return operation(getStorage());
    } catch (error) {
      if (!(error instanceof DOMException) || !['SecurityError', 'QuotaExceededError'].includes(error.name)) throw error;
      unavailable = true;
      onChange();
      return null;
    }
  }

  function read(key, parse) {
    const raw = access(storage => storage.getItem(key));
    if (raw === null) return null;
    const value = parse(raw);
    if (value === null) {
      damaged.set(key, raw);
      onChange();
    }
    return value;
  }

  function write(key, value) {
    const written = access(storage => {
      storage.setItem(key, value);
      return true;
    });
    if (written && damaged.delete(key)) onChange();
  }

  function clearDamaged() {
    access(storage => {
      for (const [key, original] of damaged) {
        if (storage.getItem(key) === original) storage.removeItem(key);
        damaged.delete(key);
      }
    });
    onChange();
  }

  return {
    status: () => ({damaged: damaged.size > 0, unavailable}),
    readScore: key => read(key, parseScore) ?? 0,
    readPosition: key => read(key, parsePosition),
    saveScore(key, score) {
      const highest = Math.max(score, read(key, parseScore) ?? 0);
      write(key, String(highest));
      return highest;
    },
    savePosition: (key, position) => write(key, JSON.stringify(position)),
    clearDamaged
  };
}

function mountGameRecords(root, ...panelSelectors) {
  const notices = [];
  const store = createRecordStore(update);
  function update() {
    const {damaged, unavailable} = store.status();
    const message = unavailable ? SHARED_COPY.storageUnavailable : damaged ? SHARED_COPY.badRecord : '';
    for (const {notice, text, clear} of notices) {
      if (text.textContent !== message) text.textContent = message;
      clear.hidden = !damaged || unavailable;
      notice.hidden = message === '';
    }
  }
  for (const selector of panelSelectors) {
    const notice = document.createElement('div');
    const text = document.createElement('span');
    const clear = document.createElement('button');
    notice.dataset.gameRecordNotice = '';
    notice.hidden = true;
    text.setAttribute('role', 'status');
    clear.type = 'button';
    clear.textContent = SHARED_COPY.clearRecord;
    clear.addEventListener('click', () => {
      const panel = notice.parentElement;
      store.clearDamaged();
      if (clear.hidden) panel.querySelector('button:not([hidden]):not(:disabled)')?.focus({preventScroll: true});
    });
    notice.append(text, clear);
    root.querySelector(selector).append(notice);
    notices.push({notice, text, clear});
  }
  update();
  return store;
}

return {createRecordStore,mountGameRecords};
};
__defs["runtime/pixel-text.mjs"]=()=>{
// Shared pixel labels keep their real text for layout and accessibility.
// Only their painted glyphs are replaced by a native 12px, one-bit bitmap.
function createPixelText(root,{alphaThreshold=48}={}){
  let pending=null,disposed=false,presented=true;
  function paint(label){
    if(!label.getClientRects().length||!label.firstChild)return;
    const style=getComputedStyle(label),scale=parseFloat(style.fontSize)/12;
    const box=label.getBoundingClientRect(),borderX=parseFloat(style.borderLeftWidth),borderY=parseFloat(style.borderTopWidth);
    const canvas=document.createElement('canvas');
    canvas.width=Math.ceil(label.clientWidth/scale);canvas.height=Math.ceil(label.clientHeight/scale);
    if(!canvas.width||!canvas.height)return;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.font='12px '+style.fontFamily;ctx.fillStyle=style.color;ctx.textBaseline='alphabetic';
    const glyph=ctx.measureText('饭'),lines=[];
    const node=label.firstChild,range=document.createRange();
    let offset=0;
    for(const char of node.textContent){
      range.setStart(node,offset);offset+=char.length;range.setEnd(node,offset);
      const rect=range.getBoundingClientRect(),last=lines.at(-1);
      if(last&&Math.abs(last.top-rect.top)<1)last.text+=char;
      else lines.push({text:char,left:rect.left,top:rect.top,height:rect.height});
    }
    for(const line of lines){
      const x=Math.round((line.left-box.left-borderX)/scale);
      const y=Math.round((line.top-box.top-borderY+line.height/2)/scale+(glyph.actualBoundingBoxAscent-glyph.actualBoundingBoxDescent)/2);
      ctx.fillText(line.text,x,y);
    }
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    // This bundled serif has thin anti-aliased strokes at 12px. Preserve them
    // when quantizing to one bit (128 erased most of the Chinese strokes).
    for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]>=alphaThreshold?255:0;
    ctx.putImageData(pixels,0,0);
    label.style.setProperty('--pixel-label','url("'+canvas.toDataURL()+'")');
    label.style.setProperty('--pixel-label-size',canvas.width*scale+'px '+canvas.height*scale+'px');
    label.dataset.pixelReady='true';
  }
  function repaint(){
    if(disposed||!presented||pending!==null)return;
    pending=requestAnimationFrame(()=>{
      pending=null;
      for(const label of root.querySelectorAll('[data-pixel-text]'))paint(label);
    });
  }
  const observer=new MutationObserver(records=>{
    if(records.some(r=>r.type!=='attributes'||r.attributeName==='hidden'||r.target===root))repaint();
  });
  observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','style']});
  const resize=new ResizeObserver(repaint);resize.observe(root);
  const events=['pointerover','pointerout','focusin','focusout'];
  for(const event of events)root.addEventListener(event,repaint);
  repaint();
  return{flush(){if(disposed)return;if(pending!==null)cancelAnimationFrame(pending);pending=null;for(const label of root.querySelectorAll('[data-pixel-text]'))paint(label);},suspend(){presented=false;if(pending!==null)cancelAnimationFrame(pending);pending=null;},present(){presented=true;repaint();},dispose(){disposed=true;observer.disconnect();resize.disconnect();for(const event of events)root.removeEventListener(event,repaint);if(pending!==null)cancelAnimationFrame(pending);}};
}

return {createPixelText};
};
__defs["runtime/random-state.mjs"]=()=>{
// Mulberry32, with a compact state for a page-refresh checkpoint.
function createRandom(seed,salt=0){
  let value=(seed^salt)>>>0;
  const next=()=>{
    value=(value+0x6d2b79f5)>>>0;
    let n=Math.imul(value^value>>>15,1|value);n^=n+Math.imul(n^n>>>7,61|n);
    return((n^n>>>14)>>>0)/4294967296;
  };
  next.getState=()=>value;
  next.restore=state=>{if(!Number.isInteger(state)||state<0||state>0xffffffff)throw Error('Invalid random checkpoint');value=state;};
  return next;
}

return {createRandom};
};
__defs["games/fish-leap/difficulty.mjs"]=()=>{
const NET_CD_MS = 600;
const EVOLUTION_MS = 12500;
const TIER_MIN_MS = 37000;
const OPENING_FISH = 3;

const TIER_COUNT = 12;

function interpolateRange(start, end, progress) {
  return start.map((value, i) => Math.round(value + (end[i] - value) * progress));
}

const TIERS = Array.from({length: TIER_COUNT}, (_, index) => {
  const progress = index / (TIER_COUNT - 1);
  if (index === TIER_COUNT - 1) {
    return {birth: [1250, 1700], ordinaryStay: [8900, 10900], evolutionWait: [5800, 7100]};
  }
  return {
    birth: interpolateRange([2100, 2800], [1250, 1700], progress),
    ordinaryStay: interpolateRange([6200, 8500], [8900, 11100], progress),
    evolutionWait: interpolateRange([9000, 10300], [5600, 6900], progress),
  };
});

return {NET_CD_MS,EVOLUTION_MS,TIER_MIN_MS,OPENING_FISH,TIERS};
};
__defs["games/fish-leap/core.mjs"]=()=>{
const {createRandom}=__get("runtime/random-state.mjs");
const {COMPACT_VIEWPORT}=__get("runtime/game-catalog.mjs");
const {NET_CD_MS, EVOLUTION_MS, TIER_MIN_MS, OPENING_FISH, TIERS}=__get("games/fish-leap/difficulty.mjs");
const STARTING_LIVES = 3;
const ACTOR_SCALE = 1.42;
const FISH_SCALE = 1.28;
const FISH_HIT_GRACE_MS = 200;
const POSE_MS = 1000 / 16;
const EVOLUTION_ANIMATION_MS = 28 * POSE_MS;
const DEPARTURE_ANIMATION_MS = 320;
const CONTACT_FRAME = 4;
const SCOOP_FRAMES = 12;
const REACTION_FRAMES = 12;
const MIN_VIEW = COMPACT_VIEWPORT;

const ACTOR_SIDE_ROOM = Math.ceil(48 * ACTOR_SCALE);
const ACTOR_DRAG_SIDE_ROOM = Math.ceil(50 * ACTOR_SCALE);
const FISH_EDGE_INSET = 34;
const ACTOR_HEAD_ROOM = 108;
const ACTOR_FOOT_ROOM = 36;
const STEP_MS = 1000 / 120;
const SCOOP_MS = POSE_MS * SCOOP_FRAMES;
const REACTION_MS = POSE_MS * REACTION_FRAMES;
const CONTACT_MS = POSE_MS * CONTACT_FRAME;
const RUN_START_MS = 125;
const RUN_STOP_MS = 150;
const RUN_CYCLE_FRAMES = 8;
const TURN_DELAYS_MS = [900, 2100];
const TURN_TIMES_MS = [200, 350];
const RANDOM_STREAMS = {arrivalRandom: 0xf5a261, evolutionRandom: 0x414f25, lifetimeRandom: 0x52ade1, pathRandom: 0xbac164};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, amount) => start + (end - start) * amount;
const ease = amount => amount * amount * (3 - 2 * amount);
const direction = angle => Math.cos(angle) < 0 ? 'left' : 'right';
const radians = degrees => degrees * Math.PI / 180;

function sampleInteger(random, [min, max]) {
  return min + Math.floor(random() * (max - min + 1));
}

function boundsFor(width, height) {
  const left = Math.min(FISH_EDGE_INSET, width / 2);
  const top = Math.min(ACTOR_HEAD_ROOM, height / 2);
  return {left, right: width - left, top, bottom: Math.max(top, height - ACTOR_FOOT_ROOM - 4)};
}

function speedFor({left, right, top, bottom}) {
  const shortSide = Math.min(right - left, bottom - top);
  return clamp(112 * Math.sqrt(shortSide / 720), 82, 148);
}

function actorStart(width, height) {
  return {x: Math.max(width / 2, width - 82), y: Math.max(height / 2, height - ACTOR_FOOT_ROOM),
    direction: 'left'};
}

function clampActor(x, y, width, height) {
  const side = Math.min(ACTOR_DRAG_SIDE_ROOM, width / 2);
  return {x: clamp(x, side, width - side), y: clamp(y, ACTOR_HEAD_ROOM, height - ACTOR_FOOT_ROOM)};
}

function rescale(value, oldMin, oldMax, min, max) {
  const progress = oldMax > oldMin ? (value - oldMin) / (oldMax - oldMin) : .5;
  return lerp(min, max, clamp(progress, 0, 1));
}

function interpolatePoint(from, to, amount) {
  return {x: lerp(from.x, to.x, amount), y: lerp(from.y, to.y, amount)};
}

function reflectHeading(angle, hitX, hitY) {
  if (hitX) angle = Math.PI - angle;
  if (hitY) angle = -angle;
  return angle;
}

class FishSchool {
  time = 0;
  lives = STARTING_LIVES;
  fish = [];
  effects = [];
  phase = 'playing';
  readyAt = 0;
  nextId = 0;
  finishAt = Infinity;
  frozenAt = Infinity;
  savedInTier = false;
  tierStarted = 0;
  capture = null;

  constructor(width, height, {
    seed = Math.floor(Math.random() * 2 ** 32),
    tier = 0,
    netOffsets,
    saved,
  }) {
    this.netOffsets = netOffsets;
    for (const [name, salt] of Object.entries(RANDOM_STREAMS)) this[name] = createRandom(seed, salt);
    if (saved) {
      this.restore(saved);
      if (width !== this.width || height !== this.height) this.resize(width, height);
      return;
    }
    this.width = width;
    this.height = height;
    this.bounds = boundsFor(width, height);
    this.speed = speedFor(this.bounds);
    this.tier = tier;
    this.actor = actorStart(width, height);
    const spec = TIERS[this.tier];
    const firstEvolver = sampleInteger(this.evolutionRandom, [0, OPENING_FISH - 1]);
    for (let index = 0; index < OPENING_FISH; index++) {
      this.addFish(spec, index === firstEvolver);
    }
    this.birthAt = sampleInteger(this.arrivalRandom, spec.birth);
  }

  checkpoint() {
    const {width, height, tier, time, lives, fish, effects, phase, readyAt, nextId,
      birthAt, evolutionEligibleAt, tierStarted, savedInTier, actor, capture, finishAt, frozenAt} = this;
    const random = Object.fromEntries(Object.keys(RANDOM_STREAMS).map(name => [name, this[name].getState()]));
    const state = {tier, time, lives, fish, effects, phase, readyAt, nextId, birthAt, evolutionEligibleAt,
      tierStarted, savedInTier, actor, capture, finishAt: Number.isFinite(finishAt) ? finishAt : null,
      frozenAt: Number.isFinite(frozenAt) ? frozenAt : null};
    return {version: 1, width, height, state: structuredClone(state), random};
  }

  restore(saved) {
    const {version, width, height, state, random} = saved;
    if (version !== 1 || !(width >= MIN_VIEW.width && height >= MIN_VIEW.height) ||
      ![width, height].every(Number.isFinite) || !state || !random) throw Error('捞鱼存档格式无效');
    const {tier, time, lives, fish, effects, phase, readyAt, nextId, birthAt, evolutionEligibleAt,
      tierStarted, savedInTier, actor, capture, finishAt, frozenAt} = structuredClone(state);
    if (!Number.isInteger(tier) || !TIERS[tier] || !Number.isInteger(lives) ||
      lives < 0 || lives > STARTING_LIVES || !['playing', 'settling', 'ended'].includes(phase) ||
      ![time, readyAt, nextId, birthAt, evolutionEligibleAt, tierStarted, actor?.x, actor?.y].every(Number.isFinite) ||
      !Array.isArray(fish) || !Array.isArray(effects) ||
      (phase === 'playing' ? lives === 0 || birthAt <= time || finishAt !== null || frozenAt !== null ||
        fish.some(item => !Number.isFinite(item.deadline) || (!item.locked && item.deadline <= time))
        : lives !== 0 || !Number.isFinite(finishAt) || !Number.isFinite(frozenAt) ||
          frozenAt > time || finishAt < time || (phase === 'ended' && finishAt !== time))) {
      throw Error('捞鱼存档状态无效');
    }
    if (capture?.fish?.locked) {
      capture.fish = fish.find(item => item.id === capture.fish.id && item.locked);
      if (!capture.fish || !(capture.contactAt > time)) throw Error('捞鱼存档动作无效');
    }
    if (capture && (!capture.fish || ![capture.scoopAt, capture.contactAt, capture.reactionAt, capture.end].every(Number.isFinite) ||
      capture.end <= time)) throw Error('捞鱼存档动作无效');
    for (const name of Object.keys(RANDOM_STREAMS)) this[name].restore(random[name]);
    Object.assign(this, {width, height, tier, time, lives, fish, effects, phase, readyAt, nextId, birthAt,
      evolutionEligibleAt, tierStarted, savedInTier, actor, capture,
      finishAt: finishAt ?? Infinity, frozenAt: frozenAt ?? Infinity});
    this.bounds = boundsFor(width, height);
    this.speed = speedFor(this.bounds);
  }

  get netRemaining() {
    return Math.max(0, this.readyAt - this.time);
  }

  get swimTime() {
    return Math.min(this.frozenAt, this.time);
  }

  get reaction() {
    if (!this.capture || this.time < this.capture.reactionAt) return null;
    return this.capture.fish.evolves ? 'evolving' : 'ordinary';
  }

  resize(width, height) {
    const old = this.bounds;
    const next = boundsFor(width, height);
    const resizeFish = fish => {
      fish.x = rescale(fish.x, old.left, old.right, next.left, next.right);
      fish.y = rescale(fish.y, old.top, old.bottom, next.top, next.bottom);
    };
    const resizeActor = actor => {
      const side = Math.min(ACTOR_SIDE_ROOM, width / 2);
      actor.x = clamp(rescale(actor.x, 0, this.width, 0, width), side, width - side);
      actor.y = clamp(rescale(actor.y, 0, this.height, 0, height), next.top, Math.max(next.top, height - ACTOR_FOOT_ROOM));
    };
    for (const fish of this.fish) resizeFish(fish);
    for (const effect of this.effects) resizeFish(effect);
    resizeActor(this.actor);
    if (this.capture) {
      resizeActor(this.capture.from);
      resizeActor(this.capture.approach);
      if (!this.capture.fish.locked) resizeFish(this.capture.fish);
    }
    this.width = width;
    this.height = height;
    this.bounds = next;
    this.speed = speedFor(next);
    this.updateActor();
  }

  scoop(id) {
    if (this.phase !== 'playing' || this.capture || this.netRemaining) return false;
    const fish = this.fish.find(item => item.id === id);
    if (!fish || fish.deadline <= this.time) return false;
    const side = this.scoopSide(fish);
    const [netX, netY] = this.netOffsets[side][CONTACT_FRAME];
    const distance = Math.hypot(fish.x - netX - this.actor.x, fish.y - netY - this.actor.y);
    const diagonal = Math.hypot(this.width, this.height);
    const chaseSpeed = clamp(diagonal * .70, 520, 1100);
    const chaseMs = clamp(distance / chaseSpeed * 1000 + 130, 360, 1400);
    fish.locked = true;
    if (fish.evolves) this.savedInTier = true;
    const reactionAt = this.time + chaseMs + SCOOP_MS;
    this.capture = {
      fish,
      from: {...this.actor},
      approach: {...this.actor},
      start: this.time,
      scoopAt: this.time + chaseMs,
      contactAt: this.time + chaseMs + CONTACT_MS,
      reactionAt,
      end: reactionAt + REACTION_MS,
      side,
    };
    this.readyAt = this.capture.end + NET_CD_MS;
    this.updateActor();
    return true;
  }

  advance(delta) {
    const until = this.time + delta;
    while (this.phase === 'playing' && this.time < until) {
      let departureAt = Infinity;
      for (const fish of this.fish) {
        if (!fish.locked) departureAt = Math.min(departureAt, fish.deadline);
      }
      const contactAt = this.capture?.fish.locked ? this.capture.contactAt : Infinity;
      const scoopAt = this.capture && this.capture.scoopAt > this.time ? this.capture.scoopAt : Infinity;
      const captureEnd = this.capture?.end ?? Infinity;
      const next = Math.min(until, this.time + STEP_MS, this.birthAt, departureAt, scoopAt, contactAt, captureEnd);
      this.swim(next);
      this.time = next;
      this.resolveCapture();
      if (next === departureAt) this.resolveDepartures();
      if (this.phase === 'playing' && next === this.birthAt) this.spawn();
    }
    if (this.phase === 'settling') {
      if (this.capture?.fish.locked && until >= this.capture.contactAt) {
        this.time = this.capture.contactAt;
        this.resolveCapture();
      }
      this.time = Math.min(until, this.finishAt);
      this.resolveCapture();
      if (this.time === this.finishAt) this.phase = 'ended';
    }
    this.effects = this.effects.filter(effect => this.time < effect.at + effect.duration);
  }

  resolveDepartures() {
    const expired = this.fish.filter(fish => !fish.locked && fish.deadline === this.time);
    for (const fish of expired) {
      this.fish.splice(this.fish.indexOf(fish), 1);
      const duration = fish.evolves ? EVOLUTION_ANIMATION_MS : DEPARTURE_ANIMATION_MS;
      this.effects.push({...fish, kind: fish.evolves ? 'evolution' : 'leave', at: this.time, duration});
      if (fish.evolves) this.lives -= 1;
      if (this.lives === 0) {
        this.phase = 'settling';
        this.frozenAt = this.time;
        this.finishAt = Math.max(this.time + EVOLUTION_ANIMATION_MS, this.capture?.end ?? 0) + FISH_HIT_GRACE_MS;
        break;
      }
    }
  }

  resolveCapture() {
    if (!this.capture) return;
    this.updateActor();
    const {fish, contactAt, end} = this.capture;
    if (fish.locked && this.time >= contactAt) {
      this.fish.splice(this.fish.indexOf(fish), 1);
      fish.locked = false;
    }
    if (this.time >= end) this.capture = null;
  }

  spawn() {
    if (this.tier < TIERS.length - 1 && this.time - this.tierStarted >= TIER_MIN_MS && this.savedInTier) {
      this.tier += 1;
      this.tierStarted = this.time;
      this.savedInTier = false;
    }
    const spec = TIERS[this.tier];
    this.addFish(spec, this.time >= this.evolutionEligibleAt);
    this.birthAt = this.time + sampleInteger(this.arrivalRandom, spec.birth);
  }

  addFish(spec, evolves) {
    const duration = evolves ? EVOLUTION_MS : sampleInteger(this.lifetimeRandom, spec.ordinaryStay);
    if (evolves) {
      this.evolutionEligibleAt = this.time + sampleInteger(this.evolutionRandom, spec.evolutionWait);
    }

    const {left, right, top, bottom} = this.bounds;
    let location;
    let separation = -1;
    for (let attempt = 0; attempt < 6; attempt++) {
      const x = lerp(left, right, this.pathRandom());
      const y = lerp(top, bottom, this.pathRandom());
      const nearest = Math.min(...this.fish.map(fish => Math.hypot(fish.x - x, fish.y - y)));
      if (nearest > separation) {
        location = {x, y};
        separation = nearest;
      }
      if (separation >= 90) break;
    }

    this.fish.push({
      ...location,
      id: this.nextId++,
      born: this.time,
      deadline: this.time + duration,
      evolves,
      locked: false,
      angle: this.pathRandom() * Math.PI * 2,
      turn: null,
      nextTurn: this.time + sampleInteger(this.pathRandom, TURN_DELAYS_MS),
    });
  }

  swim(next) {
    const seconds = (next - this.time) / 1000;
    const {left, right, top, bottom} = this.bounds;
    for (const fish of this.fish) {
      if (!fish.turn && next >= fish.nextTurn) {
        const sign = this.pathRandom() < .5 ? -1 : 1;
        const angle = radians(sampleInteger(this.pathRandom, [20, 95]));
        const duration = sampleInteger(this.pathRandom, TURN_TIMES_MS);
        fish.turn = {from: fish.angle, to: fish.angle + sign * angle, at: fish.nextTurn, duration};
        fish.nextTurn += sampleInteger(this.pathRandom, TURN_DELAYS_MS);
      }
      if (fish.turn) {
        const {from, to, at, duration} = fish.turn;
        const progress = clamp((next - at) / duration, 0, 1);
        fish.angle = lerp(from, to, ease(progress));
        if (progress === 1) fish.turn = null;
      }

      const x = fish.x + Math.cos(fish.angle) * this.speed * seconds;
      const y = fish.y + Math.sin(fish.angle) * this.speed * seconds;
      const hitX = x < left || x > right;
      const hitY = y < top || y > bottom;
      if (hitX || hitY) {
        const inside = reflectHeading(fish.angle, hitX, hitY);
        const inward = hitX ? (x < left ? 0 : Math.PI) : (y < top ? Math.PI / 2 : -Math.PI / 2);
        const veer = radians(sampleInteger(this.pathRandom, [-19, 19]));
        const signX = x < left ? 1 : -1;
        const signY = y < top ? 1 : -1;
        const turned = inside + veer;
        fish.angle = (!hitX || Math.cos(turned) * signX > .12) && (!hitY || Math.sin(turned) * signY > .12)
          ? turned
          : hitX && hitY ? Math.atan2(signY, signX) : inward + veer;
        fish.turn = null;
      }
      fish.x = clamp(x, left, right);
      fish.y = clamp(y, top, bottom);
    }
  }

  updateActor() {
    const capture = this.capture;
    if (!capture) return;
    if (this.time === capture.scoopAt) capture.side = this.scoopSide(capture.fish, capture.side);
    const {fish, from, start, scoopAt, contactAt, side} = capture;
    const [netX, netY] = this.netOffsets[side][CONTACT_FRAME];
    const aim = {x: fish.x - netX, y: fish.y - netY};
    if (this.time < scoopAt) {
      const elapsed = this.time - start;
      const total = scoopAt - start;
      const ramp = Math.min(1, elapsed / RUN_START_MS);
      const braking = Math.min(1, (total - elapsed) / RUN_STOP_MS);
      const accelerate = RUN_START_MS * (ramp * ramp / 2);
      const stride = Math.max(0, Math.min(elapsed, total - RUN_STOP_MS) - RUN_START_MS);
      const decelerate = elapsed > total - RUN_STOP_MS ? RUN_STOP_MS * (1 - braking * braking) / 2 : 0;
      const progress = clamp((accelerate + stride + decelerate) / (total - (RUN_START_MS + RUN_STOP_MS) / 2), 0, 1);
      const inset = Math.min(ACTOR_SIDE_ROOM, this.width / 2);
      const top = this.bounds.top;
      const to = {
        x: clamp(aim.x + Math.cos(fish.angle) * this.speed * .17, inset, this.width - inset),
        y: clamp(aim.y + Math.sin(fish.angle) * this.speed * .17, top, Math.max(top, this.height - ACTOR_FOOT_ROOM)),
      };
      const position = interpolatePoint(from, to, progress);
      const movedX = position.x - this.actor.x;
      if (Math.abs(movedX) >= .08) this.actor.direction = movedX < 0 ? 'left' : 'right';
      Object.assign(this.actor, position);
      capture.approach = {...this.actor};
    } else if (this.time <= contactAt) {
      const progress = ease(clamp((this.time - scoopAt) / CONTACT_MS, 0, 1));
      Object.assign(this.actor, interpolatePoint(capture.approach, aim, progress), {direction: side});
    }
  }

  scoopSide(fish, fallback = fish.x >= this.actor.x ? 'right' : 'left') {
    const edge = Math.min(this.width / 2, 94 * ACTOR_SCALE + this.speed * CONTACT_MS / 1000);
    if (fish.x < edge) return 'left';
    if (fish.x > this.width - edge) return 'right';
    return fallback;
  }

  actorPose() {
    if (!this.capture) return {clip: 'idle-' + this.actor.direction, index: 0};
    const {start, scoopAt, side, contactAt, reactionAt} = this.capture;
    if (this.time < scoopAt) {
      const elapsed = this.time - start;
      return {clip: 'run-' + this.actor.direction, index: Math.floor(elapsed / POSE_MS) % RUN_CYCLE_FRAMES};
    }
    const reaction = this.reaction;
    if (reaction) {
      const index = Math.min(REACTION_FRAMES - 1, Math.floor((this.time - reactionAt) / POSE_MS));
      return {clip: 'react-' + reaction + '-' + side, index};
    }
    const frame = Math.floor((this.time - scoopAt) / POSE_MS);
    const index = this.time < contactAt ? clamp(frame, 0, CONTACT_FRAME - 1)
      : clamp(frame, CONTACT_FRAME, SCOOP_FRAMES - 1);
    return {clip: 'scoop-' + side, index};
  }
}

return {STARTING_LIVES,ACTOR_SCALE,FISH_SCALE,FISH_HIT_GRACE_MS,POSE_MS,EVOLUTION_ANIMATION_MS,DEPARTURE_ANIMATION_MS,CONTACT_FRAME,SCOOP_FRAMES,REACTION_FRAMES,MIN_VIEW,clamp,lerp,actorStart,clampActor,FishSchool};
};
__defs["games/fish-leap/scene.mjs"]=()=>{
const {ACTOR_SCALE, FISH_SCALE, POSE_MS, STARTING_LIVES, clamp, lerp}=__get("games/fish-leap/core.mjs");
const {NET_CD_MS}=__get("games/fish-leap/difficulty.mjs");
const {LOBBY_COMPANION_BASELINE, LOBBY_COMPANION_SIZE}=__get("runtime/presentation.mjs");
const FISH_CENTER_OFFSET = 4;
const HIT_HALF_WIDTH = 48;
const HIT_HALF_HEIGHT = 32;
const FULL_CIRCLE = Math.PI * 2;
const NET_PIXELS = [
  '...#####...', '..#..#..#..', '.#.#.#.#.#.', '.#..#.#..#.', '..#######..',
  '.....#.....', '....#......', '...#.......', '..#........', '..#........',
];

function drawLamp(ctx, x, y, lit) {
  ctx.fillStyle = '#634638';
  ctx.fillRect(x + 2, y, 6, 11);
  ctx.fillRect(x, y + 2, 10, 7);
  ctx.fillStyle = lit ? '#f9bd66' : '#776b58';
  ctx.fillRect(x + 2, y + 2, 6, 7);
  ctx.fillStyle = lit ? '#fff0a2' : '#8d8068';
  ctx.fillRect(x + 3, y + 2, 4, 2);
}

async function loadMotion({manifest, loadAtlas} = {}) {
  if (manifest) return {...manifest, image: await loadAtlas(manifest.image)};
  const image = new Image();
  image.src = new URL('./assets/motion.png', "braingames:/scene.mjs").href;
  const [index] = await Promise.all([
    fetch(new URL('./assets/motion.json', "braingames:/scene.mjs")).then(response => {
      if (!response.ok) throw Error('动画索引加载失败');
      return response.json();
    }),
    image.decode(),
  ]);
  return {...index, image};
}

function guideFrame(ctx, art, clip, index, x, y, maxWidth, maxHeight) {
  const [sx, sy, width, height] = art.clips[clip].at(index).rect;
  const scale = Math.min(maxWidth / width, maxHeight / height);
  ctx.drawImage(art.image, sx, sy, width, height, x - Math.round(width * scale / 2),
    y - Math.round(height * scale / 2), Math.round(width * scale), Math.round(height * scale));
}

function drawRuleArt(scoop, evolution, loss, art) {
  const net = scoop.getContext('2d');
  net.imageSmoothingEnabled = false;
  guideFrame(net, art, 'scoop-right', art.contactFrame, 56, 31, 98, 58);
  const change = evolution.getContext('2d');
  change.imageSmoothingEnabled = false;
  guideFrame(change, art, 'swim', 0, 22, 32, 38, 24);
  change.fillStyle = '#9f8355';
  change.fillRect(44, 31, 15, 2);
  change.fillRect(55, 28, 2, 8);
  change.fillRect(57, 30, 2, 4);
  guideFrame(change, art, 'evolve-right', -1, 87, 31, 47, 57);
  const life = loss.getContext('2d');
  life.fillStyle = '#634638';
  life.fillRect(1, 9, 9, 2);
  drawLamp(life, 15, 2, true);
}

function hitsFish(fish, x, y) {
  const angle = fish.angle;
  const dx = x - fish.x;
  const dy = y - fish.y;
  const along = Math.cos(angle) * dx + Math.sin(angle) * dy;
  const across = -Math.sin(angle) * dx + Math.cos(angle) * dy;
  return (along / HIT_HALF_WIDTH) ** 2 + (across / HIT_HALF_HEIGHT) ** 2 <= 1;
}

function poseFrame(time, length) {
  return clamp(Math.floor(time / POSE_MS), 0, length - 1);
}

class Scene {
  constructor(canvas, motion) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.motion = motion;
  }

  get netOffsets() {
    return Object.fromEntries(['left', 'right'].map(side => [
      side, this.motion.clips['scoop-' + side].map(frame => frame.net.map(value => value * ACTOR_SCALE)),
    ]));
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.scale = Math.min(1.5, devicePixelRatio);
    this.canvas.width = Math.round(width * this.scale);
    this.canvas.height = Math.round(height * this.scale);
    this.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  sprite(clip, index, x, y, scale = 1, ctx = this.ctx) {
    const frame = this.motion.clips[clip][index];
    const [sx, sy, width, height] = frame.rect;
    const [dx, dy] = frame.offset;
    ctx.drawImage(this.motion.image, sx, sy, width, height, x + dx * scale, y + dy * scale,
      width * scale, height * scale);
  }

  ripple(x, y, amount, color = '#a4e4db') {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha *= .5 * (1 - amount);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, 9 + amount * 18, 3 + amount * 8, 0, 0, FULL_CIRCLE);
    ctx.stroke();
    ctx.restore();
  }

  drawFish(fish, time, scale = FISH_SCALE) {
    const ctx = this.ctx;
    const age = time - fish.born;
    const swim = Math.floor((age + fish.id * 77) / POSE_MS) % 6;
    if (age < 180) this.ripple(fish.x, fish.y + 3, clamp(age / 180, 0, 1));
    ctx.save();
    ctx.translate(Math.round(fish.x), Math.round(fish.y));
    if (Math.cos(fish.angle) < 0) {
      ctx.rotate(fish.angle - Math.PI);
      ctx.scale(-1, 1);
    } else {
      ctx.rotate(fish.angle);
    }
    this.sprite('swim', swim, FISH_CENTER_OFFSET * scale, 0, scale);
    ctx.restore();
  }

  drawDeparture(effect, time) {
    const ctx = this.ctx;
    const progress = clamp((time - effect.at) / effect.duration, 0, 1);
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    const fish = {...effect,
      x: effect.x + Math.cos(effect.angle) * 16 * progress,
      y: effect.y + Math.sin(effect.angle) * 16 * progress + progress * 5};
    this.drawFish(fish, time);
    ctx.restore();
    this.ripple(effect.x, effect.y + 6, progress);
    return fish;
  }

  drawEvolution(effect, time) {
    const ctx = this.ctx;
    const elapsed = time - effect.at;
    const side = Math.cos(effect.angle) < 0 ? 'left' : 'right';
    const sign = side === 'left' ? -1 : 1;
    const clip = 'evolve-' + side;
    const frames = this.motion.clips[clip];
    const index = poseFrame(elapsed, frames.length);
    const {rect: [, , width, height], offset: [dx, dy]} = frames[index];
    const shift = sign * FISH_CENTER_OFFSET;
    const x = Math.round(clamp(effect.x, 3 - (dx + shift) * FISH_SCALE, this.width - 3 - (dx + shift + width) * FISH_SCALE));
    const y = Math.round(clamp(effect.y, 4 - dy * FISH_SCALE, this.height - 6 - (dy + height) * FISH_SCALE));
    const splashAge = (elapsed - 16 * POSE_MS) / (9 * POSE_MS);
    if (splashAge > 0 && splashAge < 1) {
      this.ripple(x + sign * 37, Math.min(y + 32, this.height - 12), splashAge, '#aaf0e7');
    }
    const angle = effect.angle - (sign < 0 ? Math.PI : 0);
    const turn = Math.atan2(Math.sin(angle), Math.cos(angle)) * (1 - clamp(elapsed / (4 * POSE_MS), 0, 1));
    ctx.save();
    ctx.globalAlpha = clamp((effect.duration - elapsed) / (3 * POSE_MS), 0, 1);
    ctx.translate(x, y);
    ctx.rotate(turn);
    this.sprite(clip, index, shift * FISH_SCALE, 0, FISH_SCALE);
    ctx.restore();
    const centerX = (dx + shift + width / 2) * FISH_SCALE;
    const centerY = (dy + height / 2) * FISH_SCALE;
    return {
      id: effect.id,
      x: x + Math.cos(turn) * centerX - Math.sin(turn) * centerY,
      y: y + Math.sin(turn) * centerX + Math.cos(turn) * centerY,
      angle: turn,
      halfWidth: Math.max(HIT_HALF_WIDTH, width * FISH_SCALE / 2),
      halfHeight: Math.max(HIT_HALF_HEIGHT, height * FISH_SCALE / 2),
    };
  }

  fishingPlateBox(school) {
    const width = 76;
    return {left: clamp(Math.round(school.actor.x) - width / 2, 3, this.width - width - 3),
      top: Math.min(Math.round(school.actor.y) + 4, this.height - 30), width, height: 28};
  }

  drawFishingPlate(school, ctx = this.ctx) {
    const {left: x, top: y, width} = this.fishingPlateBox(school);
    const remaining = Math.min(NET_CD_MS, school.netRemaining);
    const ready = remaining === 0;

    ctx.fillStyle = '#382f29';
    ctx.fillRect(x + 3, y, width - 6, 28);
    ctx.fillRect(x, y + 3, width, 22);
    ctx.fillStyle = '#9d704c';
    ctx.fillRect(x + 2, y + 3, width - 4, 22);
    ctx.fillStyle = '#d3ac7b';
    ctx.fillRect(x + 4, y + 2, width - 8, 17);
    ctx.fillStyle = '#f2cc93';
    ctx.fillRect(x + 6, y + 2, width - 12, 1);

    ctx.fillStyle = ready ? '#27483e' : '#6c573e';
    for (const [row, pixels] of NET_PIXELS.entries()) {
      for (let column = 0; column < pixels.length; column++) {
        if (pixels[column] === '#') ctx.fillRect(x + 8 + column, y + 6 + row, 1, 1);
      }
    }
    for (let index = 0; index < STARTING_LIVES; index++) {
      drawLamp(ctx, x + 26 + 14 * index, y + 5, index < school.lives);
    }
    ctx.fillStyle = '#514335';
    ctx.fillRect(x + 6, y + 19, width - 12, 6);
    ctx.fillStyle = '#2d433e';
    ctx.fillRect(x + 7, y + 20, width - 14, 4);
    ctx.fillStyle = ready ? '#b7e1bf' : '#f4c777';
    ctx.fillRect(x + 7, y + 20, Math.round((width - 14) * (1 - remaining / NET_CD_MS)), 4);
  }

  drawActor(school) {
    const pose = school.actorPose();
    const {x, y} = school.actor;
    this.sprite(pose.clip, pose.index, x, y, ACTOR_SCALE);
    const active = school.capture;
    if (!active || active.fish.locked) return;
    const after = clamp((school.time - active.contactAt) / 375, 0, 1);
    if (after === 1) return;
    const net = this.motion.clips[pose.clip][pose.index].net;
    const netX = x + net[0] * ACTOR_SCALE;
    const netY = y + net[1] * ACTOR_SCALE;
    const ctx = this.ctx;
    ctx.save();
    const direction = Math.atan2(Math.sin(active.fish.angle), Math.cos(active.fish.angle));
    const horizontal = Math.abs(direction) > Math.PI / 2 ? Math.sign(direction) * Math.PI : 0;
    const angle = lerp(direction, horizontal, clamp(after * 3, 0, 1));
    const fish = {...active.fish, x: netX, y: netY + lerp(0, 6, after), angle};
    this.drawFish(fish, school.time, FISH_SCALE * (1 - after));
    ctx.restore();
    if (after < .7) this.ripple(active.fish.x, active.fish.y + 6, after / .7, '#eed69e');
    return fish;
  }

  actorHit(school) {
    const {clip, index} = school.actorPose();
    const {rect: [, , width, height], offset: [dx, dy]} = this.motion.clips[clip][index];
    const x = school.actor.x + dx * ACTOR_SCALE;
    const y = school.actor.y + dy * ACTOR_SCALE;
    const left = clamp(x, 0, this.width);
    const top = clamp(y, 0, this.height);
    return {left, top, width: clamp(x + width * ACTOR_SCALE, 0, this.width) - left,
      height: clamp(y + height * ACTOR_SCALE, 0, this.height) - top};
  }

  drawMovePreview(canvas, school) {
    const actor = this.actorHit(school);
    const plate = this.fishingPlateBox(school);
    const left = Math.floor(Math.min(actor.left, plate.left));
    const top = Math.floor(Math.min(actor.top, plate.top));
    const width = Math.ceil(Math.max(actor.left + actor.width, plate.left + plate.width)) - left;
    const height = Math.ceil(Math.max(actor.top + actor.height, plate.top + plate.height)) - top;
    canvas.width = Math.ceil(width * this.scale);
    canvas.height = Math.ceil(height * this.scale);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(this.scale, 0, 0, this.scale, -left * this.scale, -top * this.scale);
    ctx.imageSmoothingEnabled = false;
    const {clip, index} = school.actorPose();
    this.sprite(clip, index, school.actor.x, school.actor.y, ACTOR_SCALE, ctx);
    this.drawFishingPlate(school, ctx);
    return {left, top, width, height};
  }

  drawLobby(canvas, finished) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    const clip = finished ? 'react-ordinary-left' : 'idle-left';
    const index = finished ? 6 : 0;
    const {offset, rect} = this.motion.clips[clip][index];
    const scale = ACTOR_SCALE;
    this.sprite(clip, index,
      LOBBY_COMPANION_SIZE / 2 - (offset[0] + rect[2] / 2) * scale,
      LOBBY_COMPANION_BASELINE - (offset[1] + rect[3]) * scale, scale, ctx);
  }

  draw(school, moving = false) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    const fading = [];
    for (const effect of school.effects) {
      if (effect.kind === 'leave') fading.push(this.drawDeparture(effect, school.time));
    }
    if (!moving) {
      const netted = this.drawActor(school);
      if (netted) fading.push(netted);
      this.drawFishingPlate(school);
    }
    for (const effect of school.effects) {
      if (effect.kind === 'evolution') fading.push(this.drawEvolution(effect, school.time));
    }
    for (const fish of school.fish) this.drawFish(fish, school.swimTime);
    return fading;
  }
}

return {HIT_HALF_WIDTH,HIT_HALF_HEIGHT,loadMotion,drawRuleArt,hitsFish,Scene};
};
__defs["games/fish-leap/experience.mjs"]=()=>{
const {createMoveHandle}=__get("runtime/move-handle.mjs");
const {RECOVERY_MS}=__get("runtime/presentation.mjs");
const {GAME_COPY, SHARED_COPY}=__get("runtime/game-catalog.mjs");
const {applyCopy}=__get("runtime/apply-copy.mjs");
const {mountControlGuide}=__get("runtime/control-guide.mjs");
const {mountGameRecords}=__get("runtime/game-records.mjs");
const {createPixelText}=__get("runtime/pixel-text.mjs");
const {FISH_HIT_GRACE_MS, FishSchool, MIN_VIEW, clampActor}=__get("games/fish-leap/core.mjs");
const {HIT_HALF_HEIGHT, HIT_HALF_WIDTH, Scene, drawRuleArt, hitsFish, loadMotion}=__get("games/fish-leap/scene.mjs");
const copy = GAME_COPY['fish-leap'];
const positionKey = 'braingames.fish-leap.position.v1';
const MAX_FRAME_GAP_MS = 250;
const hide = (element, value) => { if (element.hidden !== value) element.hidden = value; };
const setText = (element, value) => { if (element.textContent !== value) element.textContent = value; };
function place(element, area) {
  for (const [property, value] of Object.entries(area)) {
    const pixels = Math.round(value) + 'px';
    if (element.style[property] !== pixels) element.style[property] = pixels;
  }
}

function setFishAccess(button, live, enabled) {
  if (live && button.hasAttribute('aria-hidden')) button.removeAttribute('aria-hidden');
  else if (!live && !button.hasAttribute('aria-hidden')) button.setAttribute('aria-hidden', 'true');
  if (button.getAttribute('aria-disabled') !== String(!enabled)) {
    button.setAttribute('aria-disabled', String(!enabled));
    button.tabIndex = enabled ? 0 : -1;
  }
}

async function source(file) {
  const response = await fetch(new URL(file, "braingames:/experience.mjs"));
  if (!response.ok) throw Error('捞鱼文件加载失败 ' + file);
  return response.text();
}

function mountGame(host, options) {
  const shadow = host.attachShadow({mode: 'open'});
  const style = document.createElement('style');
  const root = document.createElement('main');
  root.className = 'stage';
  shadow.append(style, root);
  const $ = id => root.querySelector('#' + id);
  const font = new FontFace('Whale Fish Pixel', options.ui ? options.ui.fontBytes :
    'url("' + new URL('./ui/song-subset.ttf', "braingames:/experience.mjs").href + '")');
  const buttons = new Map();
  const errors = [];
  const initialTier = options.practiceTier ?? 0;
  const bestKey = 'braingames.fish-leap.bestSeconds.v1' + (initialTier ? '.tier-' + (initialTier + 1) : '');
  let art, scene, netOffsets, pixelText, observer, school, hold, drag, position, records;
  let saved = options.checkpoint;
  let width = 0, height = 0, small = false, ready = false, disposed = false, pending = false;
  let presented = false, frozen = false, recovery = 0, raf = null, last = null;
  let canReplay = true, canRandom = Boolean(options.canRandom), best = 0, moveFrame = null;

  function playing() { return school && school.phase !== 'ended'; }
  function canAct() {
    return ready && presented && !frozen && !small && !recovery && !errors.length && school?.phase === 'playing';
  }
  function available() {
    return canAct() && !hold.isPressed() && !school.capture && school.netRemaining === 0;
  }
  function canMove() {
    return canAct() && !school.capture;
  }

  function view() {
    if (errors.length) return 'error';
    if (!ready) return 'loading';
    if (!school && !saved) return 'welcome';
    if (school?.phase === 'ended') return 'finished';
    return presented ? 'playing' : 'paused';
  }

  function updateInputs() {
    if (!ready) return;
    $('start').disabled = $('replay').disabled = !presented || small || !canReplay || pending;
    hide($('random'), !canRandom);
    $('random').disabled = !presented || small || pending;
  }

  function updateWhale() {
    const whale = $('move-whale');
    const resume = Boolean(playing() && frozen && !small && !errors.length);
    const show = resume || Boolean(playing() && presented && !small && !school.capture && !errors.length);
    hide(whale, !show);
    if (whale.hasAttribute('data-game-resume') !== resume) {
      whale.toggleAttribute('data-game-resume', resume);
      whale.title = resume ? SHARED_COPY.freezeHint : SHARED_COPY.moveHint;
      whale.setAttribute('aria-label', whale.title);
      whale.tabIndex = resume ? 0 : -1;
    }
    whale.toggleAttribute('data-movable', canMove());
    if (show) place(whale, scene.actorHit(school));
  }

  function placeFishButton(controls, key, item, live, enabled) {
    let entry = buttons.get(key);
    if (!entry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'fish';
      if (live) {
        button.dataset.fish = item.id;
        button.setAttribute('aria-label', '捞这条金鱼');
      } else button.dataset.fishEffect = item.id;
      controls.append(button);
      entry = {button};
      buttons.set(key, entry);
    }
    const {button} = entry;
    const halfWidth = item.halfWidth ?? HIT_HALF_WIDTH;
    const halfHeight = item.halfHeight ?? HIT_HALF_HEIGHT;
    const transform = 'translate(' + Math.round(item.x - halfWidth) + 'px,' +
      Math.round(item.y - halfHeight) + 'px) rotate(' + item.angle.toFixed(3) + 'rad)';
    if (entry.halfWidth !== halfWidth || entry.halfHeight !== halfHeight) {
      place(button, {width: halfWidth * 2, height: halfHeight * 2});
      Object.assign(entry, {halfWidth, halfHeight});
    }
    if (entry.transform !== transform) { button.style.transform = transform; entry.transform = transform; }
    setFishAccess(button, live, enabled);
    entry.drawn = true;
    entry.missingSince = null;
  }

  function syncFish(fading = []) {
    const controls = $('fish-controls');
    const active = playing() && presented && !frozen && !small && !errors.length;
    const guard = $('cast-guard');
    const casting = active && Boolean(school.capture);
    if (controls.inert === active) controls.inert = !active;
    hide(guard, !casting);
    if (!playing() || errors.length) {
      for (const {button} of buttons.values()) button.remove();
      buttons.clear();
    }
    if (!active) return;
    if (casting) {
      place(guard, scene.actorHit(school));
    }
    const enabled = available();
    for (const entry of buttons.values()) entry.drawn = false;
    for (const fish of school.fish) placeFishButton(controls, fish.id, fish, true, enabled && !fish.locked);
    for (const fish of fading) placeFishButton(controls, 'effect-' + fish.id, fish, false, false);
    for (const [key, entry] of buttons) {
      if (entry.drawn) continue;
      // Keep the last drawn position briefly as a mouse target without a catch action.
      entry.missingSince ??= school.time;
      if (school.time - entry.missingSince >= FISH_HIT_GRACE_MS) {
        entry.button.remove();
        buttons.delete(key);
      } else setFishAccess(entry.button, false, false);
    }
  }

  function drawRound() {
    updateWhale();
    syncFish(scene.draw(school, Boolean(drag)));
    const {lives, effects, capture, netRemaining} = school;
    const netReady = !capture && netRemaining === 0;
    const net = capture ? copy.netCasting : netReady ? copy.netReady : copy.netCooling;
    const atLoss = effects.some(effect => effect.kind === 'evolution');
    setText($('round-status'), (atLoss ? copy.netLoss : '') +
      copy.lives.replace('{lives}', lives) + net + '。' + (copy.feedback[school.reaction] ?? ''));
  }

  function redraw() {
    if (!ready || small) return;
    const current = view();
    const showRound = Boolean(school && (current === 'playing' || current === 'paused'));
    hide($('lobby'), showRound || current === 'paused');
    hide($('welcome'), current !== 'welcome');
    hide($('result'), current !== 'finished');
    hide($('error'), current !== 'error');
    hide($('companion'), current === 'error');
    hide($('canvas'), !showRound);
    hide($('fish-controls'), !showRound);
    updateInputs();
    if (showRound) drawRound();
    else {
      updateWhale();
      syncFish();
      setText($('round-status'), '');
      if (current !== 'error') scene.drawLobby($('companion'), current === 'finished');
      if (current === 'finished') {
        const seconds = Math.floor(school.frozenAt / 1000);
        if (seconds > best) {
          best = records.saveScore(bestKey, seconds);
        }
        setText($('score'), String(seconds));
        setText($('best-value'), String(best));
      }
    }
  }

  function clickedFish(event, button) {
    if (event.detail === 0) return Number(button.dataset.fish);
    const bounds = root.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    let closest = Infinity;
    let id;
    for (const fish of school.fish) {
      if (fish.locked || !hitsFish(fish, x, y)) continue;
      const distance = (fish.x - x) ** 2 + (fish.y - y) ** 2;
      if (distance < closest) {
        closest = distance;
        id = fish.id;
      }
    }
    return id;
  }

  function schedule() {
    if (raf === null && presented && !frozen && !small && !disposed && !errors.length && playing() && !hold.isPressed()) {
      raf = requestAnimationFrame(tick);
    }
  }

  function stop() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = last = null;
  }

  function beginMove() {
    drag = {origin: {...school.actor}, point: null};
    const preview = $('move-preview');
    place(preview, scene.drawMovePreview(preview, school));
    hide(preview, false);
    drawRound();
  }

  function moveWhale(dx, dy) {
    const {x, y} = drag.origin;
    drag.point = clampActor(x + dx, y + dy, width, height);
    if (moveFrame !== null) return;
    moveFrame = requestAnimationFrame(() => {
      moveFrame = null;
      const {point, origin} = drag;
      const transform = `translate3d(${point.x - origin.x}px, ${point.y - origin.y}px, 0)`;
      $('move-preview').style.transform = $('move-whale').style.transform = transform;
    });
  }

  function finishMove(commit, dx, dy) {
    if (moveFrame !== null) cancelAnimationFrame(moveFrame);
    moveFrame = null;
    hide($('move-preview'), true);
    $('move-preview').style.transform = $('move-whale').style.transform = '';
    const origin = drag?.origin;
    drag = null;
    if (commit) {
      const point = clampActor(origin.x + dx, origin.y + dy, width, height);
      if (point.x !== origin.x || point.y !== origin.y) {
        Object.assign(school.actor, point);
        position = {x: point.x / width, y: point.y / height};
        records.savePosition(positionKey, position);
      }
      recovery = performance.now() + RECOVERY_MS;
    }
    if (presented && !small && !disposed && !errors.length) drawRound();
    schedule();
  }

  function tick(now) {
    raf = null;
    try {
      if (now < recovery) { schedule(); return; }
      recovery = 0;
      if (last !== null) {
        if (now - last > MAX_FRAME_GAP_MS) {
          recovery = now + RECOVERY_MS;
          last = null;
        } else {
          school.advance(now - last);
        }
      }
      if (!recovery) last = now;
      if (playing()) drawRound();
      else {
        redraw();
        pixelText.flush();
        if (!$('replay').disabled) $('replay').focus({preventScroll: true});
        options.onViewChange();
      }
      schedule();
    } catch (error) { fail(error); }
  }

  function fit() {
    const nextWidth = root.clientWidth;
    const nextHeight = root.clientHeight;
    small = nextWidth < MIN_VIEW.width || nextHeight < MIN_VIEW.height;
    root.toggleAttribute('data-small', small);
    root.toggleAttribute('data-compact', nextWidth < 500);
    if (small || width !== nextWidth || height !== nextHeight) hold.cancel({untilRelease: presented});
    if (small) {
      stop();
      syncFish();
      updateWhale();
    } else {
      if (width !== nextWidth || height !== nextHeight) {
        width = nextWidth;
        height = nextHeight;
        scene.resize(width, height);
        if (saved) {
          school = new FishSchool(width, height, {netOffsets, saved});
          saved = null;
        } else school?.resize(width, height);
      } else if (scene.scale !== Math.min(1.5, devicePixelRatio)) scene.resize(width, height);
      redraw();
      schedule();
    }
    options.onViewChange();
  }

  function fail(error) {
    errors.push(error.message);
    hold?.cancel({untilRelease: true});
    stop();
    if (ready) redraw();
    options.onViewChange();
    console.error(error);
  }

  function suspend() {
    presented = false;
    recovery = 0;
    hold?.cancel({untilRelease: true});
    stop();
    pixelText?.suspend();
    redraw();
  }

  async function start() {
    if (pending || !ready || small || !canReplay || !['welcome', 'finished'].includes(view())) return;
    pending = true;
    updateInputs();
    try {
      if (!await options.beforePlay() || !presented || disposed || small) return;
      const seed = crypto.getRandomValues(new Uint32Array(1))[0];
      school = new FishSchool(width, height, {tier: initialTier, seed, netOffsets});
      if (position) Object.assign(school.actor, clampActor(position.x * width, position.y * height, width, height));
      redraw();
      schedule();
      options.onViewChange();
    } catch (error) { fail(error); }
    finally { pending = false; updateInputs(); }
  }

  async function present({resume = true, start: directStart = false} = {}) {
    if (playing() && resume && !presented) recovery = performance.now() + RECOVERY_MS;
    presented = true;
    pixelText.present();
    if (directStart && view() === 'welcome') await start();
    redraw();
    pixelText.flush();
    schedule();
  }

  const initialization = (async () => {
    const [css, html, motion] = await Promise.all([options.ui?.style ?? source('./style.css'),
      options.ui?.markup ?? source('./markup.html'), loadMotion(options), font.load()]);
    if (disposed) { motion.image.close?.(); return false; }
    art = motion;
    document.fonts.add(font);
    style.textContent = css;
    root.innerHTML = html;
    $('move-whale').title = SHARED_COPY.moveHint;
    $('move-whale').setAttribute('aria-label', SHARED_COPY.moveHint);
    $('rule-light-loss').setAttribute('aria-label', copy.ruleLampLoss);
    applyCopy(root, {'#rule-a': copy.ruleCatch, '#fish-wait': copy.ruleWait, '#fish-instruction': copy.ruleNote,
      '#fish-rules-access': copy.ruleAccess, '#start': copy.start, '#unit': copy.resultUnit, '#best-unit': copy.resultUnit});
    mountControlGuide(root, copy);
    records = mountGameRecords(root, '#welcome', '#result');
    if (initialTier) {
      setText($('practice'), '第 ' + (initialTier + 1) + ' 档试玩');
      hide($('practice'), false);
    }
    drawRuleArt($('rule-scoop'), $('rule-evolve'), $('rule-light-loss'), art);
    scene = new Scene($('canvas'), art);
    netOffsets = scene.netOffsets;
    best = records.readScore(bestKey);
    position = records.readPosition(positionKey);
    hold = createMoveHandle($('move-whale'), {
      canMove,
      onGrab() { stop(); drawRound(); },
      onActivate: beginMove,
      onMove: moveWhale,
      onDrop: finishMove,
      onCancel: () => finishMove(false),
      onTap() {},
      onError: fail,
    });
    $('fish-controls').addEventListener('pointerdown', event => {
      if (event.target.closest('#cast-guard, .fish[aria-disabled="true"]')) event.preventDefault();
    });
    $('fish-controls').addEventListener('click', event => {
      const button = event.target.closest('.fish[data-fish]');
      if (!button || !canAct() || hold.isPressed()) return;
      const id = clickedFish(event, button);
      if (id === undefined) return;
      if (available() && school.scoop(id)) drawRound();
    });
    $('move-whale').addEventListener('click', () => {
      if (frozen) Promise.resolve(options.onResume()).catch(fail);
    });
    for (const id of ['start', 'replay']) $(id).addEventListener('click', () => void start());
    $('random').addEventListener('click', () => {
      if (canRandom && view() === 'finished') Promise.resolve(options.onRandom()).catch(fail);
    });
    $('reload').addEventListener('click', () => Promise.resolve(options.onReload()).catch(fail));
    pixelText = createPixelText(root, {alphaThreshold: 24});
    pixelText.suspend();
    ready = true;
    fit();
    observer = new ResizeObserver(() => { try { fit(); } catch (error) { fail(error); } });
    observer.observe(root);
    return true;
  })().catch(error => { fail(error); return false; });

  return {
    ready: initialization, present, suspend, preview: suspend,
    getRoot: () => root,
    getRunState: () => ({view: view(), hasRound: Boolean(school || saved)}),
    snapshot: () => ({view: view(), ready, presented, viewportBlocked: small, rafPending: raf !== null,
      recovering: Boolean(recovery), relocating: Boolean(drag), best, errors: [...errors], session: school?.checkpoint().state ?? null,
      viewport: {width, height}}),
    checkpoint: () => !ready || errors.length ? null : saved ?? school?.checkpoint() ?? null,
    setFrozen(value) { frozen = value; if (ready) updateWhale(); },
    setAvailability(next) { canReplay = next.canReplay; canRandom = next.canRandom; updateInputs(); },
    paintStatic: redraw,
    async dispose() {
      disposed = true;
      stop();
      await initialization;
      observer?.disconnect();
      hold?.dispose();
      pixelText?.dispose();
      document.fonts.delete(font);
      art?.image.close?.();
      shadow.replaceChildren();
    },
  };
}

return {mountGame};
};
__defs["runtime/transparent-stage.mjs"]=()=>{

// Transparent scene: only explicit game controls own mouse input.
function createTransparentStage(container,options={}){
  if(!(container instanceof HTMLElement))throw TypeError('Stage container must be an HTMLElement');
  if(container.querySelector(':scope > [data-braingames-stage]'))throw Error('Stage is already mounted');
  const wrapper=document.createElement('div');wrapper.dataset.braingamesStage='';wrapper.tabIndex=-1;
  Object.assign(wrapper.style,{position:'absolute',inset:0,isolation:'isolate',overflow:'hidden',pointerEvents:'none',visibility:'hidden'});
  wrapper.inert=true;wrapper.setAttribute('aria-hidden','true');
  const shadow=wrapper.attachShadow({mode:'open'}),gameHost=document.createElement('div');
  Object.assign(gameHost.style,{position:'absolute',inset:0,pointerEvents:'none'});shadow.append(gameHost);container.append(wrapper);
  const listeners=[],heldKeys=new Set(),uncertainKeys=new Set(),heldPointers=new Set(),clickTails=new Set(),events=[],modifiers=new Set();
  const frozenTabStops=new Map();
  let shortcutYield=false;
  let visible=false,retainVisible=options.keepVisibleOnPause===true;
  const gameKeys=options.keys, suppressContextMenu=options.suppressContextMenu===true;
  let menuPointer=null;
  let foreground=false,disposed=false,disposing=false,activation=0,previousFocus=null,disposePromise=null,game;
  const keyId=e=>e.code||({' ':'Space',Escape:'Escape',Enter:'Enter',Tab:'Tab'}[e.key]??e.key);
  const inside=e=>e.composedPath().includes(wrapper);
  const on=(target,type,fn,opts)=>{target.addEventListener(type,fn,opts);listeners.push(()=>target.removeEventListener(type,fn,opts));};
  const record=(type,reason)=>{events.push({type,reason,at:Date.now()});if(events.length>64)events.shift();};
  const notifyGuard=()=>options.onInputGuardChange?.({foreground,heldCodes:[...heldKeys],ownedKeys:gameKeys});
  function show(){visible=true;wrapper.style.visibility='visible';wrapper.inert=false;wrapper.removeAttribute('aria-hidden');}
  function conceal(){visible=false;wrapper.style.visibility='hidden';wrapper.inert=true;wrapper.setAttribute('aria-hidden','true');}
  function freezeInputs(active){
    game.setFrozen?.(active);
    if(active){
      game.paintStatic?.();
      for(const node of game.getRoot().querySelectorAll('button,a[href],input,select,textarea,[tabindex]')){
        if(node.hasAttribute('data-game-resume')||frozenTabStops.has(node))continue;
        frozenTabStops.set(node,node.getAttribute('tabindex'));node.tabIndex=-1;
      }
    }else{
      for(const [node,value]of frozenTabStops)if(value===null)node.removeAttribute('tabindex');else node.setAttribute('tabindex',value);
      frozenTabStops.clear();
    }
  }
  function background(reason='task-pointer',{restoreFocus=true,visible:keepVisible=retainVisible&&['playing','paused'].includes(game.getRunState().view)}={}){
    ++activation;const wasForeground=foreground;foreground=false;
    if(wasForeground||visible)game.suspend(reason);
    if(keepVisible&&visible){gameHost.dataset.presentation='frozen';freezeInputs(true);}
    else{freezeInputs(false);conceal();}
    notifyGuard();options.onModeChange?.('background',reason);record('background',reason);
    if(restoreFocus&&document.hasFocus()&&previousFocus?.isConnected&&!previousFocus.inert)previousFocus.focus({preventScroll:true});
    return{mode:'background',visible};
  }
  function preview(reason='preview'){
    ++activation;foreground=false;show();gameHost.dataset.presentation='waiting';game.preview(reason);
    notifyGuard();options.onModeChange?.('background',reason);record('preview',reason);return{mode:'background',visible};
  }
  async function bringToForeground({resume=true,start=false}={}){
    const ticket=++activation;
    if(!await ready||disposed||disposing||ticket!==activation)return{mode:'background'};
    if(game.snapshot().viewportBlocked)return{mode:'background',reason:'viewport'};
    if(foreground)return{mode:'foreground'};
    if(document.activeElement!==wrapper)previousFocus=options.getReturnFocus?options.getReturnFocus():document.activeElement;
    foreground=true;show();gameHost.dataset.presentation='active';freezeInputs(false);
    try{notifyGuard();options.onModeChange?.('foreground','manual');wrapper.focus({preventScroll:true});await game.present({resume,start});}
    catch(error){background('activation-error');throw error;}
    if(!foreground||ticket!==activation)return{mode:'background'};
    record('foreground','manual');return{mode:'foreground'};
  }
  function consume(e){e.preventDefault();e.stopImmediatePropagation();}
  on(window,'keydown',e=>{
    const key=keyId(e);
    const modifier=/^(Control|Alt|Meta)(Left|Right)?$/.test(key);
    if(modifier)modifiers.add(key);
    if(!foreground){
      if(uncertainKeys.has(key)&&!e.repeat){uncertainKeys.delete(key);heldKeys.delete(key);notifyGuard();}
      else if(heldKeys.has(key))consume(e);
      return;
    }
    // Give the host its normal shortcuts before native command arbitration.
    // A modifier-triggered yield is remembered only for that held chord, so
    // the foreground toggle closes this stage instead of reopening it.
    if(modifier){shortcutYield=true;background('task-shortcut');return;}
    if(e.isComposing||e.ctrlKey||e.metaKey||e.altKey||![...gameKeys,'ShiftLeft','ShiftRight'].includes(key)){
      background('task-keyboard');return;
    }
    if(key.startsWith('Shift'))return;
    uncertainKeys.delete(key);
    heldKeys.add(key);
    if(!inside(e))consume(e);
  },{capture:true});
  on(window,'keyup',e=>{
    const key=keyId(e),owned=heldKeys.delete(key);uncertainKeys.delete(key);
    modifiers.delete(key);if(!modifiers.size)shortcutYield=false;
    if(owned&&!foreground)consume(e);
    if(owned)notifyGuard();
  },{capture:true});
  on(window,'pointerdown',e=>{
    shortcutYield=false;
    // A fresh down proves that an earlier sequence (possibly released while
    // the window was blurred) has ended. Do not swallow this new task click.
    heldPointers.delete(e.pointerId);clickTails.delete(e.pointerId);
    const inStage=inside(e);
    if(suppressContextMenu)menuPointer=inStage&&e.button===2?e.pointerId:null;
    if(inStage){if(document.activeElement!==wrapper)previousFocus=document.activeElement;if(foreground)heldPointers.add(e.pointerId);return;}
    if(!foreground)return;
    // Pass the same trusted event to the actual task: never replay a click.
    background('task-pointer',{restoreFocus:false});
  },{capture:true});
  on(window,'pointerup',e=>{
    if(!heldPointers.delete(e.pointerId))return;
    if(!foreground){clickTails.add(e.pointerId);consume(e);}
  },{capture:true});
  on(window,'pointercancel',e=>{heldPointers.delete(e.pointerId);clickTails.delete(e.pointerId);if(menuPointer===e.pointerId)menuPointer=null;},{capture:true});
  on(window,'click',e=>{if(clickTails.delete(e.pointerId))consume(e);},{capture:true});
  if(suppressContextMenu)on(window,'contextmenu',e=>{
    // The menu can arrive after pointer-up, with the task as its target.
    const startedOnStage=e.button===2&&e.pointerId===menuPointer;
    menuPointer=null;
    if(inside(e))e.preventDefault();
    else if(startedOnStage)consume(e);
  },{capture:true});
  on(window,'wheel',e=>{if(foreground&&!inside(e))background('task-scroll',{restoreFocus:false});},{capture:true,passive:true});
  on(document,'focusin',e=>{if(foreground&&e.target instanceof HTMLElement&&!inside(e))background('task-focus',{restoreFocus:false});},{capture:true});
  // iframe focus also blurs the parent window. Electron webview exposes its
  // focus on the embedding element; neither path needs guest-page access.
  on(document,'focus',e=>{if(foreground&&['IFRAME','WEBVIEW'].includes(e.target?.tagName)&&!inside(e))background('embedded-focus',{restoreFocus:false});},{capture:true});
  on(window,'blur',()=>{modifiers.clear();shortcutYield=false;for(const key of heldKeys)uncertainKeys.add(key);background('window-blur',{restoreFocus:false});});
  on(window,'compositionstart',()=>{if(foreground)background('composition');},{capture:true});
  on(document,'visibilitychange',()=>{if(document.hidden){for(const key of heldKeys)uncertainKeys.add(key);background('hidden',{restoreFocus:false});}});
  for(const type of['keydown','keyup','pointerdown','pointerup','click','dblclick','auxclick','contextmenu','beforeinput','input'])on(wrapper,type,e=>{if(foreground||(suppressContextMenu&&type==='contextmenu'))e.stopPropagation();});
  game=options.mountGame(gameHost,{assetsBase:options.assetsBase,ui:options.ui,manifest:options.manifest,loadAtlas:options.loadAtlas,checkpoint:options.checkpoint,presented:false,qa:options.qa===true,
    onResume:()=>bringToForeground({resume:true,start:false}),
    beforePlay:async()=>{if(!foreground)await bringToForeground({resume:false});return foreground&&!disposing;},
    isVisible:()=>visible,canRandom:options.canRandom,onRandom:options.onRandom,
    onReload:options.onReload,onViewChange(){options.onGameChange?.();},
    onExit:()=>background('manual',{visible:false})});
  const style=document.createElement('style');
  style.textContent=options.stageStyle+':host([data-presentation="frozen"]) *,:host([data-presentation="frozen"]) button{pointer-events:none!important}:host([data-presentation="frozen"]) [data-game-resume]{pointer-events:auto!important;cursor:pointer!important}:host([data-presentation="frozen"]) [data-game-resume]::after{content:"";position:absolute;right:0;top:0;width:12px;height:12px;pointer-events:none;background:linear-gradient(90deg,#fff8e4 0 3px,transparent 3px);clip-path:polygon(0 0,30% 0,30% 100%,0 100%,0 0,65% 0,95% 0,95% 100%,65% 100%);opacity:.8}';
  gameHost.shadowRoot.append(style);
  const ready=(async()=>{
    const success=await game.ready;
    if(success)for(const node of game.getRoot().querySelectorAll('[aria-modal]'))node.removeAttribute('aria-modal');
    return success;
  })();
  async function freezeVisible(reason='restored'){
    if(!await ready||disposed||disposing)return false;
    const state=game.getRunState();if(!['playing','paused'].includes(state.view))return false;
    foreground=false;show();gameHost.dataset.presentation='frozen';freezeInputs(true);notifyGuard();options.onModeChange?.('background',reason);return true;
  }
  function getDiagnostics(){return{kind:options.kind,visible,mode:foreground?'foreground':'background',resident:!disposed,disposed,
    initError:game.snapshot().errors.join('\n'),rafActive:game.snapshot().rafPending,heldKeys:[...heldKeys],heldPointers:[...heldPointers],
    backgroundInertCount:0,game:game.snapshot(),events:structuredClone(events)};}
  async function dispose(){
    if(disposePromise)return disposePromise;
    disposing=true;background('unload',{restoreFocus:false,visible:false});++activation;
    disposePromise=(async()=>{await ready;await game.dispose();for(const remove of listeners)remove();heldKeys.clear();uncertainKeys.clear();heldPointers.clear();clickTails.clear();notifyGuard();wrapper.remove();disposed=true;record('disposed','unload');return getDiagnostics();})();
    return disposePromise;
  }
  return{ready,foreground:bringToForeground,background,preview,freezeVisible,checkpoint:()=>game.checkpoint?.()??null,isVisible:()=>visible,dispose,getDiagnostics,getMode:()=>foreground?'foreground':'background',getRunState:()=>game.getRunState(),setKeepVisible:value=>{retainVisible=value;},setAvailability:value=>game.setAvailability(value),consumeShortcutYield(){const yielded=shortcutYield;shortcutYield=false;return yielded;},
    ...(options.qa===true?{review:game.review,configure:game.configure}:{})};
}

return {createTransparentStage};
};
__defs["games/fish-leap/dsh-stage.mjs"]=()=>{
const {mountGame}=__get("games/fish-leap/experience.mjs");
const {createTransparentStage}=__get("runtime/transparent-stage.mjs");
function mountStage(container, options = {}) {
  const stage = createTransparentStage(container, {
    ...options,
    mountGame: (host, callbacks) => mountGame(host, {...callbacks, practiceTier: options.practiceTier}),
    kind: 'fish-leap',
    keys: ['Space', 'Enter', 'Tab'],
    stageStyle: ':host,.stage,canvas,.paper{pointer-events:none!important}.stage button:not(:disabled){pointer-events:auto!important}.stage button:disabled,.stage [inert] button{pointer-events:none!important}',
  });
  container.querySelector(':scope > [data-braingames-stage]').style.outline = 'none';
  return stage;
}

return {mountStage};
};
const __entry=__get("games/fish-leap/dsh-stage.mjs");

const ui={"markup":"<canvas id=\"canvas\" aria-hidden=\"true\"></canvas>\n<canvas id=\"move-preview\" aria-hidden=\"true\" hidden></canvas>\n<div id=\"fish-controls\" role=\"group\" aria-label=\"游动的金鱼\" inert>\n  <div id=\"cast-guard\" aria-hidden=\"true\" hidden></div>\n</div>\n<button id=\"move-whale\" type=\"button\" tabindex=\"-1\" hidden></button>\n<div id=\"lobby\" data-braingames-lobby hidden>\n  <canvas id=\"companion\" width=\"200\" height=\"200\" aria-hidden=\"true\"></canvas>\n  <section id=\"welcome\" class=\"paper\" aria-labelledby=\"game-title\" hidden>\n    <h1 id=\"game-title\" data-braingames-title data-pixel-text></h1>\n    <div data-opening-guide>\n    <p id=\"practice\" data-pixel-text hidden></p>\n    <div class=\"rules\">\n      <div><canvas id=\"rule-scoop\" width=\"112\" height=\"60\" role=\"img\" aria-label=\"鲸鱼娘用网捞金鱼\"></canvas><span id=\"rule-a\" data-pixel-text></span></div>\n      <div><canvas id=\"rule-evolve\" width=\"112\" height=\"60\" role=\"img\" aria-label=\"金鱼变成 Claude 娘\"></canvas><canvas id=\"rule-light-loss\" width=\"26\" height=\"16\" role=\"img\"></canvas></div>\n    </div>\n    <div class=\"rule-note\"><p id=\"fish-wait\" data-pixel-text></p><p id=\"fish-instruction\" data-pixel-text></p></div>\n    <p data-braingames-controls=\"left\"></p>\n    <p id=\"fish-rules-access\" class=\"sr\"></p>\n    </div>\n    <button id=\"start\" class=\"primary\" type=\"button\" aria-describedby=\"fish-rules-access\" data-pixel-text></button>\n  </section>\n  <section id=\"result\" class=\"paper\" aria-labelledby=\"game-result-title\" role=\"dialog\" hidden>\n    <h2 id=\"game-result-title\" data-braingames-title data-pixel-text></h2>\n    <p id=\"result-lead\" data-braingames-copy=\"roundLabel\" data-pixel-text></p>\n    <p class=\"number\" aria-live=\"polite\"><strong id=\"score\" data-pixel-text></strong><span id=\"unit\" data-pixel-text></span></p>\n    <p class=\"best\"><span data-braingames-copy=\"bestLabel\" data-pixel-text></span><span class=\"best-score\"><strong id=\"best-value\" data-pixel-text></strong><span id=\"best-unit\" data-pixel-text></span></span></p>\n    <div class=\"actions\">\n      <button id=\"replay\" class=\"primary\" type=\"button\" data-braingames-copy=\"replay\" data-pixel-text></button>\n      <button id=\"random\" class=\"secondary\" type=\"button\" data-braingames-copy=\"next\" data-pixel-text hidden></button>\n    </div>\n  </section>\n  <section id=\"error\" class=\"paper\" role=\"alert\" hidden>\n    <p data-braingames-copy=\"loadedError\" data-pixel-text></p>\n    <button id=\"reload\" class=\"primary\" type=\"button\" data-braingames-copy=\"reload\" data-pixel-text></button>\n  </section>\n</div>\n<p id=\"round-status\" class=\"sr\" role=\"status\" aria-live=\"polite\"></p>\n","style":":host {\n  display: block; width: 100%; height: 100%; color-scheme: light dark;\n  --paper: #f6f0dd; --ink: #263248; --gold: #9f8355; --muted: #626974;\n}\n*, *::before, *::after { box-sizing: border-box; }\n[hidden] { display: none !important; }\n.stage { position: absolute; inset: 0; pointer-events: none; user-select: none; overflow: hidden; }\n#canvas { position: absolute; inset: 0; width: 100%; height: 100%; }\ncanvas { image-rendering: pixelated; }\nbutton { cursor: pointer; touch-action: manipulation; pointer-events: auto; }\nbutton:disabled { cursor: default; pointer-events: none; }\n.fish {\n  position: absolute; top: 0; left: 0; padding: 0; border: 0; border-radius: 50%; background: transparent;\n}\n.fish:not([aria-hidden]) { z-index: 1; }\n.fish[aria-disabled=\"true\"] { cursor: default; }\n.fish:focus-visible, #move-whale:focus-visible { outline: 2px solid #8d7052; outline-offset: -3px; }\n#cast-guard { position: absolute; pointer-events: auto; }\n#move-preview { position: absolute; pointer-events: none; }\n#move-whale { position: absolute; padding: 0; border: 0; background: transparent; cursor: default; touch-action: none; }\n#move-whale[data-movable] { cursor: grab; }\n#move-whale[data-dragging] { cursor: grabbing; }\n.paper {\n  padding: 20px; border: 2px solid var(--ink); background: var(--paper); color: var(--ink);\n  box-shadow: inset 2px 2px #fffbed, inset -2px -2px #d8ccb1, 4px 4px #0e172c55;\n  font: 18px/24px \"Whale Fish Pixel\", serif; text-align: center;\n  clip-path: polygon(0 4px,2px 4px,2px 2px,4px 2px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 2px,calc(100% - 2px) 2px,calc(100% - 2px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 2px) calc(100% - 4px),calc(100% - 2px) calc(100% - 2px),calc(100% - 4px) calc(100% - 2px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 2px),2px calc(100% - 2px),2px calc(100% - 4px),0 calc(100% - 4px));\n}\n.paper p, .paper h1, .paper h2 { margin: 0; font: inherit; }\n.rules { display: grid; grid-template-columns: repeat(2, 1fr); margin: 0 0 12px; padding: 4px 0 8px; }\n.rules > div { display: flex; flex-direction: column; align-items: center; gap: 8px; white-space: pre-line; font-size: 15px; line-height: 21px; }\n.paper .rule-note { font-size: 15px; line-height: 21px; color: var(--ink); margin: 0 0 8px; text-wrap: balance; }\n.rules > div > canvas:not(#rule-light-loss) { width: 112px; max-width: 100%; }\n#rule-light-loss { width: 39px; height: 24px; }\n.rules > div + div { border-left: 2px solid #e6ddc3; }\n.paper button { display: block; width: 100%; color: var(--ink); font: inherit; }\n.primary { min-height: 42px; padding: 7px 12px; border: 2px solid var(--gold); background: #f3d391;\n  box-shadow: inset 0 2px #ffe9b6, 0 2px var(--gold); }\n.primary:hover:not(:disabled), .primary:focus-visible { background: #f8dc9e; border-color: var(--ink); }\n.primary:active:not(:disabled) { transform: translateY(2px); }\n.paper .secondary { min-height: 36px; padding: 4px 8px; border: 2px solid transparent; color: var(--muted); background: transparent; }\n.secondary:hover:not(:disabled), .secondary:focus-visible { border-color: #c6baa0; background: #e9e0c8; }\n.paper button:disabled { opacity: .58; }\n#error .primary { margin-top: 12px; }\n.actions { display: grid; gap: 8px; }\n#result-lead, .best { color: var(--muted); }\n.paper .number { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 0 16px; }\n.number > strong, .best-score > strong { font-weight: 400; font-variant-numeric: tabular-nums; }\n.paper .best { display: flex; justify-content: space-between; border-top: 2px solid #e6ddc3; padding: 12px 0 16px; }\n.best-score { display: flex; gap: 6px; }\n.paper #practice { color: var(--muted); font-size: 15px; line-height: 21px; }\n.paper [data-braingames-controls] { margin-bottom: 12px; }\n.stage[data-compact] .rules { margin-bottom: 8px; padding: 1px 0 5px; }\n.stage[data-compact] .rule-note { margin-bottom: 4px; }\n[data-pixel-text] { position: relative; }\n[data-pixel-ready] { -webkit-text-fill-color: transparent; }\nspan[data-pixel-text], strong[data-pixel-text] { display: inline-block; }\n[data-pixel-ready]::after {\n  content: \"\"; position: absolute; inset: 0; pointer-events: none;\n  background: var(--pixel-label) 0 0 / var(--pixel-label-size) no-repeat; image-rendering: pixelated;\n}\n.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }\n.stage[data-small] > :not(.sr) { visibility: hidden; }\n","font":"AAEAAAASAQAABAAgQkFTRWv7eSkAAAM4AAAA3kdQT1Nt3VGuAAAGcAAAAdZHU1VCF00DNgAAAowAAACsT1MvMp/EArsAAAIsAAAAYFNUQVR4kmzdAAABxAAAAC5jbWFwGaaXpgAADLAAAAQuZ2FzcAAAABAAAAE0AAAACGdseWZt3AfrAAAQ4AAAo1poZWFkLFRYOwAAAfQAAAA2aGhlYQwOCHoAAAF8AAAAJGhtdHgLACAEAAAKbAAAAkJsb2NhH3pHwQAABBgAAAEsbWF4cADVAmsAAAE8AAAAIG5hbWUsJ0oWAAAISAAAAiRwb3N0/7gAMgAAAVwAAAAgcHJlcGgGjIUAAAEsAAAAB3ZoZWEMqhctAAABoAAAACR2bXR4HFEYfgAABUQAAAEsuAH/hbAEjQAAAQAB//8ADwABAAAAlQJqAD8AAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAD/tQAyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAABH/+4gAAC7j8G/1TC3EAAQAAAAAAAAAAAAAAAAAAAIwAARAAAfT+DAAAC7j/Qf1oC3EAAAABAAAAAAAAAAAAAAAAAAEAAQABAAgAAQAAABQAAQAAABwAAndnaHQBAQAAAAIAAwAAAAIAAgGQAAACvAAAAAAAAQAAAAIAxVmIXLFfDzz1AAMD6AAAAADix6C8AAAAAOLoct/8G/vnC3EHEQAAAAYAAgAAAAAAAAAEA+EBkAAFAAACigJYAAAASwKKAlgAAAFeADIBNAAAAgICAAAAAAAAACAAAIMq3zwQAAAAFgAAAABHT09HAEAAIP8MA3D/iAAABH8BHmAGAQcAAAAAAgIC2QAAACAABgABAAAACgBUAHQABkRGTFQAPGN5cmwAJmdyZWsAJmhhbmkAPGthbmEAPGxhdG4AJgAKAAFaSFMgABoAAP//AAMAAAABAAIABAAAAAD//wACAAEAAgADbG9jbAAadmVydAAUdnJ0MgAUAAAAAQABAAAAAQAAAAIAIAAGAAEAAAABAAgAAgAKAAIAhwCGAAEAAgANAIgAAQAAAAEACAABAAYAiQACAAEAAgALAAAAAQABAGoADAAAAAAAwAAEAAZERkxUADhjeXJsACZncmVrACZoYW5pADhrYW5hADhsYXRuACYABgAAAAAAAwAEACgAIgB8AB4ABgAAAAAAAgAEABYAEABqAAwAAQB4AAMDvwAAAAMAKQAAAGIABAAGREZMVAA4Y3lybAAmZ3JlawAmaGFuaQA4a2FuYQA4bGF0bgAmAAYAAAAAAAMABAAsACYAIgAeAAYAAAAAAAIABAAaABQAEAAMAAEAAAAB/4gAAwNHAAAAA/+xAAAABGljZmJpY2Z0aWRlb3JvbW4AAAAAACsAKwBhAIIAwAEUATMBcgGrAcECEwJNAmMCjgKmAtwDKAOiA98EIwRzBLsFKgW8Bk8G2AdNB98IYAlKCYYJ9AqzC3wMNgznDdAOSQ7+D6sQJBC2ES8RlRH/EoITDRN3FBcU8hV/FqkW/BdRGEoY4xk4Gg8atRr8G3wcGhzRHV8eAR6wH2Af2CChIVoiMiMfI+wkniVZJakmmCb/J3woKSjWKUwppypMKswrdywkLMEtCS16LlYvEzBDMXEx+DKTMy00ADShNVE17zbFN7Y4jTmaOpk7gzyPPR89uT5TPuo/i0BVQOhBZUILQtZDU0Q+RNlFekZWR05H00hdSYxKAUqoS2pMHkyjTadO1k72TyJPQU9tT5BPxk/nUCVQeFCXUNRRClEgUXRRrQPoAAADcACJAI4AiQCJAI0AmACJAJgAiQCJAckCqQFuAEEAPQAkACsAKgApAE0AKwAqACYAKgAqACUAMAAoACgAPwAjACEAPAAqACoALQArADAAQgAhAE0AKQApACkAKQAvACUAIAApACAANwAvACsARwAqACwAJgBFAC0AOQAqACoALAAsADMAKgAqACoAKAApACUAKgArACwAJgA+ADYAKAA5ACcAKAAhACoAKgAmACwARAAsADYANAArADUANQAoAEQAKQArACoALAAoACcAKQAwACoAKgAtAEAANwAwAEEALAAuACoAKwAnACoAKAArADsALgAzACsAKQAjACIAMgA+ACkAHwAnACUAKQBZAEwC+gFoAVAAowCnAKMAowCoALEAowCxAKMAowABAAAACgBIAJ4ABkRGTFQAJmN5cmwAJmdyZWsAJmhhbmkAJmthbmEAJmxhdG4AJgAEAAAAAP//AAcAAQACAAMABQAGAAAABAAHY2h3cwBQaGFsdABKa2VybgBEcGFsdAA+dmNodwA4dmhhbAAydnBhbAAsAAAAAQAEAAAAAQADAAAAAQAGAAAAAQACAAAAAQABAAAAAQAAAAAAAQAFAAcBDADGAKwAiABiADYAEAACAAAAAQAIAAIAjAAIAAAA8AAUAAEAAgAA/gwAAQCGAAIAAQABAAIAAAABAAgAAgDgAAQAAADKABQAAQACAAD+DAACAAIADQANAAEAiACIAAEAAQAAAAMAHAAwAAwAAQAKAAoAh/7sAAEAAQAOAAEAJgAKAAD+DAABAAAAAgAUAAoAAQCeAAoA+v4MAAEACAAI/gwAAQACAIYAhwABAAAAAgAKAHoAAgBoAAUAAv/2/gz/7P4MAAkAAAABAAgAAQACAAAACAACABYABAAAADIAHAABAAMAAAAAAAAAAQABAAwAAgADAAwADAACAA0ADQABAIgAiAABAAIAAAABAAAAAgAaAAoAAQAIAAT+DAABAAIADQCIAAEACgAF/wb+DAABAAIAiQCKAAAAAAAJAHIAAwABBAkAAABYAVoAAwABBAkAAQAaAUAAAwABBAkAAgAOATIAAwABBAkAAwBCAPAAAwABBAkABAAqAMYAAwABBAkABQBeAGgAAwABBAkABgAmAEIAAwABBAkADgA2AAwAAwABBAkBAQAMAAAAVwBlAGkAZwBoAHQAaAB0AHQAcABzADoALwAvAG8AcABlAG4AZgBvAG4AdABsAGkAYwBlAG4AcwBlAC4AbwByAGcATgBvAHQAbwBTAGUAcgBpAGYAUwBDAC0AUgBlAGcAdQBsAGEAcgBWAGUAcgBzAGkAbwBuACAAMgAuADAAMAAzAC0ASAAxADsAaABvAHQAYwBvAG4AdgAgADEALgAxAC4AMQA7AG0AYQBrAGUAbwB0AGYAZQB4AGUAIAAyAC4ANgAuADAATgBvAHQAbwAgAFMAZQByAGkAZgAgAFMAQwAgAFIAZQBnAHUAbABhAHIAMgAuADAAMAAzAC0ASAAxADsARwBPAE8ARwA7AE4AbwB0AG8AUwBlAHIAaQBmAFMAQwAtAFIAZQBnAHUAbABhAHIAUgBlAGcAdQBsAGEAcgBOAG8AdABvACAAUwBlAHIAaQBmACAAUwBDACgAYwApACAAMgAwADEANwAtADIAMAAyADQAIABBAGQAbwBiAGUAIAAoAGgAdAB0AHAAOgAvAC8AdwB3AHcALgBhAGQAbwBiAGUALgBjAG8AbQAvACkALgPoAGQBAAAAAi0ALwHXAEYCLgBAAi0ALwIrACICLgAsAi4AOAIlADcCLgA5AjIANQFHAGYD6AAqA+gAMAPoACkD6AAjA+gAKwPoACID6ABqA+gAIQPoAG4D6AAiA+gAIQPoACQD6AAZA+gAHgPoACQD6AAmA+gALwPoACMD6AAjA+gALAPoADwD6AAqA+gAKAPoAB0D6AAbA+gAJAPoACYD6AAhA+gAIQPoAG8D6AAkA+gAIwPoACwD6AAiA+gAJgPoABsD6AAkA+gALAPoACoD6AAjA+gAMAPoACUD6AAoA+gAIwPoACsD6AAfA+gAJwPoADAD6AAqA+gAHgPoACYD6AAiA+gAIAPoACgD6AAoA+gAHAPoABsD6AAfA+gAIgPoACUD6AAbA+gAIgPoACkD6AAkA+gAJQPoAFID6AArA+gAKQPoACkD6AAiA+gALAPoACMD6AAXA+gAHgPoAB0D6AAqA+gAHgPoACkD6AAkA+gAKQPoACcD6AAhA+gAJwPoAB8D6ABvA+gAWgPoACwD6AAXA+gAEgPoACYD6AAqA+gAIQPoACUD6AAqA+gAHQPoAGwD6AArA+gAKQPoACMD6AAtA+gAJwPoACUD6AAeA+gAJAPoAB4D6AA7A+gAJAPoABwD6AAhA+gAHgPoACkD6AAoA+gAHgPoACAD6AA2A+gAJQPoACMD6AA3A+gALgPoABwD6AB/A+gC5APoAoID6ABOA+gBaAPoAZECJgAyAFUANgAxAB8AKgAwADYANQAqAAAAAAADAAAAAwAAAFYAAAAFAAAAHAADAAEAAABWAA4AAAA6AAAAAgD+AAAAACAAAAAAAP4BAAAAAAAAACwAAAACADACAAD/DAAAAAACADACAIkA/wwAigAEA9gAAADyAIAABgByACAAOQC3MAJOAE4LTg1OE04qTi1ORU6GTvZPGE8aT01PT09ZUUhRXFFlUY1Rt1HGUjBSTVJpUqBSqFN0U8pT2FQMVA5XKFdaWQdZMVl9WhhbWFvfXA9cEVwxXEBd5l4uXo9fAF8PX1Vfl1/rYhFiY2J5YwFjCWNeY2JjiWVIZYdlsGXgZfZmbmcAZwlnLGdhZ2VoB2g8aGNrY2w0bKFtO244bw9wb3C5c6l1WXaEds950nn7eyx7SX7nfup+7X9Rf26JgYnCi7CL1Y0ljXCNd46rj32P2ZAakC6RzZHRlS6Vf5h6mW2a2Jx8nLifIP8M//8AAAAgADAAtzACTgBOC04NThNOKk4tTkVOhk72TxhPGk9NT09PWVFIUVxRZVGNUbdRxlIwUk1SaVKgUqhTdFPKU9hUDFQOVyhXWlkHWTFZfVoYW1hb31wPXBFcMVxAXeZeLl6PXwBfD19VX5df62IPYmNieWMBYwljXmNiY4llSGWHZbBl4GX2Zm5nAGcJZyxnYWdlaAdoPGhja2NsNGyhbTtuOG8PcG9wuXOpdVl2hHbPedJ5+3sse0l+537pfu1/UX9uiYGJwouwi9WNJY1wjXaOq499j9iQGpAukc2R0ZUulX+YepltmticfJy4nyD/DP///+H/0v9V0AuyDrIEsgOx/rHoseaxz7GPsSCw/7D+sMywy7DCrtSuwa65rpKuaa5brfKt1q27rYWtfqyzrF6sUawerB2pBKjTpyem/qazphmk2qRUpCWkJKQFo/eiUqILoauhO6EtoOigp6BUnjGd4J3LnUSdPZzpnOacwJsCmsSanJptmliZ4ZlQmUiZJpjymO+YTpgal/SU9ZQlk7mTIJIkkU6P74+mjLeLCIneiZSGkoZqhTqFHoGBgYCBfoEbgP927XatdMB0nHNNcwNy/nHLcPpwoHBgcE1ur26sa1BrAGgGZxRlqmQHY8xhZQF8AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUAZP+IA4QDcAADAAYACQAMAA8AABcRIREBASEBAREBIQEBEQFkAyD+cAE+/YQBXgE+/WQCfP7C/qIBPngD6PwYAh0Bmf4+/mcDMvylAZkBwvzOAZkAAgAv//EB/QLnAA8AIwAABSImJjU0NjYzMhYWFRQGBicyPgI1NC4CIyIOAhUUHgIBFjtqQkJqOz1pQUFpPRw1KhkZKjUcHDUqGRkqNQ9Op4iGpk1NpoaIp04fI1CHZGKFTyMjT4ViZIdQIwAAAgBG//8BqwLiAAUAEgAAMzU3MxcVJzY1EQc1NxcHERQWF0uRSIfYA5DXDwQCARwPEBwBc3MBvxgeNwue/q05dDkAAQBAAAAB/wLnACkAADM1NjY3PgI1NCYjIgYHNwcGBiMiJic+AjMyFhUUBgYHDgIHNxUhFUAyXyU1Qh9LQxw3HykbCBgRDhYFCT5cM2VmK11NDzRAIQkBjjY7cStAYFIsS1IPFB9iHRcRDjNEI2VZLlhtThA3RiUfD0YAAAEAL//xAe0C5wA7AAAFIiYnNjYzMhYXFycWFjMyNjU0JiMjNTMyNjU0JiMiBgc3BwYGIyImJz4CMzIWFRQGBgc1HgIVFAYGAQBVbQ8FFg4SFgcdKBozIFRbW1stKEldRkIcNR4rGwcXEw0UBQk7VTBgai5bRU9jMTxrD0hGDxAXHF4hDhBfUFNaI1VQRk4MEB1ZGhMMDTI9HGFPL1A3CAoDM1c6PVszAAEAIv/uAhYC4wAQAAAFNTURIzcHBzcVIRUhNQEzEQFTDCSSmAgBzf4MAUQ4EuYNAcYR5ewhDjovAfT9CwAAAQAs//EB9gLYACgAABciJic2NjMyFhcXJxYWMzI2NTQmIyIGBycTIRUhNwMnNjYzMhYVFAYG9lFrDgYWDhMVBhwiGjAiV11dTSE6GhkXAWb+qhMVHidMK2x/P3MPSkUODxYbXB0PDmhgXVkMDAoBWEYu/scKFRBva0dpOwAAAQA4//EB/QLnACYAAAUiJiY1ND4CNxcOAhUUFjMyNjY1NCYjIgYHJzM2MzIWFhUUBgYBIUhpODxvn2MFc5tOTkYnPSRJPypOJhMHTnc9Vi05Yw9JgllXnn9SDBYYfbRqgI4uWj9aXiUsC282Y0JEaz0AAQA3AAAB6ALYAAkAADMnAQc1ITUhFQGaCAE1Cf55AbH++wcCpywQRi39VQABADn/8QH3AucAOQAABSImNTQ2NzUXBgYVFBYzMjY1NCYmJyYmNTQ2NjMyFhYVFAYHFSc2NjU0JiMiBgYVFBYWFxYWFRQGBgESaXBdWhdGP09FRk0hT0VYTjdcOD1WLUpeEz82PzwiOyMbRT5nWjlnD2FORWIlBQ4oVjxIUUw+JUI9HiVuRDdRLCxLMDZlJwUNJ1g9Nk8fOSgiQDsbLmlIOlYvAAEANf/wAfoC5wAnAAAXJz4CNTQmJiMiBgYVFBYzMjY3FyMGBiMiJiY1NDY2MzIWFhUUBgZpB2+QRSZDKSVAJ1lEK0gdFAgZX0E8YDc8ZT9GZzhbshAaJ3+raVhzOSxVP1lkKCYFMz02YkRIZzhHhFttuogAAQBmASwA4QGnAAsAABMiJjU0NjMyFhUUBqMaIyMaGiQkASwkGRokJBoZJAACACr/rgFDAMcADwAbAAAXIiYmNTQ2NjMyFhYVFAYGJzI2NTQmIyIGFRQWtyZAJydAJic/JiY/Jyw+PiwtPj5SJ0AmJz8mJj8nJkAnIj8sLD4+LCw/AAEAMAGOA78CAgALAAABMB4CFwYGIyEnIQNJGCQpEQIRDPyaCgLaAgITHyMQCQYhAAMAKf+zA8IDLwANABUAIAAAAR4EBgYnLgMnExQGBiMjETMlMB4CFwYjISchAfFYglUxEggbFRZMW10pFg4ZEAxDAWEUHyIOBBf8iwkDAAIMFzc4NiweCQghRkM7Ff3LAwsJAzlDDxgdDBAdAAQAI/+1A7UDMwAMABcAIwAuAAABHgMGBicuAyclITcwHgIXBiMhBTcXBgYHEQ4CIyMTMw4CByc+AwJHZolTJAEcFxVJWVwp/fcC6zUUHSIOAxj8ogGWFE0DDw0BEBgNDEdfO7ThfAlQl4ZoAhIhR0U7KQ8KIUlIQRfrQg8YHAwQpRodBwkC/a8DCQgDM2vEpTwOMHeHjgAABgAr/6EDvgNMAA8AJwA0ADgAQwBOAAABNxcGBgcOAgcnPgM3AwYGJzcOBAczByc2NjcHPgQ3Ax4EBicuAyclFSEnJTAeAhcGIyEnIQMwHgIXBiMhJyECuS1NBxQRHVpjKQwYOjoyD6QEFhYMCBwiJSMPCiNKDCEOGw8kJiQcCMtwnmQzChgYHFxucDEB9P5wCQIfExsfDAMX/JAJAwolEhoeDQQX/SIJAnwBMCpJBQMBIVFOGwkYQUZCGQH7CAwEESVpd3pvKyM6Bw8EJCVuf39yKf1WFTc9OCsVBiFEQDYSnB0d8Q4XGgwQHQELDhUZDBAdAAIAIv+wA8QDRQAZACQAAAEOAwcnPgM3FwYGBx4CFwcGBgcmJgcGBgcRFAYGIyMRAfwhYnmLSwhDgXBWGHICEhQxhaRcAhYeBoPNAQIQExAaDQ0DCTh3c2UmDyxzf4E7HAkJAkaCbSgOBiAUTNNqCg8C/b0ECwgCgAAABABq/7IDpANGAAMAEAAdACgAAAEVITUBNxcGBgcRFAYGIyMRARQGBiMjETUxFyEVISUGBgcRFAYGIyMRA1H9OgKhJVMFFw8UGgsK/XYQGA8LSQKZ/WABiwIPFA8ZDg0BTh0dASYqQAYLA/6pAwoIAZb+dQMLCQGiIiId5AoPA/yuBQ0JA5QAAAQAIf+wA9IDRwAMABsAKwAvAAABBgYnDgIHJz4CNwEeAxcHBgYHLgMnJzcXBgYHDgMHJzY2EjczFSE3AbkDEhIjZX1JDTxsVRoBHwksUIFfAxkhB1ZxRCEIFCxNBhMSHVyO0ZEKp+KIHx7+wwgDJwgMAXC9lDULPafKcP7BTZaJeDALAxgcNIqdplKXLEgHBAJ11beRMRBI2wEYoR4eAAADAG7/swOQAyMAGQAoACwAAAEXBgYHERQGBgcmJicmJic1MB4DMzI2NQEjNxcGBw4CByM+AyUhFSEB02YBEBIQNTcDDQ0PNi0eLTAnCRANAUkMMFALIit2fzwUJ1VSRP1pAtr9LwIlDAoOAv4YGykaBhAYCQkMBRACAwMCDAwC2i1KCQEfS0YZFz5EPxgeAAAGACL/swPIA0UACgAWACEALAA4AEUAAAEhNzAeAhcGIyETFwYGJwYGByc+AjcXBgYHERQGBiMjAyE3MB4CFwYjIQc3FwYGBxEUBgYjIxMXBgYnDgIHJz4CAR8CIjARHB4MBBb9eYBmAxIQH2I+Dh42K7hnAg8UDxgODcEBli8RGx0MAxf+AOUfQAIODREYDQxTZgMSESFUYzcOKlNIAU08DhYaDBAB4iAIDAFqtz8KMX2QdQwKDwP8uQUMCAKrPA4WGQ0QISgYBwkD/a0DCgkDkiMICwFaqJA2CjyhuAAGACH/rgPLA0YAIQAuADoASwBXAGIAAAEUFBURFBYzMzI2NzY2Nz4CNzMXFhYVFAYGIyMiJiY1EScGBicOAgcnPgI3EwYGBxEUBgYjIxE3JQYGBw4EByc+BDUXHgMGBicuAicXMB4CFwYjISchArQNGUwbJgkIBwMECQwGDAQQChtHRVYkJg7rBBIRJmFwPg4yYVMeAgMPDg8YDQ0eAYMCEBIBAxg5bVgNSVkvEAGoN0MgBQ8bEQckLhXHExwgDQQX/aoIAesCJgoRB/4kDQsBAQEGBwgxQSGhBg0KDhIIDR0aAg38CAsBX6qMNQo7n7pi/ucHCgL9sAMLCQJrKPQKDgN31b2kijoRPJCmwNt6IBIrLCcYBQsaODUSqw8XGg0QHgAABgAk/7IDyQNKABsAMwA9AEcAUgBfAAABDgMHJz4DNxcGBgceAxcHBgYHLgIDBgYnNw4DByczBgYHJzA2Nz4DNwE+AzcXBgQHATAWFhcGIyEnIRcwHgIXBiMhJyEHHgMGBicuAycCByNpgIpFCD+EeVsVcgMTEiFecX1CAhUgBlGWeRIFHhgeGEpXWysCJQQXDiIVByNOSjwS/uspgqW+YwFm/sm+AdYfKhADFv4qCAFu0BMdIA4EGPzmCQKum09nORMKHhYNMDs9GgMRNGtmVx8OImV1dzMaCAkCLVNLQBkOAx0SKGx//hwICQwEGT9BOxYLISUFVwUDFEFKSRv+8AEEBwkFEg8oFAJgGCEQEB1yDxYbDBAdeyNJQjckCQ0dQ0Q/GQAABwAZ/7IDxwNGAAwAGAAkADIAPwBKAFYAAAEGBicOAgcnPgI3EwYGBxEUBgYjIxE3JR4DBgYnLgInAQYGBw4CByM+AzcFHgMGBicuAycBMB4CFwYjISchEzAeAhcGBiMhJyEBawMSESNaaDkOLFdMGwkCDw0QGA0MHQFBNkAdAhIeEgIdKRYBZwISERM5RiYSEiUhHQr+ljlDHAEUHQ4EDRglGwHvEhwfDQQX/XAIAicaEhweDQIOC/2nCAHzAyQJDAFdq5I3Cj2kvGD+6AcJAv2tAgwJAnAm/Bc2Ni0bBA4fRT8X/roKDAFEqa1LO4iOiTsPRX9rUDAIFCZmcXAu/k8OFxkNEB4ClA4WGgwICB4AAAcAHv+yA8oDRgAKABUAIAAsADAAPABJAAABITcwHgIXBiMhFyE3MB4CFwYjIQMhNzAeAhcGIyETHgMGBicuAicXMxEjATcXBgYHERQGBiMjExcGBicOAgcnPgIBMgH2MBIcHw0EF/2iFgHILhIaHgwEFv3WPQIfMxMdIA4EF/1zyD9SKw0LHBQLMz4dX0RE/m8LVgMPDREYDQxfZwQSESNaaToOLlhNAmI9DhcaDBD9Og0WGQwP/tFBDxgbDA8DXhEtLyweCQoeQDoV1/2NAiYNIAYJAv3cAwsIA5QhCQwBXaySNws8o7wAAAYAJP+yA8kDSwAKABUAIgAuAEQAYQAAEyE3MB4CFwYjITchNzAeAhcGIyEXFwYGJw4CByc+AiUeAwYGJy4CJwMzERQGBgcmJicmJic1MB4CMzI2NRMOAwcnPgM3FwYGBx4DFwcOAgcuAlACxDASHB8MAxf81pcBiywRGh0MBBb+Fh9bBBERHVdqOgowW0sBiFJpPBUJHxUQSFgprUQPLzEBCwsMKyYiMSoJDwo5JGp/i0YHPoR4WhV3AxITIl5wfUACDxkSA0+VeQFJPA4WGgwPyDgNFRgLEOQwBwYEJFBKGw0iW2AVGDw+NiUMDChUTRoBGv4kGikaBQ8ZCAgMBA8CBAIKCwL6MmhiVB0OImFyczIcCAkCK05GOhgOAxAXDSVoegAGACb/rgPDA0AACgARABwAJwBJAFUAABMhNzAeAhcGIyEBFwYGBxEjJyE3MB4CFwYjITcXBicGBgcnPgIBMxQUFREUFjMzMjY3NjY3PgI3MxcWFhUUBgYjIyImJjUDMw4DByc+AysC/zMUHCENBBb8kwGdaAIQE0PvAfUxEh0fDgQX/YkuZgYeImhBDiE6LgFJQg4cYCIwCQoIAwQKDAYOAhELHVFPaicrD+NMBitUi2gGV3RDIAGZQA8XGwwQAcQLCg8D/nD6Pg4WGwwQwx4VAWSkNAorcIP+swkRBv6lDAoBAQEGCAowQSSlBg0LDxQIDB8aAYpimXZXIBAmXHKNAAAOAC//sgO+A0gACgAUACEAMAA6AEUASQBNAFoAegCHAJQAmACcAAATBgYHFSoCIzU1Az4CNxcOAgcTFxEHNxYGByc2NjURAQYGBw4DByc+AzcTBgcGBgcjNjY3BwYnBgYHJz4CNwEVIycTFSMnMzcXBgYHERQGBiMjEQMGBxUUFjMzMjI3NjY3NjY3MxcWFhUUBgYjIyImJjUREzcXBgYHERQGBiMjEQMUBgYjIxE1MRczFSMTFSM1NxUjNdMCEhMBDBoXEhNEVSsIEz5KKCUPNhkJGQsnFgsBRAITEAgoTX1dB1BrPx0D6QUgDCMOGQYOBY0HEhhVJwcULyoNAlGpCbSpCYkiSwQVDRIYCgqsAxwOHWYjMwkJCAQGDwgOAxAKHVFQbygpDxUgRwQUCxEYCgm8DxYNCkDX29by8vICxwcKAkY7O/5rCB4oFg0PMTocAYwJ/roUGCEnBk8KDgwBJv53CwoBM2JXRhkNHk5eaDcCDhUBFDMUGU0dbgkICyMLCw4nJg3+ZR4eAVoeHiY7BQoC/ocDCQkBtP5MFATwCgcBAQQHDEYqgAYLCg8SCQwcGQEeAaojNwQKAf6oAwoIAZD+ewMKCAGaHh4e/tAdHakeHgACACP/rwPRA0gACgAlAAABDgIHJz4DNycuAyc+AjceAhceAxcHIgYHLgMCDB6EwHkOU49zUhQIAiAwOBsEDw8FJ0YyBhNPd5xfBB0tCFWLakkCOIHxzEsOPqHC33sCCxUWFAgHGBcGFC0xGnbauZAsDiAXNJ7K7AAHACP/sgPIAzEAGgAkAC4AMgA2ADoARgAAASM3FwYGBxEUBgYHJiYnJiYnNTAeAjMyNjUBNRcjERQGBiMjAyE3MBYWFwYjITchFSE1IRUhNzMRIwEhNzAeAhcGBiMhAvMLJF0GHBEPMTQDCwsNMSgnNTAKEAr9v00LDhkRCo8DKSwcJg4DFvx8sQIu/dICLv3S8kFB/nIC4TATHCANAg4L/LcCVC1FBwwE/e8ZKRoGERoICQ0EEQMEAwsNAjYhIf11AwsJATI5FyAQENgd0x67/egCGz0OFhoNCAgACAAs/6oD1ANNAAwAHQApADcARQBJAFUAgAAAJR4DBgYnLgMnJTcXBgYHDgMHJz4DNyUeAwYGJy4CJzceAxcHBgYHLgInFw4CByc+AzcXBgYTFSEnAx4DBgYnLgInEzI2Nz4FNxcOBAcGBhUUHgIHBgYjIiYnNjQmJyYmJzUwMjIBuVdzRB4CGRQQO0tOIwFyLUoHFBEXQElGHQ0XOjw0EP78MDoaARAbDwQdJBNmFUpcZTIDGCEGP3FXHBclbo1TCzdlVkMTXwISq/4ACe87SiUIEB0TCCkyGRYJCQgFCRAeMks4EhEsLyofBQgLCQoIAQEdGQ0QAQYLDAoYEBMWrR1BPzUkDQoeQkA5FbEpSAYCARpDRkIYCBtMUUob4hs3NCkXAw4dQT8Y9jZmWUoaDAUaFS1+lE4DRZWIMg0pbXl5NiYHCv49Hh4BxxEtLyodBgwcPTkT/cQGDwkSITtlnHEFKmtxZksQGC8SESImLx4fJBoWM08zCAYGARYAAAoAPP+xA8gDTwALABkAIgAmADEAPABHAFIAXgCJAAABHgIOAic0JiYnBwYGIw4CByc+AzcTFAYjIxE3FyMXESMREzAeAhcGIyE1IRMwHgIXBiMhNSETMB4CFwYjITUhEzAeAhcGIyE1ISUeAwYGJy4CJxMyNjc+BTcXDgQHBgYVFB4CBwYGIyImJzY0JicmJic1MDIyAmEwNxYCFB4QFB8SJAMQFBVGYj4NJD8xJAsJHBgKHS0M70D1ERseDAMY/gIBlAURGxwMBBb+MQFoLREbHAwEFv4xAWhFERseDAQW/hEBhf0bOEYjBQ8eEgYmLxclCQgHBQcNGCg+LRMNIyQhFwUHCAkKCAIBGxoNEAEHCwsKFw8RFQNPFjEwKBgBDhw7OBMhCApDpaJBCTWAh4A3/IIEEgKwNxMB/YECf/3RDhYZDBAdAREOFhkMEB4BBA4WGQwQHgEIDhYZDBAelhAuLykbBgwcPTcT/cUGEAkSIDxmnXEEKmtxZksQGTATECMnMB4eJRsWMk80BwgEARcAAAkAKv+wA7MDNAAWAB8AOABDAE8AWwBiAG0AeAAAAQYGJzcOAgcnMwYGBycwNjc+AzcHPgI3FwYGBwEGBgcRFAYGByYmJyYmJzUwHgIzMjY1EQcGBgcRFAYGIyMRAT4DNxcGBgcGBwEeAwYGJy4CJwcGBgcRBxEXMB4CFwYjISchEzAeAhcGIyEnIQFxBB0ZHRdMVigBJwMUDSoVBRgyMCcLrSWEqFoCR9h8Az0CERINKy4CCQsLKCAfKycHDgpZARATDxcMDf2XJHeWq1oEWfepCBABPTxKJAcOHBEFKTgcBgIPE0HWERscDAQW/iQIAXxMEhoeDAMY/fEIAa4CqgoKCQggTUoaDCEoBloEAxE4QTwX7QIJDgcQDiwVAYQLDgL9AhooGQUQGAkIDQQPAgQCCgwDHVkKDgL92wQLBwJg/TYFExsgEREdSi4SBQLBGjs6MB8GDiJNRhjTCg4C/qsOAYdTDhUZDBAdAgMOFhkMEB4AAAkAKP+zA8EDRgAKABUAMABJAFUAYQBuAHIAdgAAEyE3MB4CFwYjIQUXBgYHERQGBiMjAyM3FwYGBxEUBgYHJiYnJiYnNTAeAjMyNjUBFwYGBxEUBgYHJiYnJiYnNTAeAjMyNjUDFwYnDgIHIz4CJR4DBgYnLgInAzUxFzMVIxEUBgYjIxMhFSEVIRUhKAMLMhIdHw4EF/yLAhtjARAUDxcMDMcKIVQFGA8MJikBBwgJHhoWIB4GCwgBnmIBEBINLC8CCgoLKSIgLSgIDgqHaQcgEjM6HBQTKCX+aTdFIAQQHhMFIiwXaUTe4w4YDgsfAQX++wEF/vsCiz4OFxsMD1oLCg4C/m8ECwcBvik/BQwC/i4YJRcEDhcIBwsDDwECAgoJAhoLCw4C/goaJxcFDhcICAsEEAIEAgkMAzIfEwEYNzcYHUlKHBEuMCocBg0dPTgV/sohIR394QQLCAG9HoAdAAwAHf+yA7YDRgAKABgAIgAuADUAUgBWAGEAawB1AIAAmQAAExcGBgcVFAYGIyMBFwYmJw4CByc+AwUhNzAWFhcGIyEBHgMGBicuAicDNxEUBiMjExcGBxUUFjMzMjI3Mjc2NjczFxYWFRQGIyMiJjUlMxUjJRcGBicGBgcnNjYFNjY3FwYGBwYHNxcOAgcnPgIBFwYGBxEUBgYjIxMXBgYHERQGBgcmJicmJic1MB4CMzI2NbBTAQwODhQLCwFbSgcaET6isVYEPYR/bP5JAdAuHCYQAxf90gE6RlszEQkbFA4+SSIyPR0XCYdSAhkGCR8KDwQIAwQLBAsDDQopOiokFP53mpECEzEEDg0XRxwKGkH97xdaLwQROCUDD+4vImV5QQg5bVkBml4CDxIPFQwLnWMCERIMKiwBCQsKJh4dKSQHDQkCOgkIDAL6AwoHAjlGBgEHDhwTBBIJGh8hwjgWIBAQ/qcRLzEtIAkKH0M9EwH7EPzKBBACgwoUA7UIBgEFBSATOQQKCRARGBqbHkE2BAEGCRYHCQ8yqAYaDw4MKBcTBFBUNWpfIg8pcYYB0AsKDgL9zAQLCAKzCwoPAv0EGigZBA8YCQcMBBACBAIKCwAGABv/tAO4A0MAAwAQABQAJABDAFAAACUhFSETIzcXBgYHERQGBiMjASEVITcXBgYHDgQHJz4DFyM3FwYHDgMHBgYjNCYnJiYnNx4CMzI2Nz4CNzUxFzMVIxEUBgYjIwJqAQD/AN4LJlUFGRESGgwJ/OsBlP51nWgCDxMBBRUzW0kQSk4hBdAKJk4LHgMLERkRFTohBwkLNR0BFTQuCxAPBxMYDqlF3+QOGA4MSR0CcCxDBwsD/YAECwoClx7zCwoPA1O2uLWpSQ9g3erqZitBDQSBzJVfFBcXEBoICQ4FEgIGAwYHE5b51CEhHv1lBAwJAAgAJP+rA8IDRQAXACAAQABRAFUAYQBsAHcAAAEGBic3DgMHJzMGBgcnMDY3PgM3Az4CNxcGBgcBNxcGBgcOAwcGBiM0JicmJic3HgIzMjY3PgI3JwYGBw4EByc+BDUFFSEnAx4CDgInNiYmJzcwHgIXBiMhJyEDMB4CFwYjISczAUADHBobEC03ORsCLAQYECgXBRQqKB8IlyN2kkwCN7ZsAu0mTQYTEQMKDxkQEzcfBgoKLhsBEy8pCg4PCBEXDQODAg8TAQYbQ31lDldsORUCARX+QwlyMjoZARMfEAEYJRRtERsdDAQW/kQIAVsGERoeDAMX/qgI9wGvCgwHCSJTVU8fDCMsB2MFBRpRXFch/q0DDxQLEBI5HAIiKj8HBwKHzpJaFBgVEBkIBw4EEwIFAgUHEo/5rd4LDgNv0L2pkjwQQJaswNR06R0d/v0pT0g3IAMRKl1ZI9kNFhkMEB4BFw0WGQwQHgAACQAm/7IDvgNAABcAIAAsADMAPQBHAGIAbABwAAABBgYnNw4DByczBgYHJzA2Nz4DNwM+AjcXBgYHJR4DBgYnLgInEwYGBxEjERMwFhYXBiMhJyETMBYWFwYjISchJTcXBgYHERQGBgcmJicmJic1MB4CMzI2NRElFyMRFAYGIyMRIRUhNQFoBBwaHBI3QUQfAisEGA8oFwQaNTIpDL8mf55TAT3EdQEQO0ghBBIgEQEjMxsEARISQOMeKBAEFv4HCAGXEx0nEAQX/j8IAWMBpSJUBRgPDCosAgkKCSYfHSgjBw0J/vxLDA0YEAoBK/74AXAJDQkIHkVIQhkKIywGYgUEFkRPTBz+3gMPFgsQEzkc9CVMRjkjBRAqXlggAhoKDgP+fAGq/qYYIRAQHgEQFiEQEB5gKT8GCgP9/xkoGQQPGggIDAUPAgMCCgoCIigo/OcCDAkDMB0dAAcAIf+vA88DLgARABkAJgA1AEMARwBLAAABDgMHMwcnNjY3Bz4DNyM3Fw4CJychDgQHJz4DNxceAxcHBgYHLgMnBTcXBgYHBgYEByc2ADczFSM3ExUhJwLoCR8jIg4IG0EKHgwdDSIkHwkNJEkGHSESCv6+AxAlRW5RDFJmNhMBOhdlnNSGAxkoCn/Ci1gUAbstSgYTEi+j/v6+CP8BITkj6Ap//YEJAu4YRUtIGhkyBg0CHRhIUEoaJUEHCAECKm7HtKCOPQpUu9DqgWGT5qp0IwoBHBgpgbbznJwqRgcEAYnbmyoRSQEk0x4eAQcdHQAACQAh/64DxQNPAA0AGwAfACYALQA5AEQATwBbAAABHgMXBwYGBy4CJyU3FwYGBwYEByc2JDY3MxUhJyUUBiMjETMTFAYjIxEzJx4DBgYnLgInAwYGJwYGByc2NjclMB4CFwYjISchBx4DBgYnLgInASUqirHNbgEXHwaQ87g4AZgySAcUFG3+kfQHkwEByTof/c0JAQ0dGQpA2R0ZCkDgMz8eBBAdEQchJxFPBBUPMHw+DTNsJwJpEhwfDQMX/KcJAvBxSl41EQodFA4/TCQBRkpwUjUNDAMdGRpinG4NKkcGBAGPuicRInCXXh4eLwMPAU7+xwMQAU6cDCInIhgGCxUwLRD+8AcIBENnHw4nhE6QDhcaDBAeYxQzODAiCgsiS0IXAAYAb/+yA6MDIwAMABkAJAAoADUAUAAAEzUxFyEVIREUBgYjIxM1MRchFSERFAYGIyMDITcwHgIXBiMhEyEVISUjNxcGBgcRFAYGIyMTIzcXBgYHERQGBgcmJicmJic1MB4CMzI2NW9HAqL9WA4YDwzNRAEP/u0QGA0LRQF/LxEaHgwEFv4fWQEw/tABDQkiTAQUDRMYDAnSCSJTBRYQDzI1AwwMDzIrKTg0ChEMAvkhIR788QQMCgIQHx8c/ssCCggB/zoOFRkLEP6kHfwmOgULAv7sAwsJAogqQQUMA/1EGSgZBg8XBwkMBBACBAMMDgAABQAk/7ADwANHAA4AHQAoAD0AQQAAExcGBxUUDgIHJz4CNQEXBiYnDgMHJz4DASE3MB4CFwYjIRc1FyE3FwYGBxEUBiMjESERFAYjIzchFSGoWAURCiRKPw87OBECX0sGGhQ6j56jTgNKo56I/fICaDITHiANBBf9I3dLAXkhSQQSECAXCv55HRkKJQHA/kAC6h0JA/RAi46ENwxMrbVaAXpHBwEIDBoVEAQSCx0jJf7pPg4XGwwQrB8fJzgGCQL+mwMRAX7+jQQQch0ABgAj/7IDvQNHAAoAEQAgACsANwBCAAABBgcRFAYGIyMRNyUGBgcRIxEnBgYjDgMHJz4DNwEwHgIXBiMhJyEDMB4CFwYGIyEnIRMwHgIXBiMhJyEBPAUaEBgNDR8BrAEOEUI3BBEUGU5rjFgLS3tfRBQBxBIcHwwEFv2fCAH6EBEbHQsBDQv+GggBhV0SHB8NAxj8twkC4gGeDQX+PAILCQHdKHkKDQP93QJH7wkJSp6ZhjMMOY+hpk/8+w4WGgwQHgGHDhUYDAgIHgFvDxYaDBAeAAAIACz/2AO/A0cACgAVACMAMQA1AEAASwBSAAATBgYHERQGBiMjESUGBgcRFAYGIyMRFx4DFwcGBgcuAiclNxcGBgcOAgcnNjY3MxUhJwEwHgIXBiMhJyEDMB4CFwYjISchJwYGBxEjEeYBDxEQGA0MASgBDxEQGAwNzhdRbYZMAhUfB2GWaBwBHixIBhMRJXy0fAmhzysf/ngJAaITHSENAxf8kQkDABQSHB8NBBf9LwkCaqsBERJCAvkKDAL+nwQLBwGZOgoNAv4cBAsHAh1SSnlgRhYKAhsWJ3enbgopQgcEAVqadSUQQNmKHR39Pw8XGwwQHQEQDhYaDBAdgQoOA/61AXEACQAi/7ID0QNHAAwAGQAdACEAJQAyAEEAUABUAAABNxcGBgcRFAYGIyMRARQGBiMjETU3FyEVIQEVITUBESMRBRUhNRMGBicOAgcnPgI3Bx4DFwcGBgcuAyclNxcGBgcGBgQHJzYkNjczFSE3AtgkTwQWDhMZDAr+KxAZDgsKPQHv/gwB9f3yASU9ASL99M4DEBMka31ADDZqWRw3MJa6zGYCFx4GZL6qiS4BuDVKBhUUT+P+5qQHkgEM1UAc/icVAU8oPQYLAv6nAwsIAZf+eQMLCAGdFwYdHv7bHR0BNv66AUaTHh4CeQcGAjl8bycMK3qHPZE7XUYuDAwDIBkSPFNtRCwrSQcDAVyOYRoSI26SWR4eAAAFACb/sQPIA0EAEgAdACgANwBDAAABFwYGBw4FByc+BQEhNzAeAhcGIyETITcwHgIXBiMhBR4DFwcGBgcuAycBFwYGIwYGByc+AgHWaQEQEgIEFjpqrIAKc5peMhIB/l4C/DQTHR8OBBf8lqYB9TITHR8OAxj9lwE5DThjmWwCGyIGZYhULQz+72kDERIgaEQOIjstA0ELCg8DbcCnkHhjKBIsZ3yRqcT+rz8PFxsMDwEQPg4XGwwQ2zRrZlwlDAMYHStueno4AbgcCQxusDgJLniNAAgAG/+xA8wDSwAOACcAMgA2AEQAVgBmAGoAAAE3FwYGBw4CByM+AjcHBgYHERQGBgcmJicmJic1MB4CMzI2NREXMB4CFwYjISchExUhJwEeBAYGJy4DJzE+BDcXBgYnNw4EBxM3FwYHDgMHJz4DNzMVIScDMC1MBhMQGURJIhMbOjMPUwIQEg0sLwIKCwspJCEuKQcOCvUQGh0LBBb97wgBtAL+cAn+qFp+TykKCxwQFUhXWSgOIiMfGAdlAxMcDQcZHyQkEs0oSAkdDCpPh2kLWHVGJQgj/rAJAuorRwYCARc8PBUbTEsXwAoNAv4AGikZBA8YCAkNBBEDAwMKCgIfag0WGQsQHQFZHR3+QiVGQDYpGAYJI0tJQRknb3+AcScXCg0BDiVmdnpzMAFSKUIKBGK7p4s1DjiSrMBnHh4ADgAk/7QDzgNQAAwAFAAYACIALwA7AEcAVABYAFwAagB7AIsAjwAAARcRBzcWBgcnNjY1ETUXIxUwIiM1IRUhNQM+AjcXDgIHATcXBgYHERQGBiMjESceAg4CJy4CJwEGJw4CByc+AjcnHgIXBwYGBy4CJzcVITUlFSE1BR4EBgYnLgMnMT4ENxcGBic3DgMHEzcXBgcOAwcnPgM3MxUhJwH8DzcYCBoLIxUKTAwfIQGN/pc1FktgMAUVRVItAVIlUAUXDxIZCwrXLTQWARIbDwIVHhABYgkUFENOJQkdQjkR5xlZg1QBFBwGUnNJFd7+owFW/qr+ZFJwRyMIDRoQEj5MTyMOICAdFwVlAxMcDQggKCwVwydHCR0LJkp+YQtRbEEiBxz+zQkCiQn9fBIZISYFSwsQDgJeTSU8PB4e/VAGFh8RDwwoLxcC7Sg+BgoD/s4DCgkBcZ8QKCkiFgEMFzEvEP2/CgcPLCwQCxc+PhQvWJZtGwsEHRgme6hrDB0dpR4e6yNDPTMnFwMJIEZFPhgmb35/cCcWCg0BDi6GmJM8AU4pQgoDX7mojzcOOpWtvmQdHQAABwAs/7IDrQNHAAsAIwAyADYARQBQAFsAAAEGBgcRFAYGIyMRNwUGBxEUBgYHJiYnJiYnNTAeAjMyNjURNzcXBgYHDgIHJz4CNzMVIScTBgYnDgMHJz4DNwEwHgIXBiMhJyETMB4CFwYjISchAT0CDw0QFw8LGwHCBR4OLTACCgsMKiMhLyoHDgqoK0sGFBAYRkshDBg6NQ8T/n0JZgMRFBlIZYFRC0VyWEATAcESGx4MAxf90ggByTETHSEMBBb8vAkC2AG4BgoC/i8EEA4B+yVgFQP+thsnGQQPFwgIDQQQAgQCCQsBaZApRwYDARUyLBEJFTs8Fx4eARkJCQFGmJWGNAw5j56iSv4ODRcZDBAeAckOFxoNEB4AEQAq/7EDxANQAAoAFwAmACoAQABOAFwAaQB2AHoAhwCRAJsApwCxALsAvwAAAR4DBgYnJiYnBTcXBgYHBgYHJzY2NyUWBgYHBgYmJyY2NzY2JwUVITUBFAYGByYmJyYmJzUwHgIzMjY1NTMTNxcGBgcGBgcnPgI3Jx4DFwcGBgcuAicnBgYnDgIHJz4CNxMGBicOAgcnPgI3ExUjNzM3FwYHBgYHJz4CNwceAgYGJyYmJwceAgYGJyYmJwEeAwYGJy4CJwMwFhYXBiMhJzMXMBYWFwYjISchExUjJwGtLzgaAhEcEQcuGQGpKU0FEg8PLxUNBxED/UUPBx0TDBwYBQYREBwoBALs/RsBgg8qLQEJCQknIR0pJQgNCELnJ0cGEw8ZVScNEikjCuUZU2+BRgEWHQhZk2wfqwMPEhtRYjYMLVREFXIFDxEcU2M1Ci1WRRWd1hacKkULIDrWnQlblW8dzjA2EwYYEAoxGj0tMA4JGA8GKhYB6ExnOxgFHBUSSlYoBBkkDwQW/sII7MsbJxAEF/1tCAI4UPAJA1AFGSEfFgYLGzsRcSpJBQMBEzAPCBZFFy4wSzELBwUJDBAbCA5DKS0eHv03GScYBQ4YBwgLBQ4CAgIICc0BfShFBAQBIUsZCBc6PBY9QG5YQRYKAhsWJXCaYQYHBQItXVIcDR9bZTL9yAcGBB4+NhIOGUdMIwGxHh4nPwsBc7k3ECh0jk07BRsfGgoJFi4MPAshIxkIChg1EP7IDy4zMCINCSFHPhUBBhMcDRAdUhUeDhAeAX0dHQADACP/swOzAzkADAAaADQAAAEeAwYGJy4DJyUXBgYnDgIHJz4DExcGBgcRFAYGByYmJyYmJzUwHgMzMjY1AptYcTwTDSMWByxASST+bmwEEBMYTmhECylENyjmawIQExA1OAINDg8zLB0rLyYIEQwCPjdvZFAzCxIvZ2dcJg0mCQgBPIiBMQwqZ3BuASYMCg8C/QwdLBwGEhoKCQ4GEAIDBAIMDQAABAAw/7EDqgNBAA4AHAApADQAAAEGBicOAwcnPgM3AQYGJw4CByc+AzcFHgMGBicuAycnBgYHERQGBiMjEQNCBhIUQpmvyHQEar2mjjv+lwQQExtQakILJ0Y7LQ4Bg1RuPBYJHRUMNEFFHk4CEBMRGg0LAVgIBANrkFs3ERQZQGWYbwEBCAgCO4uGNQstbHNvMAUsVk4+JwoOI09RSRySCg4C/ewGDgwCWQAMACX/sQPMA0UAIQAsADcAQwBQAGEAbQCDAI4AmQCmAKoAAAEUFBURFBYzMzIyNzY2Nz4CNzMXFhYVFAYGIyMiJiY1EQEeAwYGJyYmJxMGBicGBgcnNjY3Fx4CFAYGJy4CJycUBgYjIxE1MRchFSEBBgYHDgQHJz4ENRceAwYGJy4CJwEUBgYHJiYnJiYnNTAeAjMyNjURMyUwHgIXBiMhJyElMB4CFwYjISchBzcXBgYHFRQGBiMjNRcVITUDAQkRLxEYBQUHAgQKCgUNAxAJFjg0Ph4gCv4QLjcZAREbEAcwFxoDEhAZSCoOHTUQ6y82FxEcDwIXIhG8DxcOCUIBBP73AioCEBICBBc5a1gNSlkuEQGNLzgZAhAbEAQbIhH+UA0oKQEGCQkiHRoiIAYNCD8CMBEbHQwDFv5aCAFE/pkSHB4MBBf+GQgBgyIjTAQVDhIYCwkj/tkCJAkTBf4VDAkBAQUHCDNDIKMGDQkNEwgNHBYCHQEhDSQmIhUFCyBJF/2tCAwBPGYjCSx8RQIXMi8nFwINHDs4FT4DCQgBBx4eHgEmCg4DcM+7p5A7ED+Tq77UczIRJygiFQILFjIuEf0GGScaBQ4ZCAgMAxACAwIICgFi8g0XGAwQHrYNFxoMEB52JToGCgLAAwoI/LoeHgAJACj/sQOlAykADwATABcAGwA6AEcAVABYAGUAABM1NRcjERQOAgcnPgI1NyEVIRMhFSEDIRUhJSM3FwYGBw4DBwYGIzQmJyYmJzceAjMyNz4CBTUxFzMVIxUUBgYjIwEjNxcGBgcVFAYGIyMBIRUhJSM3FwYGBxUUBgYjI6xQDAskSkAPPDgQJAI5/ceVAQr+9pUChf17Am4LJkwFEw8CCA8UEBI4HwYLCzcdARU2MAsYCw4RCv4DRO3yDxkNCgEZCCFIBBMLExgKCv55Ajn9xwIaCiRRBBcPExoLCQMAChgi/vBFmJiOOwpRusZiYh3+Qx0BXx0dKT8GBwJelnBJEBMTDxkJCA0FEQIFAwsOb7YOHh4e+AILCAErIjYFCQLLAwsIAtIcHCk+BgsDxgMJCAAFACP/2QO/A0YACgAWACEAMQA1AAATITcwHgIXBiMhBSE3MB4CFwYGIyEDITcwHgIXBiMhExcGBgcOBAcnPgMTMxEjMwL3MRMdIA0EF/yeARABljASGx8MAQ4L/gSGAmEzEx4fDgQX/TGvdAISGA0qQFp5UQ5WelMxoENDAnE/DxcaDRDoPA4XGQwICP6oPw4XGwwPA20PCgwCU7S0rZtAClLQ5ur+k/5+AAoAK/+wA7EDRAAMACcAMgA8AEcAUQBVAF4AgwCSAAATNTEXIRUhERQGBiMjASM3FwYGBxUUBgYHJiYnJiYnNTAeAjMyNjUBFwYGBxEUBgYjIwEhNzAWFhcGIyEHITcwHgIXBiMhNyE3MBYWFwYjISUzFSMnNRcjERQGIyMTIzcXBiMOAgcWFhcWBgc0JicmJzUyMjMyNjc2NjU0Jic+AiUXBgYHFRQGBgcnPgI1uUcCHP3eEBkOCgIzCiFXBRgPDSorAggKCSIdGiUiBw0H/uViAQ8RERcMDf5mAXMuHCgQBBf+LhQBgC8SGh4NBBj+HiABPiscJhAEFv5nAib5+SlJDBwXCvgMKUQLIw8rLBRPRAEBPUcGBg4qFDIOCg8HCws3Og8kI/3HYgIOEihqYwtOUiABCiEhHf7+AwoIATQqQAYMA7IXJRcEDhcIBwwFDwIDAgkKASsKCg0C/ogDCwgDNTsXIRAQzT0OFhoMEJQ4Fx8PEMceHh8f/i4EEgHoJUkIFDQzEyJPKTEzAw0WBQoEDwIEBhIRI0QkGEVGQQoKDQPZQXBaIQ4iV2g9AAAJAB//sAPBA0oACwAbACYAMgBIAFYAZQBpAG0AAAEeAwYGJy4CJwU1FyMVFA4CByc+AjU1JTAeAhcGIyE1IQUeAwYGJy4CJxMUBgYHJiYnJiYnNTAeAjMyNjURMzM3FwYHDgIHJz4CNyc3FwYGBw4CByc+AjcXFSEnJRUhJwG7N0IgBRAdEggjKhT+1U4MCR0/Ng4vLAwC4hIcHwwDFv0GAor+XENZOBcCFxISRE8jzA4uLwELCwwrJSIvKwgPCkHqKksKHhAyNRcODiQfCWwtTAYUERpTWCQMHEY/Enb9jgkCH/4mCQNKDSYpJRkGCxc1MBGPGCLxPYeLgjcKS6qxV/I+DxYaDBAduAYdJSYdDAUZMywN/ioYJxkEDhcHCAwEDgIEAgoJAUwqSAgCEy4tEAgVOjsU6SpJBQMBFjItEAgVOz4X6R0d6R4eAAQAJ/+0A8sDKwAHABYAIQAsAAAFFAYGIyMRMwEUDgMHJz4DNREzATAeAhcGIyEnIQMwHgIXBiMhJyECsg4ZEgtE/sMOJ0dyVAtVaTcURAIBERsdDAQW/H4IAyEIERoeDAMX/NwJAsM1AwsJAzb+yj12b2RXIw4xcHyISwE3/vQOFxoMEB0BjA4VGQwQHgAGADD/twO8A0MACgAVADMAPwBDAE8AABMhNzAeAhcGIyEXITcwHgIXBiMhARcGBgcGHgIXFjY3NjY3FwcWFgcGBiYmJy4CAjceAwYGJy4CJwEzEQcHPgI3FwYGBwYGBzADATESHB8NAxj8mCIBRi4QGx0NBBf+WQHDawEPEwIVM1xIDA0HCRkJDRIXCAcJHyQmEU9oPBqTNkUkCgoaEQsrMRb+ZkFB1iucyGoFTtuSAwwGAmw8DhcZDBCwOQ0VGQwQAcMMCRADcd/KoTQLAg4SQR4CmB0dCAwDDBgNPrPfAQByBhsiIBgJCBMrJw7+e/6eCRsIJjMcER5TMgkMAwAACQAq/7ADvwM3AAgADAAQABsAJwA0AEIAWABjAAABNxcGBgcDIxMXFSEnJRUhJwM+AjcXBgYHBgcTHgMGBicuAicFBgYnDgIHJz4CNyUeAxcHBgYHLgInExQGBgcmJicmJic1MB4CMzI2NREzJTAeAhcGIyEnIQK1IkkFDw0NRREc/fUJAhr90glzJouvXgZAuH4CDj89TSgJDBwTCS45GgLIBg8RF0NMJAwfQDgR/vUcXHSCPwITHwdVlHIiCw0uLwEKCgwqJCEtKggOCkEBVBIbIAwEFvyOCQMLAxEmPAYFAv7lAT6XHh6XHR39Ow47UCsOKnRIEwgBmRAsLSkbCAsbPDgSKQcEBBQvLRMNGT9AGSxWg2BCFwoDHhgreK99/lAaKBoGEBgJBw0DEAIDAgkKAcs7DhUaDBAeAAoAHv+wA8sDRgAVABkAHQAyAD4ASQBTAGAAbQB4AAAlFAYGByYmJyYmJzUwHgIzMjY1ETM3FSE1JRUhNScXITcXBgYHERQGIyMRIREUBiMjERMeAwYGJy4CJwEwHgIXBiMhJyEXMBYWFwYjISchAQYGJw4CByc+AjcXBgYnDgIHJz4CNxcGBxEUBgYjIxE3AxEPLC4BCQkMKCMgKycHDwlCG/6iAV7+oiZKARUgSAUQDyAXCv7cGxkKCTRAHwUQHBEHIikTAaYRGx4MBBf97QgBsVocKA8EFv2SCAIQ/gsFEBEcU2IzDCpTRxZuBBESHVdqOgswWkoWBQYZDxgMDSMRGikZBQ8YCAgLBQ8CAwIJCgF3hB4ehx4epiAnOAUJAv7nAxABMP7ZBA8BV/20DSQnIxkFChYyLxABBg0WGQwQHVYXIRAQHgIUCAUDIlFOHwwmYGIn9ggHBC5uaywMMn1/M7oNBf4VAwsJAf4tAAgAJv+yA88DRgADAA4AFgAlADYAQQBQAFoAAAEhFSEHITcwHgIXBiMhASM3FwYHFSMnHgMXBwYGBy4DJwMXBgYHDgQHJz4DNCUXBgYHERQGBiMjAzMWBgcGBiYnJjY3PgI3HgIGBic0JicBdQG8/k1XAjQoEBcaCgQV/XoB2QolTgwfPpQKLE98WgIYIAVSbkIjCTRlARARAQMbRoVtDF9yOhX+kGQCDxMPGAwNTxIVEBIIGhoICgoNDRgPri4qCBEeEB0SAn4d9DsPFhkLEAEvJzwOBvgMNWVaTh4MBBQcI11tdDsB1wsLDwKI4LeScisSLnWVu+WVCgoQA/yrBAwIAtBNdhwMDwEKDh8NETpIOx48NCEFDydaHwAABwAi/7EDxwNEAAsAGgA4AEQAVQBjAGcAAAEwHgIXFAYHBSclFwYGJw4DByc+AzcDBgYHBh4CFxY2NzY2NxcHFhYHBgYmJicuAgI1Fx4DBgYnLgInBTcXBgYHDgMHJz4DNwUeBAYGJy4DJyUVIScDZxIdIA0NCv36CwGkZwQRFB9fgqZlCVuWd1YatAEQEwEUNGFNDQ4HCRkJDREYCAcJHSQmElZuPRmmNkUkCAwcEQknMRf+lidKBhEQEzdUfFYORmpMMw7++lR2TSoMChsTD0FVWSgBOP68CQJwDBIUCQkKATwcMX4ICANJj4RsJg4sd4yYTQFdCQ8DeurNnjAJAg4TQSADlxwaCQsEChUMOa/jAQqTJw0kKCUZBwkYNDAQZSpEBwQDYcW8pEANQqrCzWaLSYNwWkElBg82gYZ9MZMeHgAABwAg/60DwgNEAAMAIAA+AEoAWQBkAHQAABMzFSM3IzcXBgYHDgIHBgYjNCYnJiYnNR4CMzI3NjYTFwYGBwYeAhcWNjc2NjcXBxYWBwYGJiYnLgICNx4DBgYnLgInExcGBicOAwcnPgMlITcwHgIXBiMhJzU1FyMVFA4CByc+AjW07e3RCiVKBRMPAw0WEhAuGgYIByYUDiYiCRUJDxKMZgEQEgEWOmhQDg4HCRkJDREYCAYJHSUnElhzQxyPNUQmCwkYEQsrMxiBaQMRFRlSdp9nCFqPakj9rQKGMBIbHwwDF/0MIE4NCR9COA0yLw0BuhwcJzsGBwJkhUwRDw8OGAgHCwMRAQMDCg+UAhcLChACdujLnzAKARARQh4DlRoaCAwEDBQNOa7gAQd7BBkhIBgKCBQpJAz+3h8KCQFPnY92KQ0vf5ikzzwOFxkLEB0KGCLXOoSGfzYMSaSsUwAHACj/sgPDAz0ACgAoADQAQQBOAFsAcQAAEyE3MB4CFwYjIQEXBgYHBh4CFxY2NzY2NxcHFhYHBgYmJicuAgI3HgMGBicuAicTFwYGJw4CByc+AgU+AzcXBgYHBgYHARcGBicOAgcnPgIHMxEUBgYHJiYnJiYnNTAeAjMyNjUoAw4xEhweDgQX/IsCBGcBEBIBEjBcSQ0MBwkXCQ0QFwcFCB0jJRFSaDoXijhEIggOGxEHJzAYcGAEERMohbh1CGinev0nIGqImlEEUuCUAw0GAXZPBxkSNIydTAVHmYZ9QQ4sLwEMCQwpIyEtKAgPCQICPA0WGgwQAVgMCRACd+XImy8KAg8SQR4DlBoaCAwEChQNN6zcAQZcESssJxoFDBo5NRL+tygJBwNSpo4uDjaasmAFFiEmFBAfUjAKDQICiEEGAQYTJyEKERA0OT39OhorGwUPGwcKCwUPAgQCCgsABgAo/7IDsANGAAwAGQAdACoAQwBOAAAFFAYGIyMRNTEXIRUhJTcXBgYHERQGBiMjERMVITUlPgM3FwYGBwYGBxMGBgcRFAYGByYmJyYmJzUwHgIzMjY1ERcwHgIXBiMhJyECIw4WEAtEATP+yAEZJU8FFg8SGQwJG/6n/iAZVWx7PwY/r3QBDAb0ARESDSouAQoJCyceHSklBw0JnBAYGwsDF/6ECAEkJAQMCQL9IiIdHSo/BgoD/VsDCwoC5f2fHR3PBhskKhcPIVo2CQ4DAmAKDgL89RspGgUQGwgKDAUQAgQCCQsDKqsNFhkLEB0ACQAc/7MDwwNGAAsAJAAuADYAQABOAFsAZQCGAAATPgI3FwYGBwYGBxMGBgcRFAYGByYmJyYmJzUwHgIzMjY1ERcwFhYXBiMhJzM3BgYHFSM1NQM+AjcXDgIHExcRBzcWBgYHJzY2NREFBgYnDgIHJz4CNwUwFhYXBiMjNTMTBgYHERQWMzMyMjc2Njc+AjczFxYWFRQGBiMjIiY1ER8caoZGBTKQXQELB8cBERMMKi0CCgoKJyAeKSYHDQqEGSMPBBb+zAji/QETEz4JFUpdMQYWRVQsIA85FAoDDQcxGA0CHAQVDhVCSyULH0Q7Ef7UGiMOAxfAZuwBDxMMEzcTHQcGBwIECQsDDQQQCxk9OEMwIAE8CSUyGw0eVDMJDwMCUQoOAvzzGikaBA8aCQkMBBECBAIKCwMqqxYfDxAe0wwPAyM7EfzECCErFw0PMzseA0cJ/QEZGxQfFQU/EREOAuTpBQYHFDY4GAseT0waRxcgDxAdAU8KDgP9CBAMAQEEBAcnMxh8BgsJDg4GICQDLAAACQAb/7EDxgNGAAoAFQAfADcAPgBKAFUAbgB6AAABITcwHgIXBiMhByE3MB4CFwYjIQchNzAWFhcGIyElFwYHERQGBgcmJicmJic1MB4CMzI2NQMXBgYHESMHHgMGBicuAicBITcwHgIXBiMhExcGBgcRFAYGByYmJyYmJzUwHgIzMjY1Az4DNxcGBgcGBwGiAW0vERsdDAQV/jBJAeAwERsdDAMW/bwBAeAsHCUPBBb9xgFsZAQfDi0xAgoMDCwjIjErCA4KcGQBEBNAqjhFIQQSHxMGISsW/nEBBioQGBoLBBf+poxlAhESDCkrAgkJCiMdGyUiBg4IohhRaHY9BT2obgYQAqU7DhYZDBCWPA4XGQwQjjoXIg8PiwsVBf6EGygZBRAYCAkLBRACBAIJCwMqCgoPA/7J6g8pLSkaBg0aOTUSAW85DRUZCxABAgsKDwL88hsnGAYQGQgJCgQQAgICCAwBJgYXHyYUDh5UMhMHAAsAH/+wA84DSAAKABUALgA4AEQAVQBiAG8AfQCBAI0AAAEeAg4CJyYmJwE+AjcXBgYHBgcTBgYHERQGBgcmJicmJic1MB4CMzI2NREXMBYWFwYjISczEx4EBiInJiYnMT4ENxcGBic3DgMHAxYWBgcGJiY2NzY2JwEOAwcnPgM3Mzc3FwYGBwYGByc+AjczFSE1BTAeAhcGBiMhJyECUS41FgITHA8BKxn92hxsikgGNJRgAhHeAhESDCgpAgkJCSIcGiQhBgwJdBkiDgQW/s4I5MGAr203Dg8fEUDmmBAmJiUdCF4EFRoQCyUtLxU7DwYQFhIfEQYVDhwBAaoTRHW1hgZxoGk+DkcEK04FEw4SOhcNBhENBCH+MgGyEhseDAINCv3TCAHJA0gSKywlFwIOJVMa/gAJKjkfDiBdNRMJAksKDgL88hooGAUPGQkJDAQQAgMCCQoDLKkWHw8QHv5oJEc/NCYWDD6FPRtRXFxRHSEICwQMH11pZSgCCShHNRANBBchEAtAKf7JZp10UBcRH1Ryl2H5K0oFBAEYPRQGEzQzEh4evQ4WGQ0ICB4AAAoAIv+wA8gDRwAlADIAQgBeAGIAcAB0AH8AmACiAAABNRcGBgcVMzUXBgYHFTM3MBYWFwYjIxUUBgcjNSMVFAYjIzUjJxcWBgYHBiYmNjc2NjcFBgYHDgQHJz4DNxc3FwYHDgIHBgYjNCYnJiYnNR4CMzI3NjY3MxUhJyU3FwYGBwYGByc+AjczFSE1BT4CNxcGBgcUBxMGBgcRFAYGByYmJyYmJzUwHgIzMjY1ERcwFhYXBiMhJzMB+10BDhGUYAEPEUYpGiUPBBajGRkNlB0VC5IHRQsBFRYSHA8HEw8kAQELARERBBAmSXlcC2FyOBID4yRJCh0EExsVETIcBwoKMBkTMSsKGAoTGgYg/j8JAc8oSQYSDxE5Fw4IExAFIf4h/ocaZoFCCC6GWA/DAhESDCsuAgoKCychHyonBw0LhRkkDgQW/skI5gK3jgoKDgJqjgoKDgNpORYgERBYAw4BalwEDGwemSlDMg0MBBUdDQs8LW0KDgI/cmZcUCQTMWx7jlOHJjwLA1iBUhIODwwYCAcMBBICBQIJEZt9HR3EKUcEBAEVNBEHEC0tEB0dvww1RSUMJWpAEwkCTgoOAvz0GikaBRAaCAoMBBECBAIKCwMprBYfDxAeAAwAJf+wA9IDSwANABkAKAAsADcAPwBIAEwAVgBhAHoAhAAAARQOAwcnPgQnEwYGJwYGByc+AjcXNxcGBgcOAgcjPgI3FxUhNRMeAhcVBgcmJicTNxcGBxEjEQEwIiMjETcXIyUVITcBMBYWFwYjISchJT4CNxcGBgcGBxMGBgcRFAYGByYmJyYmJzUwHgIzMjY1ERcwFhYXBiMhJzMCkg4tVpBqBl18SiYLAwgDEhEre0QOJUc+Fb8qSwUTDxIwNhwSFCcgCXb+ddoaXoBNLAtxiiSaJk0LID7+qxwXCw09DAEb/wAOAZsYIQwEFv1vCAJH/L8bY35CBi2FVgQPxgIREgwqLAIJCgkmHh0nIwcOCXoZIw4EFv7ZCNcCGmiphWhOHhAlVWZ+nGABDQgKAWCeMgsnbYJEcypFBQQBFzw5FBlJShmyHR3+zUFmRA8LCTInmXkBOic8DQb+5wFB/sEBShAbsh4e/l4YIxAQHjUJJzQdDh5WNBUGAl0KDgL88xsoGQUQGggJDAQRAgQCCQsDK6oWHw8QHQAACwAb/7ADyANGAAoADgASABkAIAArADgARQBQAGkAdQAAJSE3MB4CFwYjIRMhFSEVIRUhExcGBgcVIxEzERQGIyMTMzcwHgIXBiMhBzUxFyEVIREUBgYjIwEjNxcGBgcRFAYGIyMBMzcwHgIXBiMhExcGBgcRFAYGByYmJyYmJzUwHgIzMjY1Az4CNxcGBgcGBgcBTwHzMBIaHgwEFf2obQGa/mYBmv5mqWQBEBNAQB4YCh+tLxEaHgwEF/7q7UUBev6BEBgNCwGkCiVQBRcOExgMCvzn8SkQGBoLBBX+uoxkAhESCyorAgkJCiUdHCYjBg0Jox5ykU0FOJ5mAgwHlTwOFhkMEAFHHXAdAisLCg8C4f70/pYDEAMgOg4VGQwPaR8fHf6+AwoIAXQoPgULA/7XAwsIAX85DRUZCxABAgsKDwL88xooGAYQGQgJCgQQAgICCAsBIQgjMRkOHlMxCgwDAAAKACL/rwPQA0UACgAWACIALwA8AEwAWABjAG8AegAAATAeAhcGIyE1MycGBw4CByc+AjcFDgMHJz4DNwceAhcHBgYHLgInBR4DBgYnLgMnJQYGJw4EByc+AzcnHgMGBicuAicHBgYnBgYHJzY2NzceAwYGJy4CJwUwHgIXBiMhJyEDexEbHQwDF/6y42wFHxM2RCsQHjImCgEJDzponnIKYYpZMwnMFFSQcAMWIQdlfUMS/kBffkgcBh4WDz1OVCUBLQMUEgcYLUpxUA1XcEEdBAY6SCYIDh0SByozGSwEEhAmZDcNK1IbDTRAHgIRHhMDHicVAScRGh0LBBX+FwgBiQKjDRYZDBAdxhYBWquUOghBpLdd3XbPr482DT2SrMRtDofuvD0KAxcWR8f1ic0wX1ZELAwOJ1laUR8qCA0CHk9cZWczEESLgnArnxAsLysdBwsdPjkTGAcKAkVxIgwrik3nDiksKBsGDRo5MxJvDhUZCxAeAAQAKf+vA8kDRAALABYAIQAwAAABHgMGBicuAicFDgMHJzYkEjc3MB4CFwYjISchBR4DFwcGBgcuAycBlz1KJgkPHRIJKTYaAYkhdrP4owjDAQ6lIp8SHh8NBBb8lgkC/f3hIoC04oQDGSgKftCich4DRBIwMSwcBwweQDsV14LZroIrEEHFAQOdSBAXGw0QHgeAzZprHgsCHRkmd6bbiQANACT/sQPKA0oADAAXAC0ANABBAFAAXABoAHMAfwCJAJMAnQAANwYGJw4CByc+AjcTHgIUBgYnJiYnExQGBgcmJicmJic1MB4CMzI2NREzARQGIyMRMxMGJicOAgcnPgI3BwYHERQOAgcnPgI1EQUwHgIXBgYjITUzJQYGJwYGByM+AjcnHgIGBiInJiYnEx4CDgInNCYmJxMwFhYXBiMhJyEXMBYWFwYjISchEzAWFhcGIyEnIfAEEBIOLjojDRsqHghHLDYWEhsPBysVbQwnKAEGCAkgGxciHQYLCD8CCB0ZCkBxBxgSJWZvNQYxal0e3wQSDSlURg1DRBYBRxIbHgwBDgv+oPT+lQMSEBA1HBMLFREG7ScsDwMUGg0BHhLgLTUVAhMbDxQfEnodJhAEFv4qCAF5HRskDwQW/lgIAVIuGyYPBBb+TggBWOMHCAIiUE4fDCVeXicCPw0jJCAUAgsdRRb8zBgmGQUOGAcICgMQAgICCQoByv3qAxICOQEbCAEFDRsWBxENKS4SbQgC/uFDioV4MgxEoK9dAUfPDhYaDAgIHY0HDAEiUiMcRkceBRkzLyUVDidbIP5nFjIxJxgDDxw9OBQBIxcgEBAeYRYfDxAeAakWIA8QHQAABAAl/7ADvQMyAB8ALQA5AEUAAAEUFBURFBYzMzI2NzY3NjY3MxcWFhUUBgYjIyImJjURAw4EByc+BDclMB4CFwYGIyEnIRcwHgIXBgYjISchAlYQIWwlNQwQBgYRCQ0CEgwfV1V1Ki0QJAINK16lgg1zk1EjCAEBdhIeHw0CDQv9FwgCfXQSHiANAQ4L/JYJAvwB0AoRB/6BDQsBAQINDVQymQYNCw8UCA0fHAGvARhlv6+ejDsSP46dqrReSg8XGwwICB7aDxccDAgIHQAIAFL/sgPLAzoAAwAHAAsAGAAiADsARgBSAAAlFSM1ExUjNRMVIzUzNxcGBgcRFAYGIyMRJxcjERQGBiMjESUGBgcRFAYGByYmJyYmJzUwHgIzMjY1ERcwHgIXBiMhJyEFHgMGBicuAicBRtLQ09XSrCVQBRgPEhgLCthKDAwYEQkC6wEREw8yNQMMDQ4xKyk4MgoRDJ8SGx4LBBb92AgBxf58PUkjAxIfEwEkMxynHh4BIh4eASIeHik/BgoD/YgDCwkCuCEh/S4CDAkC6UQLDgL9AxsqGgYQGAgKDQUPAwMDCw0DHqgPFxwMEB6TIEZDNiIFEChYUR4ADAAr/7MDuwNIAAkAFAAYABwAKAA0AD8AQwBHAFQAYQBsAAATITcwFhYXBiMhByE3MB4CFwYjIQEzESMTMxEjJR4CFAYGJy4CJzceAwYGJy4CJwUXBgYnBgYHJzY2ASEVIRUhFSEBIzcXBgYHERQGBiMjATUxFyEVIREUBgYjIwEXBgYnBgYHIzY2ZwKnLR0oEAQW/PlEAw0uEhodDAMX/JMBP0BAvEBA/oMvNxcTHBABGCARbjE7HAIQHRAFHCUSAexeBBIQHkQfEBYv/iEB6f4XAen+FwG9CiVRBRcOFBkLCv4nRwHF/jUQGA8KAZ9mAxIRFz8fGBMsArA4FiAQEOs5DRYZCxABJ/7iAR7+4ucVMTAnFwMOGzw3FdINJygkFwQLFzMvEMAqCAoCI0kZCiFj/lkeex4BSSk+BgsD/r0DCggBgSEhHP6tAwoJA5UdCQsBGj8ZIV0AAA0AKf+xA8UDNwAMABsAKAAsADMANwBDAFAAXQBhAGUAaQBtAAABHgMXBwYHLgInNzcXBgYHDgIHJz4CNwE+AzcXBgYHBgYHExEHEQEGBiMjETMFFSEnJTAeAhcGBiMhJyElFAYGIyMRNTEXIRUhJTcXBgYHFRQGBiMjERcVITUTFSM1NxUjNQEVITUCQhRHYn1JAS0OXolZGeQpSAUTERxhkmYJV39VFf0LIm6Mn1QDVumbAw4Hlz4BNQEcGAo/AXL+sQkBdREcHQ0BDgv8kAkDDP3eEBkOCkcB4v4YAb0lUQUXDxMZCwog/f288PDwAjf9/QFORmxSORIKBzIjZ5ZpDSlACAQBUY1vJg8qeZNS/twCDxMYDRIWOiQJCwIB6P5kDAGo/gIDEQIScR0drw8WGgwICB0zAwsHAS4gIB4eKD4GCwPoAwkJASfiHh7+ox4eex0dAVUeHgAHACn/sgO9A0kACwAaACQAKAAsADAASwAAEyE3MB4CFwYGIyElFwYGJw4DByc+AwMRFAYGIyMRNxcHIRUhNSEVIREhFSEBIzcXBgYHERQGBgcmJicmJic1MB4CMzI2NTADATESHR8NAg4L/JcBbmgDEBQaUGyKVAtIemBHPA0YEAoTOS8B0f4vAdH+LwHR/i8BqAsjWQYYEQ4sMQIJCwspIiAtKAgPCQKqPQ4XGQwICLwgCggBRZKNfS8NNIWXm/78/c0CDAkCQSEYnB25Hf7kHQFWLEIHDAP+QhooGQUQGggIDAUQAgQCCgwAAAUAIv+zA74DSAANABcAIgAtADgAAAEeAxcHBgYHLgInBwYCByc+AjczNwYGBxEUBgYjIxETMB4CFwYjISchEzAeAhcGIyEnIQIbIF1weT0CFiQJTItxJhg95qIMW5ZzIktGAg8VDxgODc4RGx4MBBX+IwgBeNcUHSANBBb8xQkCzQJpSoh4Xh8KAh0YNJnDcAik/ulgDUSwxmTTCw8D/KwEDAgDlf2jDxcaDRAeAf8PGBwMEB0ACAAs/7MDxANPAAoAFwAkADwASgBYAGUAaQAAATAeAhcGIyEnIQUGBicOAgcnPgI3BR4DBgYnLgMnJwYHERQGBgcmJicmJic1MB4CMzI2NRETNxcGBgcGBAcnPgI3BR4DFwcGBgcuAic3BgYnDgIHJz4CNwUVITcDKRIdHw4EGP0CCQKW/pcFEBEfXnM+CTRjURgBTVFrPRYGHBUPND9CHToEHw8vMgMKCw0tJiQzLQgPCswzTAcUFGf+nfYGk/u9N/6cKICmwmoBFh8GiuaqNKMDEBQjaH5ECzlqVxoBX/5tGQFWDxcaDBAedQcGBCRMQxcNH1NcKRUXNzgxIgsKGTk5MRTVFQT+oBsmGAUPFggHCwUQAwMDCgsBggFQK0kGBAGTtyURIW6YYBxDZUYrCQwEIBkXVYxncQcGAjh0YyINJ25+PWoeHgAABwAj/7IDxANGAAoAFgAhACsAOQBFAFAAABMhNzAeAhcGIyETITcwHgIXBgYjISUXBgYHERQGBiMjAzMVBgYHJz4CNx4DFwcGBgcuAicBHgMGBicuAiclFwYGJwYGByc2Ni4C+TMTHiAOBBf8mSgCoDMSHCANAg0L/PQBaWcCDxQQGA0NI0xH75YKVJV5jyFhc349ARUhBk+TeCj+1jQ8GwETHhECGyYTAf1iBBQPIlImDho8AYM/DhcbDQ8BQT0NFxoNCAi9CwoPA/yuBQ0JAcsPfMxEEDCBkUk3Z1ZDFQoDHRglc5VYAQMbPDctGwMPIEdDGgUsCAoDLlgeCidzAAkAF/+0A8MDRgAVACIALwA7AEYAUgBdAGcAcQAAJRQGBgcmJicmJic1MB4CMzI2NREzBwYGIw4CByc+AjcFHgMGBicuAyc3MB4CFwYGIyEnIQMwHgIXBiMhJyEBHgMGBicuAicTBgYHERQGBiMjERcGBgcnPgI3MzcwFhYXBiMhJzMCpQ0sLAEKCQooIR4rJQgNCUB7AxATEDhLMAwlOigLAS5EVSsKDR4TBiAuMxeDEBwdDAIOC/3OCAHRBRAaHAsDF/49CAFn/e8wOhkCEhsQBBwjETEBDxQPFwsOOBhkUA8oOigMRVYbJhAEFv61CO8VGSgaBQ4ZCAgMBQ8CBAIJCgHjnAcIMXVyLQwzgIM2CzVlV0QoCBAoWFpSIscOFhoLCAgdASQNFRkLEB7++xYyLycXAg0aPDkVAV8LDgP8rQQMCAOS94LnXgxAl6NROhchDxAdAAoAHv+wA8kDSgALABYAIAAqADYASwBXAGUAaQBtAAATHgMGBicuAicTBgYHERQGBiMjERcGBgcnPgI3MzcwFhYXBiMhJyElBgYnBgYHJz4CNwMXMzcXBgYHERQGIyMRIREUBiMjERMWFhcHBgYHLgInJTcXBgYHBgQHJz4CNzMVITcBFSE1+jI8HQMPGxAGHygTNAEPExAWDA04GGRPDyg7KAxDXRskDwMX/qUIAQIBVgMSESZwQw4jQDYRTkr8IUgFEQ8gFgr+9BwYCjZB3agCFBwFaZtvKAEeLEYFFBJG/v3JCXa8hyYc/s4MARz+vQHtEy4sJBYDCxk3NRMBWgsPA/ymBAwJA5r8gOFcDT+Sn1A4FiEPEB7GBwwBY6U1CipxhUf9+iAoOQYIA/7QBA8BSP7EBQ8BbQF/baYtCgUaFydtiFFAKEIGBQGP3TwQLoepYB4e/UkeHgALAB3/rwO+A0QACQATAB4AKgAxADwASABMAFAAVABhAAATITcwFhYXBiMhNzMVBgYHJz4CExcGBgcRFAYGIyMTHgMGBicuAicBFwYGBxEjExcGJwYGByc+AiUeAhQGBicuAicTIRUhFyEVIQchFSEBIzcXBgYHERQGBiMjLwEFKxokDgQW/qaQQRtsVQ8sQS8WZQIPFA8XDA5AMTsbAw8aDwcfJhIBeWUBERJB2mYHHhxHIhAPHhz+WDI6GhIeEAIbJRINAdf+Mg4Buf5QOwHy/hcBwgolUQUXDxMZCwoCXjkXIQ8QHhB/31kNPZCdATYKCw4D/KkECwkCDxYwLSQWAwwZOTcUAYULCg8D/qIBUCIUATRoJQodTlcgIEA6LxsCDyJMRxz+zh23HcEeAdApPwULA/46AwsJAAUAKv/jA8EDLAAKAA4AGQAkACsAABMhNzAeAhcGIyElMxEjJSE3MB4CFwYjIQEzNzAeAhcGIyElFwYGBxEjUQK5NBMeIA4EF/zYAYBERP5QAwM0Ex8gDgQW/IsByOQyEx0gDgQY/qj+ymkCEBNEAutBDxgbDBAd/QkMQQ8XHAwQAa0/DxcaDRCJCgoPA/4gAAUAHv+wA8wDRAAYABwAKwA6AEcAAAERFAYGByYmJyYmJzUwHgIzMjY1ERcGBgUhFSElIzcXBgYHDgIHJz4CEx4DFwcGBgcuAycFFwYGJw4CByc+AgIUDi8yAwsMDSwnJTItCQ8LZgIP/goBMv7XAQYKKkgGEREXVYZlC1J1SuUZWXeIRwMVIghGeGRKFwFAXAUQER1WYzELKFRJAx789xsqGgYRGQkJDAUQAwMDCwwDKQsKDvYeHilCBgYBX7ujPA5ArMMBCoPLmW8oCgMdGDN/pNiMPzgHBQQeSUkeDCZcXAAJACn/sQPTAzoAIAAkADQAQwBRAFUAgACMAJgAAAE3FwYHFRQWMzMyNjMyNzY2NzMXFhYVFAYGIyMiJiY1NTMVITUnNRcjFRQOAgcnPgI1NRMeAxcHBgYHLgMnJTcXBgYHDgIHJzYkNzMVIScHMjY3PgU3Fw4EBwYGFxQeAgcGBiMiJic2NiYnJiYnNTAyMgMeAwYGJy4CJzceAwYGJy4CJwLBJUkKHAcOLA4XBgkFBQkECgMPDRQ1MTgcHAoh/vwjTAwMJk5BCjw7FAEbYYapYwEXIQhfmnhUGgFVLUgGExIxnOObCM8BCzoe/jQJ7gkKBwUIDxsuRTMTDygqJRsFBwsBCQwHAgEcGw4RAgcBCwwKFxARFjc3RCMIDh0SByYvFkw6SycKCx4TCS00GQMUJj8KA8AIBwEBAQIBAQULCw0RCQsaFvceHgoXIVgiUFNMHg0rYmQwWf53VoZiQBMMAx4ZGk5wlWELKUQGBQFrrHsjEEDpox4ewQUQChIfPGWccQYqa3BlTA8ZLxMRIygxHyAmGxc0UzYHBwYBFgGOCB4mJRkHCRcvKw7pByEoJxwJChg0Lg8AAAkAJP+uA8QDPAADAA8AHQApADUAXwBsAHMAgAAAJSEVIQMhNzAeAhcGBiMhARcGIicOAgcnPgMlHgMGBicuAicHHgMGBicuAicTMjY3PgQ3Fw4EBwYGFxQeAgcGBiMiJic2NiYnJiYnNTAyMiUjNxcGBgcRFAYGIyMDNxEwIiMjJzUxFyEVIREUBgYjIwGaAa3+U2MCAjESHB8NAg4L/ZYCBk4IGhJDr8BeA0KOiXf9WzdGIwgOHBMIJi8XQTZDIggMHBIJJC4XPgkICAULFChENhIMIyUgGAUHCQEJCgcBAR4ZDRECBwELCwoXEBIWAs4KJFEFFg8TGQsK2UEdGgrbRwGR/mkQGQ0LIB4CDj4PFxoMCAgBSkkFBg8eFgQRChwjJAwIICcmGgkKGDEtD9IGHSUjGgcKFi0oDf50Bg8KFStWl3YFJF5jWkIOFy0SECQoMB8gJRsYM1I1BwgFARZnKD4GCwP+zAMLCQM0Cf4mEh8fHv67AgsIAA4AKf+uA8wDRQALABoAJgAwAE4AXQB1AH8AgwCNAJEAnACoANEAAAEeAhQGBicuAicTFA4DByc+AzU1MyUGJw4CByc+AjcXMBYWFwYjITUzBTcXBgYHDgMHBgYjNCYnJiYnNRYWMzI3PgI3JTcXBgYjDgIHIz4CNwcGBxEUBgYHJiYnJiYnNTAeAjMyNjURFzAWFhcGIyEnITcVIScnMBYWFwYjISczFxUjNSUeAwYGJyYmJzceAwYGJy4CJxMyNjc+BDcXDgQHBgYVHgIHBgYjIiYnNjYmJyYmJzUwMjIBXy43GREdDwUaHw9IBxMoQzMOLzcbCD0BbwQeDjE/JQwaLCAI0xwnDwMW/trA/polSgUTEAEIDBIOEjAaBggIJxQXOw4VCwwQCAIBWChFBRMQETEzFhIQJyILGAQfDCgpAQgKCSMcGiUhBgwJoholDQMV/p4IAQ0i/wAJUholDgQW/rcI8yid/rUxPR0FDxsSCTgdOjVBIQYNHBIIIywUAQkJBgUIDx40KhIKGRsXEgMFCAINDAIBHBgNDwEHAQoKChYQEBUDRRMuKyMWAgsYNzQS/s0xd4CCezcMSpybkT58nQ8CK2hnLQ0wdHQucxchDxAewCg+BQgBcqVxQw8UEg8YCAcLBBECBAoOacKRMCdDBAQMIiMMEjAvEHcVBf6UGScYBA8XCAgMAw8BAwIICgGMShcfDxAe7h4eyhcgDxAdwR0dfQcdIyIYBQofQRPzCCAlIxkGChYuKg79nAUQChInS4RnAyFTV088DBUrEhYyPyogJBsXNFU4BwcFAhYAEAAn/7ADvwM7AAsAFgA/AEMARwBLAFYAYwBsAHwAhgCQAJoApAC/AMwAABMeAwYGJy4CJwceAwYGJyYmJxMyNjc+BDcXDgQHBgYVHgIHBgYjIiYnNjYmJyYmJzUwMjIBIRUhByEVIRchFSEnITcwHgIXBiMhASM3FwYGBxUUBgYjIwU1FyMRFAYjIwM1NRcjFRQOAgcnPgI1Fx4CBgYnJiYnFx4CBgYnJiYnNx4CBgYnJiYnFx4CBgYnJiYnNyM3FwYGBxEUBgYHJiYnJiYnNTAeAjMyNjUDMxUHFxEUBiMjETcnbzVCIQYNHBIIJCsVNTI9HgUPHBIJOB4yCAgHBQgSITsuEwwdHhsTBAYIAQ0MAgEbGQ0QAQcBCgsKFhARFgEeAef+GQIB5/4ZPQHK/jZFAdMuERodDAMX/cUB1wojTwQYDhMXCwn+SUkNGxcKPUgMCSBDOhA2NBCfLjERBxcPCS4XCC4xEQcXDwkuF+0vMREHFw8JLhgILjMRCBcPCS4YnAogUgQYDwwlJwIGCAgeGhceHQcKCOo+CwkbFwgJCwM7CCAlIxkHChYvKQ/NBh0jIRgGCh9AE/5vBRALFCpWk3QEJFxiV0IOFi0SFjE9KR8kGhczUzUIBwUBFgJKHHAc6ByjOg4VGQwPASYmPAULA40DCQfHHx/+QQQSA2UKFyH3RJyhmEELWMXOY+QLISIaCAkYNhGMDCEiGggJGTURnQsgIhsICRg2EYwLIiIZCQkZNRDqJz4EDAP+rRgkFwQNGAcHCwMQAgICCQkB/pQBAf5kBBABsAEBAAYAIf+zA8QDOwAKABsAJwA0AEIAWAAAASE3MB4CFwYjIScXBgYHDgQHJz4DNBMeAwYGJy4CJxMXBgYnDgIHJz4CBzMWBgYHBiYmNjc+AiUzERQGBgcmJicmJic1MB4CMzI2NQFoAdsuERodCwMW/cWTYwIQEgEBEjBcTAw9SyUMEkRXLg4MHRMLNkUgoFYDFA4RMzsdChQuKfoPDQMbGBMhEQgVDR4XAjJADi4wAQsJDSslIy8qCQ8KAug6DRYZDBBxCwoPAoLcuZl8MREzgJy94f5KGTk6MCAJDCNNRhoBizkFCAUQLC4UCRtEQQg8XUASDgEVIREJL0iu/T0aLR4GERwICg4FDwMCAwkMAAkAJ/+wA7sDSAADAA4AFQAkADAAPABIAFUAYgAAEyEVIQEhNzAeAhcGIyEnFwYGBxEjATMWBgYHBiYnJjY3PgI3HgIGBiYnNiYmJzceAwYGJy4CJzceAwYGJy4CJwE1MRchFSERFAYGIyMBIzcXBgYHERQGBiMj3gIr/dUBBwEjMBIcHg0EFv5uIWoBEhRD/vQSDxUvGRYvCQcSEBszIa8lJwsJFx0OBQcOCcI1Px4DEh0RBCApFdRFWC8MDR0UCTZFIf3qRwIF/fUQGQ4KAiQKJFIFFg8UGQsKARQeAbg+DhcaDRC4CgoQA/7P/rJAXDkNDQESEBwICy9DJyJBOSwXARAhSEYbCB49OS4cBA4iSkYbChs+PTQjCA0mUkwbAWUhIR3+7AMLCAFHKT8GCwP/AAQKCAAIAB//sQPIAywACgAVADYAQgBNAFcAYwBnAAABITcwHgIXBiMhByE3MB4CFwYjISUzFBQVERQWMzMyMjc2Nz4CNzMXFhYVFAYGIyMiJiY1AzMOAwcnPgMBMzcwHgIXBiMhFzM3MBYWFwYjIQM+AjcXBgYHBgYHEzMRBwGqAWMxEx0gDQQW/jA5AcYxEhweDQQW/dIBPEEIEDARGAYJBAQKCwUNAxAIFjg2PR8gC8FHAx1Fe2MHUmU3FP408y4RGx0MBBb+rAHmKRoiDQQV/skgH3SUTgM4n2gDCwh0QEAC7T8OFxsMEOk9DhcZDBAdChAH/k4LCQEBDAcvPR6WBg0IDhAHDRsXAd9qrYprKg4xcYWgAWE7DRYZDBD6ORcgEA/+yAYdKBUOGkcqCQ4CAr79rBUAAA0Ab/+xA6oDRwAJABYAHgA6AEYAUgBeAGIAbwB8AIAAhACIAAATPgI3Fw4CBxMXEQc3FgYHJzY2NTU3BgYHFSM1NQU3FwYHDgIHBgYjNCYnJiYnNx4CMzI3NjY3JQYnDgIHJz4CNwUOAwcnPgM3BR4DBgYnLgInJRUhJwMUBgYjIxE1MRchFSElNxcGBgcRFAYGIyMRExUhNSUVITUlESMRghpddj4GHlhqOSAPMxkIGQwjEgpbAQ4OPgKxJEoKHQQUHRQSMhsHCQorFwEQLigJFwsSHAf+lA8iH1dcKgcoWVAaARcDEzRmVg1HUCcMAf7uMTsbAhEbEAMdJxMCI/6LCfEPGg4LSAIb/d8B8iVRBBcPExoLCiH9wwI9/cMBQkABrgklMRsPEDU/HwFbCf7nEhYfJQZKCQ4M+yYKCwIrOxECJz0LBFh/UBEPDw0ZBwcMBBIBBQIJEJZ+BA0OCBEOBRAMISQOSzlvaF0mECpdYmczYyFBOi4cAw4iTUocbB0d/MgDCwgBpSEhHh4pPwYKA/6fAwoJAaD+tx4eph0do/6nAVkACQBa/7QDvANFAAwAGAA4AEUAUQBVAGEAZQBpAAAXFAYGIyMRNTEXMxUjNwYjDgIHIz4CNwU3FwYGBw4DBwYGIzQmJyYmJzceAjMyNjc2NhI3ITcXBgYHERQGBiMjERceAwYGJy4CJyUVITc3BgYnBgYHJz4CNwMVITUBFSE1mA4XDgtD7PG1Bh8MHh8NGQYQEAUCYClPBhQRAwkRGRIUOyQIDAs5HwEXOTILEA8IFBcOA/4PJU8EGA8SGAwJuDxKJAUQHxIGJjQZAWb+wA15AxIRJWxCDiE8MxDI/ugBGP7oGAQLCALEICAethUYNzYVGUZKHrAtQwYIAorepGkWGRcQGwgJEAUSAgYEBggUpQEQsyg+BgsD/ZsECwkCp84aPTowHwUOI0tHG9UdHZIIDQFtwEEKMoKVTf44HR3+2h0dAAsALP/YA8EDRgALABYAIQAtAEoAUwBXAF0AYQBlAG8AAAEGJw4CByc+Ajc3MB4CFwYHBSclJzAeAhcGBwUnJSceAwYGJy4CJycGBgceAxcWNjc2NjcXBxYWBwYGJicuAycBNxcGBgcVIxEzFSE1JxcjESMRIREjESMRIxEFMBYWFwYjISchA1MNH3Ds+IYEf/TkZ0wUHiIOAxb8pwsC8B8UHiEOAhf9IwsCdME0QSIJDBsSCiYrFEYBDhAELV2YbxUSBQkXCA0KGwsDBSg6I32tazIFAZghRQMRCkEh/ZctTA0/AeQ+lz4CEhkjDQMW/JAJAyEB4A0MQE0nChMTN1tIZQ0TFQoSAlocT7oNFBcKEAI/HTWBAhUfIBgKCBImIgwJCQ4CT5F8WxcEAgsPOBoCcBAQCxEKCAcdaZGyZv2yIzYECQLwARIdHSEh/u4BEv7yAQ7+8gEOzBYfDxAdAAAJABf/sAPCA0QACgAWACUAMAA8AEQATgBbAGUAAAEGBgcRFAYGIyMRFx4DBgYnLgInEwYGJw4DByc+AzcDBgYjBgYHJzY2NwceAwYGJy4CJxMUBgYjIxE3BwYGByc+AjczNwYiJw4CByc+AjcXMBYWFwYjISchAvUCEBMQGQ0KiTxIIgMRIBICJTMZsQQSFC9ug59gBlaReGMo8QMRERdKMQ8gMgvrMTobAg8bEAMeJhQUDhcQCj8LH3VWDitFMhBGuwcaES15hD8FO35yJAQbJw4DF/55CAEtAzoKDwL99gUOCwJNqSVPRzkiBRErXlkh/scIBgJgimA/FhMcSmaSZAEBCQ1cpjoHRb1h4Rk0MygZAwwdQT0W/hIDCwgDLxr4eNBTDjiHlErqBwYPHhoIERAsMhX0FyEPEB4ADQAS/68D0gNIAAsADwAbACkALQA5AEYAUgBcAGYAbgB6AIcAAAEjNxcGBwYGByc2NichFSEHHgMGBicuAicBIzcXBgYHDgIHJzYkJyEVIQceAwYGJy4CJxMXBgYnDgIHJz4CExcGJw4CByc+AiUhNzAWFhcGIyE3MxUGBgcnPgITNxEUBgYjIxMeAwYGJy4CJxMXBgYnDgIHJz4CA0MLLEUJIULwsAia4LgBBf7oJzM/IQcNGhEHIywVAVcKK0YFEhIxm+OdB9QBCrQBCP7lMTVBIQYOGxAHJC0VS18EDxIdWGk4Ci5YSVRWBxwibYVKCUB3Yf2MAQksGiYPAxf+no9HHnRXDitEMhpADhgQCj8yPB4DDxsPBh8oE01UBxkSKGt4OQY1cGMC0Sc/CwF5tS8QOMB5HTEIHyQhGAcKFiwpDf7YKEIHBAJmmWQZETHFnB02DSYoIxkFCxczLxACUR4HBwMtXlEdDSBcaP7AKw0HNWlbHw8mZ3V5ORcgDxAdEHjUUw45iJYBExn8zQIMCAHiESsqJBcDCxg2MhEBsEMHAQYQIBsIDxAwNAAOACb/tQPAA0kACgAUAB8AKgA1AEEAVABeAGUAaQBtAIoAjgCbAAABMB4CFwYjITUzJTAWFhcGIyE1MwUeAg4CJyYmJzcGBicGBgcnNjY3BR4CDgInJiYnNwYGJwYGByc+AjcTIzcOAgczByc2NjcHPgM3BQYGByc+AjczExQGIyMRMwEVITclFSE3BTcXBgYHBgYHBgYjNiYnJiYnNx4CMzI2NzY2NwMVISchNxcGBgcVFAYGIyM1A2wRGx0LBBX+mf/+fhojDgQV/srbAQ0sNBYBERwPAykYHAMSEB9VLw4hPxT+vCwzFAIRGw4CKRcuBBMQKHA9DSA/NxM5GggEDhIGCSBHCyENGAUMDQsDAU9N9pMKVJZ9LE0LHhkLQgFE/VcIAm39rggCUSVKBRMPCCMdETAcAQcKCiwaARIwKwkMDwYOGwYN/V4JAnsjTQQVDRMYDAoDCw4VGAwQHjMVHw4QHg0MISUhFAIMH0IVaggLAUV4KAswkUyFDycmIRQBDCBIF2sICgFWjC4LJGN0Pf48BhdERRghNwcNAiMSNDs5FcxgkS4SIVpqOP7bBBECZf7VHh6WHR2WJTwGBgJTaRQMDQ4YBwcNAxEBBAMDBQxhTAErHR0mOgULAq4DCgjpAAwAKv+xA70DRwALABYAIQArADIASwBWAGAAagB1AIAAiwAAJR4DBgYnLgInAyE3MB4CFwYjIQchNzAeAhcGIyEnITcwFhYXBiMhARcGBgcVIxcXBgYHERQGBgcmJicmJic1MB4CMzI2NQEXBgYnBgYHJzY2FzM3MBYWFwYjISUhNzAWFhcGIyElHgIOAic0JiclFwYGJwYGByc2NhceAg4CJyYmJwEMOUUjBg4eEgYlMBlwAmEsEBgdCwQW/UVLAtosERocDAMX/MosAxEuHSYQAxf8kQGfXQEND0CtZAIPEQ8xNAMMDA0yKSg5MQkQCv5OXAQSECdrOw0vWALXKBokDQMV/s4BbAEVLhwnEAQW/oT+2yguEgMRGw0jFQFPXQQSECJdMQ4mSVwuNxgBERsQAy0bwxItMCobBgwcPjgTAU01DRQXChD5Nw0UGAsQqDgWHw8QAQgLCAwD3RALCg0C/t4bKBoFDxkICQwFDwMDAwoMAzAlCAoBS3YlCy6QIDQVHg4PHDkXIA8PEhEpJyITAg0iSheFJAgLAkFrJQwshTEPKCkjFwMMJE0YAAAOACH/uwPDA0AAFwAvADsARQBOAFYAYQBuAHoAhQCOAJgAowCuAAABBgYnNw4DByczBgYHJzA2Nz4DNzcGBic3DgMHJzMGBgcnMDY3PgM3Az4CNxcGBgcGBgcDPgI3Fw4CBwMWFjY3FQYGBwEGBgcVIzU1FxcRMwcnNjY3BxEFBgYnDgIHJz4CNwMeAwYGJy4CJxMGBgcRFAYGIyMREwYGByc2NjczNzAWFhcGIyEnIRMwHgIXBiMhNSEBHgIGBic0JiYnAX0EHhcbFD1KTiYCKQMUDSoWBR1DPjIOBQQdGBwPLTU3GwIoBBcOIxMEFCsoHwmeHmV9PwUugVUBDAcWGVluOgIaU2M0JBVGViscbjoBqAEREj4vDwcZSAgbChECBwESDwwlLRYNDR0YBmw8SiYJDRwRCC05GTQCDhMPFQsNHRxpSww5TRZAkBslDwQW/nYIATJSERsdDAMW/g0Bif7ILy8MDhsQFB0PAlkJCQoIJFdcVSELICcFWAUFHVhlXyWLCQwKCB5JS0UbDCInBVkGBBZJU08d/QoGHCQUDRtHKAkOAgEsAgoOBw8JHCEQATcBAQIBEAkeDQFLCg4DJjsRIwj85CQxCBEEIAMaQwYMARhBRh8GI1lVG/6eJEc/MB8FDSVVUR4BrwsOA/0oBAsJAxb+hGezRw5KuGE4FyAPEB7+cQ0WGQwQHgLdK04/JwkQIE1KHAAADQAl/68DxwNGABAAHAApADYAPQBHAFIAXQB1AIwAlwCgAKkAAAEGBicOBAcnPgQ3Fx4DBgYnLgInBxQGBiMjETUxFyEVISU3FwYGBxUUBgYjIxEDBgYHESMRFzAWFhcGIyEnIRcwHgIXBiMhJyETMB4CFwYjISchBQYGJzcOAwcnMwYGBycwNjc+AzcnBgYnNw4CByczBgYHJzA2Nz4DNwM+AjcXBgYHBgcDPgI3FwYGBwMyNjY3FwYGBwLAAxERBRAlS3xfCVJtQCEMAj1Oaj8cAhgUFlJeKL0QGA4KRQFo/pMBQyNNBBUNExkLCmUBERNA5RokDgMW/iYIAYRmDxkbCwMW/awIAfsMEBgcDAQX/ewIAbz+XQQeFxwVQE5SKAInBBgNJBgEIEZCNQ8BBB0YGxRDSyUCJwQXDiITBRUsKSAJoh5nfkAFLoJWBg8kG1tzPAIpkFEiFklZLQEdcD4BJwkMATFWTD83FxUZOUJPXjfRDyouKyAOBx1COxMXAwsIAU4fHx4eJjsFCgL2BAkIATEBtwoOA/7EAWKqFR4OEB5EDBQXCxAeAR0NFBcLEB50CgcLByRaXVghCyEmBVgGBB5bZ2IlfggLCQgmYV0jDCEmBVgFBBZFUEsd/QIHHSYVDRtKKxMGATUCDREJDhA2GgFBAwUDDwomEgAADgAq/7ADyANGAAoAEwAaACQALgAyADYAOgBHAF8AdgCBAIoAkwAAAQYGJwYAByc2ADcBFyMRFAYjIxETBgYHESMRFzAWFhcGIyEnIRcwFhYXBiMhJyEDFSE1ARUhNQUVITUlNxcGBgcRDgIjIxEBBgYnNw4DByczBgYHJzA2Nz4DNycGBic3DgIHJzMGBgcnMDY3PgM3Az4CNxcGBgcGBwM+AjcXBgYHAzI2NjcXBgYHA6YEEhNm/t6xC6EBEF/+lUsMHRgKtAEPET+fGSMNBBX+pwgBCdUZIw4EFv3ICAHpEP66AUP+vgFC/r4BFyRQBBgPARIYCgr+hgUeFhsWRlRZKwInBBgOIxcGIk1JOxEGBB0YHBZKVScCJwQYDSMVBBcyLyYKtSBpgkIEMIdZBhAhHF94PgEqlVYjF05fMAIgeUIC1ggFA7T+9l4QaAEdwf55If5oBREBrgHeCg0C/sABY2YVHg4QHoUVHQ4QHv4RHR0BVx4epB4epCg+BgoD/pYDCAcBpQEKCQcLByRaX1kiCyEmBVkFBR5caGMlegkKCQclYV4iCyAnBVgGAxdFUEsd/QIGGiQUDhtFKRQFATgCDBAIDw80GgFAAwUDDwomEQAADgAd/68DwwNDAA4AGgAmADMAQQBMAFAAVwBiAHoAkQCcAKUArgAAATcXBgYHDgIHJz4CNwUeAwYGJy4CJzceAwYGJy4CJxMeAwYGJy4DJxMGBiMOAwcnPgInFzAeAhcGIyEnIRMVIScBBgYHESMRFzAeAhcGIyEnIQUGBic3DgMHJzMGBgcnMDY3PgM3JwYGJzcOAgcnMwYGBycwNjc+AzcDPgI3FwYGBwYHAz4CNxcGBgcDMjY2NxcGBgcDTilMBhEPCyElEQ0IEA8E/icxPyIJChcQCScvFVEwPiEJCRcQCSYuFdxRbEAbBRkWEDdDRR5nAg8VBy9dmHEIhZhAAd8RGx4MBBb9sAgB7UT9+QkBTQEREkDlERsdCwMW/iAIAX/+fgUeFxsVQU9UKAImBBcOIxcFIEdDOA8KBBwYGhM/SSIDKAQYDiMVBBMqJh8IqR5nfkEDL4NXBhESGl1yPAIpjlIhFkpZLgEecj4CKCpJBQMCEispEAcVODgTywYaIR8WBwcTKCYLdwUXHx0XCAcSJyEM/sMSLzMuIQwIGDM0LBABWggIaqmCXh8PLpLVkt4NFxgMEB0BXB4eARAKDQP+9gEvWA0WGAwQHlYJCAsHJV1jWyQLICYGWQYEIF9rZiaICQsJCClpZiYMISUFVwUFGEtWUR/9AgQUHA8OFj8kEwUBIwINEAgPDzQaAUYCBAIPCiURAAAGAGz/sgOoAzAADAAbACgANwBSAF8AAAEeAwYGJy4DJyUGBiMOAwcnPgM3BR4DBgYnLgMnJQYGBw4DByc+AzclNxcGBgcRFAYGByYmJyYmJzUwHgIzMjY1EQEUBgYjIxE1MRchFSECBEddNhQGGBEMIzBDKwEpAxAVEDJHYT8NM1A9KAv+J0ljOhoDFhIPKDZHLQEwAxAVDiw/WDkNLkU1IgkBnyJUBRcQDzI0BAwMDjIrKTgzCRIN/XAOFw8MRgKs/U4CbEuMeV48EREueoSANTgKCUWdoZY8CkGdp6dJRkB6a1U3EQ4qbHZwLjkKCQFBlZuQPAo/maKfRVUpQAULA/00GScaBQ8WBwgOBQ8DBAMNDQLv/MUFCwkDVCEhHgAMACv/2APCAzkADgAaACYAKgAuADIAPABAAEQAUQBeAGIAABMXITcXBgYHESMRIREjEQEwHgIXBgYjISchAQYHDgIHIz4CNwEVITUlFSE1JRUhNQEwFhYXBiMhJyEDFSM1IxUjNSE3FwYGBxUUBgYjIzUFFAYGIyM1NTEXIRUhBRUhNeBLAaIkWAUWEkP+R0ACiBIcHw0CDQv8jAkDDP77BSAIFRUKJwQLCgMBMf4LAfX+CwH1/gsCWR8pEQQX/KsJAvCoPZo9AagkUAQYDhMYCwr9txAZDQlGAmr9jwJu/XUByyEtQQcJAv5mAaL+XgHA/ocOFhkMCAgdAk0WAhc3NRQYQ0gd/hUeHmoeHmgdHQESFyEQEB4BAKWlpaUnPQYKA50DCgjbzgMKCOMgIB51Hh4AAAoAKf+vA7wDQAANAB0AKgA1AEIATwBTAFcAWwBmAAAlHgUGBicuAicxPgM3FwYGJzcOAwclDgQHJz4CNzM3MB4CFwYjISchJRQGBiMjETUxFyEVISU3FwYGBxUUBgYjIxEXFSE1AREjESMRIxElMB4CFwYjISchAQSMzY1YKgkQHxE9s96AGT0+NA5iBBccFA8vNzkYAaEdUG+UwHoErPWdJkqPERseDAMW/JIJAwr9nRAZDglHAk/9qgI0JVEFGA4TGQsKJv2HAb0/lj8B+BEcHw0EF/yeCQL8khIpKigiGhABCCNEPhoZTFNNGSEJCwQNFkBGRBuWR2tPOCMJERlRjG5ADhUaCxAdXAMKCAEQISEdHSg+BgoDxwMJCAEEux0dAT/+rgFS/q4BUjwOFxkMEB4ABgAj/68DzAMvAAwAHQAhAEAAUgBnAAATHgMGBicuAyc3NxcGBgcOAwcnPgM3MxUhJwEGBxUUFjMzMjI3Mjc2NjczFxYWFRQGBiMjIiYmNRETBgYHDgUHJz4ENScXITcXBgYHERQGIyMRIREUBiMjEVldekQaBx0WCjhNVSfwKEgFERAOME5zUg9CYkUrCyf+xQkC6gMaCRE5FB0FCwUFDgcNAw8IFzo3Rx4fCyQCEBEBBRQtVIRiDGmBRRsEtUkBISJKBRMPIRYK/s8cGAkCT06OeVw5DhI3f4J2MI0qQwcFAly+uaZEDEaswMdfHR3+QBQD7AoFAQsLSSmABg0IDRIJCxoVAR0BbAsOAlGVhHVnVyQSLm+FmbNmkSApOwUJAv4gAxEB/P4MAxECIgAJAC3/0gPDA0QAIQAlADIANgBAAE4AWABkAGgAAAE1FyMRFBYzMzI2NzY2NzY2NzMXFhYVFA4CIyMiJiY1ESEVITUBNxcGBgcRFAYGIyMRMxUhJwM+AjcXDgIHExcRBzcWBgYHJzY2NRE3NxcGBgc3FSM1Ax4DBgYnLgInExUjJwGxTAwVK5c1ShALCgQHEgoNAhMOEzVkUJwxNRQBnP6KAUQlVAUZEBMZCwoo/jEJzxRHWi4IEz1MKiIPOBsHCBEILBcMASFCBBYSCEAzO0kmCQ4cEwksNRdstAkB2gIh/mwQDAEBAgYHD04zlAYMCg0QCQQMIR4Bnh4eATgqQQYLA/6dAwoIAaMeHv09DC4+IAwUQU0pAiEJ/ikWGhciFgRRDA8OAbUjIzcGCwMJME8BDxY0NCwdBgsfREAY/vgeHgAACwAn/7MDygNCAAoAFQAZADcAQgBMAFYAZABuAHoAfgAAAR4CDgInJiYnAT4CNxcGBgcGBxMRBxEBBgYHBh4CFxY2NzY2NxcHFhYHBgYmJicuAgI1FzAeAhcGIyEnIQcwFhYXBiMhJzMBPgI3Fw4CBxMXEQc3FgYGByc2NjURNzcXBgYHNxUjNQMeAwYGJy4CJxMVIycDGS4zFwESHA8FKxX+HCB0k04EOZ1oBg62PgEuARASAgcfQTgLCgYJFQkMDxMHBwgdISAOQU4lDOYRGx0MBBf9iggCFvUZIQ4DFv7GCOv+ZBNDUysLETlHKCEPOBsHCBEIKxgMASFBBBYSBz47NkIhBQ4cEQglLRVxoAkDJw8nJiAUAwwfShj9GwYdKBUOGEQpEQYBpP7FEgFNAZ0KDwJ86smZLQsDDhQ+HwKXHB0ICgMMFQ03q94BCZauDhUYDBAdiRQeDhAe/pAMMT4hDBRCTykCKQn+IBUaFyMVBFANDw0BviEjNwYLAwkwTwEJGDUzKxsGDB5EPxf+/x4eAAAHACX/sAPIA0YACwAbADAAOwBHAFMAYQAAJR4DBgYnLgInEwYGIw4EByc+AzcnFzM3FwYGBxEUBiMjESMRFAYjIxEFMB4CFwYjITUhJwYGBwYGByc+AjcFDgMHJz4DNwceAxcHBgYHLgInASM4RCEFDx4RBSUuGD0CEhICBxc0XUoOTVQkCAGXRtkgRwUSEB8TCukaFwkDDhEbHgwDGP6FARKRAhIRGlc9EBwuIwkBKA8/baZ2CmWRXjYL7xI+YYxgAxchBnWRURXTFzU1LB0FDR9FPxcBoQgNZaqReWQpEDeGqNaJiR8nOQUJAv4TBA8CCP4ABBACLk4OFRkMEB3JCQ0BfuJQCD2ZqlbgeM+ujDUNO5GrxW0QZ7mdfSsJAxkXQ8L1jAAHAB7/sgPJA0UABgANABgAIwAvAEgAUwAAAQYGBxEjERMGBgcRIxEFMB4CFwYjISchFzAeAhcGIyEnIQUGIw4CByc+AjcXHgMzMjI2NjMVBgYHKgMjIi4CJyUwHgIXBiMhNTMCNgEPEUJkARESQgE/EhwfDAQW/U8IAkqCEh0fDQQX/JsJAv7+NQUhE0duUQpCWjkOEBxQa4xaFUJJQxgTEwISOD87E16PbVAeAgwSHR8NBBf+qecBvAoNAv5aAckBdAoOA/7EAWJXDhYZDBAdhg4WGQ0QHo0WSJiJMgs3l6NNiEpdMBEBAQ4DHRQYPnBadw4WGQwQHQAACgAk/7EDvgNJAAkAFgAgACoANAA7AFQAWwBmAHAAAAEGBgcRMCIjIxEHBgcOAgcnPgMnBTAWFhcGIyM1MzcwFhYXBiMhJyE3MBYWFwYjISchJwYGBxEjEQMeAzMyMjY2NxUGBgcqAyMiLgInBQYGIyMRMxcwHgIXBiMhJyETMBYWFwYjISchAXcCDhAdEBFBBCAFGTcwCxghEgcBAT8bJQ4DF7JUNxwnDwQW/j4IAWYKGyYPBBb+kwgBFAsBERI/cxpHYYJTI2t3ayQUFgIdX2tiIViFY0kcAmYBHRgLQYARGx0MBBb+VggBSQsdJw8DFv6UCAEOAbMKDAL+eQGqRBYDSJ+SNwwrb3p9OiAXIA8QHvwXIA8QHuUWHg8QHZsKDQP+twFu/bBOXTAPAQEBDwMdExc9cluqBBECvfkNFhkMEB4BahYfDxAdAAALAB7/sQPKA0YAAwAQABQANQBPAFYAYABqAHUAhACLAAABIRUhJSM3FwYGBxEUBgYjIychFSEnNTUXIxEUFjMzMjY3NjY3NjY3MxcWFhUUBgYjIyImJjUlHgMzOgI2NjcVBgYHKgMjIi4CJxMXBgYHESMnITcwFhYXBiMhByE3MBYWFwYjIRczNzAeAhcGIyMnFwYGBw4DByc+AzcXBgYHEScCGQFY/rEBFQolUAUXDxMYCwrwARr+5hxLDQ8dZyMzCgkIAwYPCQ0CEQseUVBwJykP/nIaRFx8UB1VYWFWHRQVAh9lcWcjVH9fRRp3YwEREUC0ATQqHCcPBBb+cjABcSwcJw8EFv4z/2crEBkcCwQWyLNkAhIQBBEhNikLHSYWCJZjAhATPgL/HBwoPQYLA/7dAwkIYR0dHwIh/sAMCAEBAQQHDEcqgQUNCQ8SCAwdGjtMXC0QAQEBDQQcFBc7cFkCXgoKDwP+xMs3FiAPEJw6FyAQELw6DhUZCxCOEAsMAjd3dWgoCyxvfH+ACwoPA/5VJQAACAA7/7EDtwNIAAMADAAQABwAIAAkADMATgAAARUhNScXIxEUBiMjEQEVIScBBgYjDgIHIzY2NwEVITUlFSE1BQYGJw4DByc+AzcnNxcGBgcRFAYGByYmJyYmJzUwHgIzMjY1EQLT/joaTg0eGQoB2v2ACQHzAxMQCRkZCiYIFwcBDP4sAdL+LQK0BxISO6vW/ZAIh/TRpTi8I1UFGA8OMDIDCwwNLSglNC0JEAsCyB0dIiL+SAEHAcD+VB4eAhcLCw4iIg4bUh7+Yx4ekR0deAcDB1GciW4kECt7laZXxytBBgsC/XEaJxkFDxcHCA4EDwMDAwsMArMAAAwAJP+xA8kDRQAGABAAHAAmADAARgBNAFwAaACFAI8AmgAABRQGIyMRMzcGBgcVMCIjIzUDPgI3FwYGBwYGBwEwFhYXBiMhJyE3MBYWFwYjISchJwYGJzcOAwczByc2NjcHPgM3EwYGBxUjEQEGBicOAwcnPgM3Ax4DBgYnLgInJwYGBwYeAhcWNjc2NjcXBxYWBwYmJicuAgI1BzAWFhcGIyEnIQUwHgIXBiMhJyEBZxwXCj0jAg8SGREP+SyeyWoDT92XAw4HAYkaJA8EFv57CAEwJhomDwMW/isIAXxpBBcVDgkgJiYPCBw7Ch8LHQ4mJyIKewEREz0CqAQRFBhNbpJfClSEZEQTcjZEIwoLGhEKKjEWFwMQEgENKlRFDQsGCRYIDQ8WCAYKJzAWTmAyEosbJQ4EFv5ZCAFSAcQRGx0NBBb8hwkDGDwDEAFWagoOA1+F/vIEEBcNERQ1IAkLAgEqFR4OEB7UFR4PEB5QCAsFEBhGT0gaGzMGDQIdGUtTTRsBGwoOA+sBEf54CAgBSpKHcCcOLHmPm08BUw0lJyMYCAgWNDARAwkNAn/uzZorCQIPE0AfApQZGAgPARcPM6niARCaRBYeEBAeTA4WGQwQHgAABwAc/7cDxAM1AAkAEgAeACkATgBaAGUAAAEGBgcnPgI3MwcGBxEGBiMjERceAwYGJy4CJxMwHgIXBiMhJyEBMhYXHgIzMjY3FQYGByoCIyImJicmBgcOAgcWByc+AwMeAwYGJy4CJxMHESMnMzcXBgYHAtk/45kMVpRxI0kyBCMBGhwKgkxjNRILHxQPQU8jpxEcHgwEFv2pCAHy/bANDQktbItdVJdXFxoCLl5hNl+HZy8KDgkLKi4RBQs7GDs5LW06RyMHDx0SCCkyFpk9jAaEJlYFFxUC4Y7wUg46l6tW0A4G/lIEEAHuNBs9PTMjCAwkUkwcATMOFhkMEB39nQYJMDMSAQQNBR0WG0M8CgEJDzU7GA4KTREvLR8CpR0+OC4eBA0gTEgb/VcfAXMdM0cFCwMAAAcAIf+6A8gDQgAOABoAJAAvAFMAXwBqAAABHgQGBicuBCcTHgMGBicuAicFDgIHJz4CNzcwHgIXBiMhJyEBMhYXHgIzMjY3FQYGByoCIyImJicmBw4CBxYHJz4DAx4DBgYnLgInEwcRIyczNxcGBgcBnXChbEAZBBsUFUpcZWQshjVAHwQQHREEICsWASEbdMORCH6rYxSFEBseCwQW/bUIAer9qAwOCC5sjF5Vl1cXGgIuXmI3X4hnLxEQCiosEAULOxc6OCxyPEomCA4dEgosNRiePY0GhCZWBBgUAgQ5aV1LOCMICyRVWldOHwFJEi4uKBoFDBw7NxPHhtGcNQ87n8d4Qg0UGgsQHv4TBQkwMxEBBA0EHhYbQjwTFA80OhgNCkwQLy0eAqUdPTkuHQYNIUtIHP1XHwFzHTNHBQsDAAALAB7/uwPHAz0AGgAmADUAOQBAAEQASABVAHsAhwCSAAABNxcGBgcRFAYGByYmJyYmJzUwHgIzMjY1ESUeAwYGJicmJiclNxcGBgcOAgcnPgI3MxUhJwEUBiMjETMTFSE1JRUhNRMUBgYjIxE1MRchFSEDMhYXHgIzMjY3FQYGByoCIyImJicmBgcOAgcWBgcnPgMDHgMGBicuAicTBxEjJzM3FwYGBwMtIVMEGBALJikBBwgIIBkWIB0GDAj+lUxjOhYDExwNGmVHAUYsSQYTEBlJTyELGTw4ECT+LQkBLBwXCTy9/kMBvf5DIA4YDgpEAZn+YdQNDQgvbYxeVphZFxoDLl9jN2CIaDAKDggLJysQAwMGOxg3NytuOUUjBg8dEggnMRWcPYcGfyZVBRcUAkooPwULAv5uGSQWBQ4XBwcLAxACAgIJCgG1hQoeICAZDwILHT0YVilGBgMBEiklDQkTMTQTHR39UgMPAfb+3h4ekB4e/pwDCgkCDCAgHf5kBgkwMhIBBQ4EHRYcQjoLAgkPNTkYBgwFSxEuLR8CpB0+OS0dBQ0gTEgb/VUcAW4dM0cFCgQAAAwAKf+4A80DRQAMABkAMgA9AEcAVABYAFwAaACNAJkApAAAAQYGJw4CByc+AjcHHgMUBicuAycTBgYHERQGBgcmJicmJic1MB4CMzI2NREBPgI3FwYGBwYHATAWFhcGIyEnISc3FwYGBxUUBgYjIxEXFSEnJRUhJxMeAwYGJy4CJwMyFhceAjMyNjcVBgYHKgIjIiYmJyYGBw4CBxYHJz4DAx4DBgYnLgInEwcRIyczNxcGBgcDbAQQDhY/RBwKGDY0Eb1WdkggGhYTP0tNIkMCEBMMJyoBCAkJIhwZJCAGDQj+2hthfUAGLH1TAg4CQBghDgQV/WEIAlJfJE4EFw8SGAsJH/4pCQHg/i8JCzRBIQgNGxEJJi0UdwwOCC5tjF1VmlkXGQIvYGQ3X4hnLwoPBwskJw4GDDoVNTQodTZCIQQPHhEGJS0UpD6FBXwmVgUXFAF4BQMEDiclDwsVOTkVkQ4sMi4jDwgYNDIrDgImCg4D/WQZJRUFDRYGBwsDEAEDAggLAr/9WQoqOB4NHlc0EwgCOxUdDhAeeSc9BgoD8gMKCQEx9h0d9h4e/s0LIiYhFwYJFC8tEP7nBQguMRECBA0FHBUaQDgKAggQMTcXDApJDy0rHQKwHT05LRwEDSBKRxv9Sx0BcR00SAULAwAJACj/0wPAA0cACwAWACEALwAzADcAOwBIAFUAABMhNzAeAhcGBiMhEyE3MB4CFwYjIQchNzAeAhcGIyEBFwYnDgMHJz4DBzMRIwEhFSE1IRUhJSM3FwYGBxEUBgYjIwE1MRchFSERFAYGIyM5AvIvERweDQEPC/yrNAKFLhEbHQwEF/0cVwMLMhIdHw0DGPyMAtRDDyRAn62zVgRUta+Z/UJC/vwCRf27Akn9twInCSNTBRcPExoLCv27SAId/d0QGQ8KAoQ6DhUZDAcI/hc3DRUYCw9yPw4YGgsQA3RDDhEKFA8KARQGFhofQ/zzARodoh2eKT8FCwP+9gIJCAFGISEc/uQDCwkAAAcAHv/QA8kDTQAJABQAHwAjAC8AOwBYAAATITcwFhYXBiMhByE3MB4CFwYjIQMhNzAeAhcGIyEBMxEjAx4CDgInLgInJRcGBicGBgcnPgIDDgMHJz4DNxcGBgceAxcHDgIHLgL3AWssHScRBBb+NpcCljESGx8NBBb9AjcC6TITHSENBBf8qgGMQ0PpMjsZARMeEAIZJBIB62IEEg8iUCQPECQkrCRqgYxGBz+FeFsVdwITEyJecX1CAg4aEgNRl3gB9zYWHw4QoDwOFhkMEP7QQQ8XGw0QAhz98QEYHj45LhoCDyFJRRsLKAgKAjJhIgkcS1QCQDVtaFkgDiRneHo0HAkIAi5UTEAaDwMQFw0pboQAABMAIP+yA84DTgARABgAJwA+AEIARgBRAFsAZQByAH0AgQCFAI8AmQCnALEAuwDJAAABDgMHMwcnNjY3Bz4DNyM3FwYGJycTNxcGBw4DByc+AjcHHgMzMjI2MxUGBgcqAiMiLgInExUjJxMVIzcFMBYWFwYGIyEnIRMwFhYXBiMhJyEHMBYWFwYjISczEzcXBgYHERQGBiMjEScGBgcRFAYGIyMRExUhJwEVISclMBYWFwYjIzczAz4CNxcOAgcTFxEHNxYWBgcnNjY1ERcwFhYXBiMhJzM3MBYWFwYjIyczAw4CByc+AzcXBgYB/QgaHx8MBxs7CRwLGAwfHxsIDCNJCjIaCgQkQwkcCB46YksJVlsnBWwcT26PXBQ6PxUREwIOMjIRX5VuTxuCggmffAwB2xkiDgINC/6MCAEkXhMbCgQV/lcIAXMuGCENBBb+yAjuCB9DBBIMEBYKCDECDxIOFgsMpP7+CQEK/vkJ/uMZIg4DF8AQWloSO0kmCQ4zPiIUDS0SDQEKBj8WDHoXHwwDFv7vCMoXGSEMAxXXCIwVDzM8IQ8RIR8YBmIBEALKHE9XUh4ZLwYMAhwbU1xVHiRBCgYCK/7RJj0LAkiKe2koDzqcuGVtYn5FHAEOAxwUIVOUcgGjHh7+0R0dtRYfDwgIHgHHFR0NEB3gFR4OEB0BmyE1BQkB/uwDCggBTFYKDgP9GQQLCAMk/o4eHgERHh4TExwPEB79VgooNBsMEDpFIwIsCP4dFRsRIRgGPREQDAHLiBMcDRAd7xQcDhAdAQkyd3QsCCJfaGMmHAgMAAYANv+uA8ADPgANABwAJwAyADsASQAAAR4DFwcGBgcuAicBBgYnDgMHJz4DNxMwHgIXBiMhJyEBBgYHFSoCIzU1Az4CNxcGBgcTFxEHNxYGBgcnNjY1EQHjG159lVICFiIIaKl6IgFiBhEPKnGEjUYKQIR+ayV4EhwfDgQX/KQJAvT+OgESFgIMGxoTHmuFSAUxpGIiED0dCgYSCDUaDgGmToFnSxgLAxsYKoGycwFBBwIHIUdHQBkOH01VVSX+zg4XGwwQHgGDCAwCUTs7/MMHICsXDhpYLwMzCf0jGh8ZKBkFWA8REAK4AAkAJf+tA8UDMgAQABwAKQA2AEAASgBVAGAAbgAAAQYGBw4EByc+BDUTHgMGBicuAicnFAYGIyMRNTEXIRUhJTcXBgYHERQGBiMjEScOAgcjPgI3NzAWFhcGIyEnISUGBgcRFAYGIyMRBwYGBxEUBgYjIxEnBgYHERQGBgcnNjY1EQL/Ag4RAQccQ3lhDFVoOBYDTUNWLw4LHRMNOUIfrQ4WDQpAATT+xwEQIkoEFA0SGAoKTA0fIRAXBQsKA8obKA8DF/4rCAF3/ocCDxIOFQsLKgEOEg0UCwsnAg4TEy8sES0aAfoKDgJTj3plUx8RIlVnfZNY/o8YOjcuIAgLIEtHGgYDCggB0h8fHR0mOgUJA/58AwoIAb6rHkdBFhdCSBs5FyAPEB4qCg4D/OYEDAgDVzsJDgP9bwQKBwLKJQoPAv5vVqGRPQtc3oABtgALACP/swPKA0cADAAYACgAOAA8AEoAWQBdAGcAdQB9AAABBicOAyMnPgI3AR4CFwcGBgcmAic3NxcGBgcOAwcnPgI3JTUXIxUUDgIHJz4CNTUFFSE1AwYGIw4CByc+AzcXNxcGBgcOAgcjPgI3MxUjNxM+AjcXDgIHExcRBzcWBgYHJzY2NRE3BgYHFSM1NQOfDRYua2xiJwM0foc9/u8UZJpoAhchBY+mHPQqSgYRERRBZ5hrCnyfWhP+i0sMCyZOQhBAPhQBmv6S8QMPFBAyQCQQEyMeFwixKEoFEw4NIygVEQ0YEwUo+g0FE0VWLAoSPEkoIQ82GgYIEggoFgtiARASPwL3CgsKEAwGEQkeJhX+yY3NiCYMBh4XRQEg4wsqQwgEAlunkXUqDz2y3X7dGCLkQ5eakj0LVL3FYeXTHh4BJAgHPo+HNAgoaHJyMqkpRAUDAhU5NxMYR0cXHR39cAwwPSEMFEFOKQH5Cf5GDxkXIRUEUgsNDgGSKQoNAyc7EQAACgA3/7ADtwNRAAsADwAcACkALQA6AEcAVABvAHoAAAEeAwYGJy4CJwEVITUlNxcGBgcVFAYGIyM1BxQGBiMjNTUxFyEVISUVITUlNxcGBgcVFAYGIyM1BRQGBiMjNTUxFyEVIQMUBgYjIxE1MRchFSElNxcGBgcRFAYGByYmJyYmJzUwHgIzMjY1ERMwHgIXBiMhJyEBkDVCIQcOHBIHIy0WAQL+2AEAIkwEFQ4SGAsJ5xAYDQlCAQz+8AFF/mQBbiRSBRgOExkLCv6rERgNCkUBc/6IkQ8YDgtIApT9ZAJ2IVUEGA8OKy0CCQoLJyEeKiYIDQobEx4gDgQX/KQJAu4DUQcdJSMZBgkWLigN/RweHpMlOQULAqQDCwjg2QMJB+wfHx34HR2SKD4FCwOZAwkI1sgCCgndICAd/YEDCwgBsSEhHR0pQAULAv7RGSYYBA8YBwcNBA4CAgIJCwFRAasPFxsMEB4ACgAu/9gDvQNJAAoAGQAoACwANgBDAEcASwBPAFMAACUwHgIXBiMhJyEDNxcGBgcOAgcjPgI3JwYGJw4DByc+AzcTESMRAxQGBiMjETcXIyE3FwYGBxEUBgYjIxETFSE1JRUhNSUVITUlFSE3A10THiEOAxf8lggC9bYsTQYTEBlCSSITGzoyDssEERIYR1hkNA0sVEw+Fc1A3w4YEAsTOgwB9yVRBRcPExkMCSX9ugJF/bsCRf26AcD+kRU4DxkcDBAdAt8qRQYDARc7NxQZSUcZRwcDBTFta18jDCZmdHo4/tv+bwGR/jECDAkB3yAZKT8GCgP+bgQKCQHS/n8eHsIeHr8eHrAeHgARABz/sAPNA0sACwAWACwAQQBFAFAAWwBnAHIAfgCHAIsAmgCeAKIApgCqAAAlHgMGBicuAicHBgYnBgYHJzY2NxcUBgYHJiYnJiYnNTAeAjMyNjURMycXMzcXBgYHFRQGIyMRIxUUBiMjEQUVITUTHgIOAicmJicFMB4CFwYjISchAT4CNxcGBgcGBgcBNxcGBxEGBiMjEScGBicGBgcnPgI3AxQGIyMRNxcjFxEjETc3FwYGBw4CByM+AjczFSM3ExUhNSUVITUlFSE1AxY5RSIGDxwRBiczF4cEEg8hXTQOKU0Xsg0mJwEHBwohGxgiHgYMCD3YSOwgRgQQDyAWCvocGAkBWv7GUS42FQIUHhEBJxcBEBEaHQsEFv4UCAGP/NkkhKlZA0K0egQMBwEkH0AMGgEdEQtcAxIQJWU6Dx45MhEbGhYJETQMiDdOJ0cGEw8PKywTEg4dHAkWuw/n/ugBGv7nARX+6/EkR0AyHgQOJVVRHxAICgJKeSgLMJBQ7RgnGQUOGAgICwMPAgICCAoBTvsgJjcFCQLxAxABCPwFDgEs1R0dAegNJygjFgINIkkYYA0VGQsQHv2BBRghEQ8ZQCYJDQICYyM4DQX+nQMPAZzwCAwBXqQ3CStxg0P9WQMRAaccFwH+nAFknCdDBQIBETEwEhg/PhMdHf4RHR2vHR2lHR0AEgB//64DxQNHAAgAFgAeACgANgA+AFsAZwBzAH4AigCWAKMArQC3ALsAvwDDAAAlPgI3FwYGBxMXEQc3FgYGByc2NjURNwYGBxUjNTUBPgI3Fw4CBxMXEQc3FgYGByc2NjURNwYGBxUjNTUFBgYHFB4CFxY2NzY2NxcHFhYHBgYmJy4DJwMGJw4CByc+AjcTHgMGBicuAic3HgIGBicuAicFHgMGBicuAic3HgMGBicuAicBNxcGBgcRFAYGIyMRBQYHEQ4CIyMRFzAWFhcGIyE1MyEVISclFSEnARUhNQGvG191PgMpklQgDjMXCAUOBy8WC1kBDg48/swYT2MzBRZGVi4eDTIXCAUOBy8VC1oBDg88ApcBDw4EEykjCAgEBw8FDAoOCwUFHiURNDobCQH1DiEdU1koBiZUTBiTMj0fCAwYDwclLRQROUAYBxkSCCMqFP7XLzsdBwwWDwciKhQQLjsfBwsWDwgjKhMB7iVQBRcPEhkLCv4SBh8BDBgSCPgcJQ4EFf7qtwGy/v4JAQz+6QkBEv2ZCAUSGg4QETwdAZwJ/qUUGRQhFQRHDQ8LAT8kCA0CKzwR/mAFFx0PDwwlLBUBpgn+nRUYEyAWBUgMDwwBSCUIDQIrOxEGCg0CMHFqUxIDAggMKBEDWgwaCQ4GCQgYY4OSRgF0DQwJFxQHEA4kJg/9oAwhIyEVBQkVLSkOjwsmJx4KChIpJQ2CCR4hHRUFCBMpJQySBxgdHBMGCBAkIAoBoCg+BgoD/uMECggBXBMNBP7WAgoIAXRpFR8PEB4eHoweHv7mHR0AAQLkAdwDfQMXABEAAAEGBgcXPgI1NCYjIgYVFBYWA0wCLTkQNDwZJyMfIhwqAocgUSAaGkpUJCo1JRgaHxMAAAICggIQA5YDJAAPABsAAAEiJiY1NDY2MzIWFhUUBgYnMjY1NCYjIgYVFBYDDCVAJSVAJSY/JSU/Jiw9PSwrPj4CECU/JyY+JSU+Jic/JSE/Kyo+PiorPwABAE7/PQDjAHYAEQAAFwYGBxc+AjU0JiMiBhUUFhayAyo3DzI6GiQjHSIZJxYiUx8ZGk1VIygyJBgYHhIAAAIBaADvAoECCAAPABsAAAE0NjYzMhYWFRQGBiMiJiY3FBYzMjY1NCYjIgYBaCdAJic/JiY/JyZAJyI+LSw+PiwtPgF8Jz8mJj8nJkAnJ0AmLD8/LCw+PgABAZEBCAIyAiAAEwAAASc2NjcXJiY1NDYzMhYXFhYVFAYBng00OAgLNCYgHBAYDAYGUAEIHBw6NSIZKRcYIggLEBcTTWEAAgAy//EB9QLNAA8AIwAABSImJjU0NjYzMhYWFRQGBicyPgI1NC4CIyIOAhUUHgIBFDtnQEBnOzpmQUFmOhozKBgYKDMaGzMpFxcpMw9LoIGDoktLooOBoEsfIkyBXmGBTSMiToFhXoFMIgAAAgBVAAAB4gLJAAUAEgAAMzU3MxcVIzY1EQc1NxcHERQWF1WnSJ7vA5LaDgQCAhwODhxzcwGlGB83C57+xjl0OQAAAQA2AAAB9gLNACkAADM1NjY3PgI1NCYjIgYHNwcGBiMiJic+AjMyFhUUBgYHDgIHNxchFTYzXiQzQyFLQxs2ISkbBxgSDhYECD9cM2RnKlxOEDZBIQkBAZA2NmooOV5XLEhPEBMeYR4WEA8yRSJiVC1ZakkQNUEiIRFGAAEAMf/xAe8CzQA6AAAFIiYnNjYzMhYXFycWFjMyNjU0JiMjNTMyNjU0JiMiBzcHBgYjIiYnPgIzMhYVFAYGBzUeAhUUBgYBAVVtDgUWDxMVBxglGjQgVFlaWi4pSF5HQjM7KBcFFxMNFQQHOlUvYGotW0VOZDE9ag9JRhAPGBxbHg4QW01QViJSTkJNHRlVGBQLDTE+HGBMLU00CQwEMVE3PFoyAAABAB//7gITAsgAEAAABTU1ESM3Bwc3FSEVITUBMxEBTwsbk5EKAc7+DAFFOBLYEAGtC9zbJA47LwHn/SYAAAEAKv/xAfQCvwAnAAAXIiYnNjYzMhYXFycWFjMyNjU0JiMiBycTIRUhNwMnNjYzMhYVFAYG81FrDQUWDhMUBxwhGTEiVl5cS0Q1GBYBZv6qFBUfKEwqbIA/cw9KRQ4PFhtcHQ8OY1deVhgJAVBHLv7RChURbWhEZTgAAQAw//EB9QLNACQAAAUiJjU0PgI3Fw4CFRQWFjMyNjU0JiMiBgcnMzYzMhYVFAYGARhuejtwnmMGc5xOJUMtOU5JPypNJxIHTXhbZTpkD5uFU5Z5TwsWGHqrZVhzOmNgVVskLQxwd2FDZzsAAQA2AAAB7QK/AAkAADMnARUnITUhFQGWCAE9B/5yAbf++AcCjSkNRy79bwABADX/8QHyAs0AOgAABSImNTQ2NzUXBgYVFBYzMjY1NCYmJyYmNTQ2NjMyFhYVFAYHFSc2NjU0JiYjIgYGFRQWFhcWFhUUBgYBDWhwYVwWSUFQRURPIk9FWE42XDk9VC1LYhREORw3KSE7JR1EPmdaOmYPXEtCXiYHECpUOj5PTDojPTsdJmdANlAsKkgwMWEnBQ4rTzcjPCMfOCYhPDgbLGdHN1ItAAABACr/8AHwAs0AJgAAFyc+AjU0JiYjIgYGFRQWMzI2NxcjBgYjIiYmNTQ2NjMyFhUUBgZfB2+PRSRAKidAJ1dEK0ghEAUdXUE9YDc9aD9rd1yzEBoneKNmWW81K1Q9VV8lIwcwNzJfQkVkOJOIa7OCAAAA"};
const manifest={"fps":16,"contactFrame":4,"clips":{"idle-left":[{"rect":[1,1,95,73],"offset":[-50,-72.92],"net":[-31.71,-31.2]}],"run-left":[{"rect":[98,1,93,68],"offset":[-50,-67.92],"net":[-31.38,-33.31]},{"rect":[193,1,94,67],"offset":[-52,-66.92],"net":[-33.5,-31.18]},{"rect":[289,1,95,68],"offset":[-53,-67.92],"net":[-34.28,-30.26]},{"rect":[386,1,94,68],"offset":[-52,-70.92],"net":[-33.5,-31.18]},{"rect":[482,1,93,68],"offset":[-50,-67.92],"net":[-31.38,-33.31]},{"rect":[577,1,90,67],"offset":[-46,-66.92],"net":[-28.95,-35.28]},{"rect":[669,1,89,68],"offset":[-45,-67.92],"net":[-27.85,-36.04]},{"rect":[1,76,90,68],"offset":[-46,-70.92],"net":[-28.95,-35.28]}],"scoop-left":[{"rect":[93,76,95,73],"offset":[-50,-72.92],"net":[-31.71,-31.2]},{"rect":[190,76,98,72],"offset":[-53,-71.92],"net":[-34.34,-26.8]},{"rect":[290,76,104,68],"offset":[-59,-67.92],"net":[-39.02,-16.86]},{"rect":[396,76,107,68],"offset":[-62,-63.92],"net":[-42.16,-6.85]},{"rect":[505,76,107,71],"offset":[-62,-61.92],"net":[-43.08,-2.37]},{"rect":[614,76,108,64],"offset":[-63,-63.92],"net":[-42.83,-10.57]},{"rect":[1,151,102,69],"offset":[-57,-68.92],"net":[-38.25,-28.66]},{"rect":[105,151,89,73],"offset":[-44,-72.92],"net":[-28.48,-44.86]},{"rect":[196,151,82,74],"offset":[-37,-73.92],"net":[-22.65,-51.02]},{"rect":[280,151,86,74],"offset":[-41,-73.92],"net":[-25.74,-46.57]},{"rect":[368,151,93,73],"offset":[-48,-72.92],"net":[-30.17,-36.94]},{"rect":[463,151,95,73],"offset":[-50,-72.92],"net":[-31.71,-31.2]}],"idle-right":[{"rect":[560,151,97,73],"offset":[-47,-72.92],"net":[31.71,-31.2]}],"run-right":[{"rect":[659,151,96,68],"offset":[-47,-67.92],"net":[31.38,-33.31]},{"rect":[1,227,99,67],"offset":[-47,-66.92],"net":[33.5,-31.18]},{"rect":[102,227,100,68],"offset":[-47,-67.92],"net":[34.28,-30.26]},{"rect":[204,227,99,68],"offset":[-47,-70.92],"net":[33.5,-31.18]},{"rect":[305,227,96,68],"offset":[-47,-67.92],"net":[31.38,-33.31]},{"rect":[403,227,94,67],"offset":[-48,-66.92],"net":[28.95,-35.28]},{"rect":[499,227,92,68],"offset":[-48,-67.92],"net":[27.85,-36.04]},{"rect":[593,227,94,68],"offset":[-48,-70.92],"net":[28.95,-35.28]}],"scoop-right":[{"rect":[1,297,97,73],"offset":[-47,-72.92],"net":[31.71,-31.2]},{"rect":[100,297,100,72],"offset":[-47,-71.92],"net":[34.34,-26.8]},{"rect":[202,297,105,68],"offset":[-47,-67.92],"net":[39.02,-16.86]},{"rect":[309,297,108,68],"offset":[-47,-63.92],"net":[42.16,-6.85]},{"rect":[419,297,109,71],"offset":[-47,-61.92],"net":[43.08,-2.37]},{"rect":[530,297,109,64],"offset":[-47,-63.92],"net":[42.83,-10.57]},{"rect":[641,297,104,69],"offset":[-47,-68.92],"net":[38.25,-28.66]},{"rect":[1,372,91,73],"offset":[-47,-72.92],"net":[28.48,-44.86]},{"rect":[94,372,83,74],"offset":[-47,-73.92],"net":[22.65,-51.02]},{"rect":[179,372,88,74],"offset":[-47,-73.92],"net":[25.74,-46.57]},{"rect":[269,372,95,73],"offset":[-47,-72.92],"net":[30.17,-36.94]},{"rect":[366,372,97,73],"offset":[-47,-72.92],"net":[31.71,-31.2]}],"swim":[{"rect":[465,372,47,25],"offset":[-29,-14.85]},{"rect":[514,372,47,27],"offset":[-29,-15.85]},{"rect":[563,372,47,26],"offset":[-29,-14.85]},{"rect":[612,372,48,25],"offset":[-30,-14.85]},{"rect":[662,372,48,27],"offset":[-30,-13.85]},{"rect":[712,372,48,26],"offset":[-30,-13.85]}],"evolve-left":[{"rect":[1,448,48,25],"offset":[-19,-14.85]},{"rect":[51,448,57,20],"offset":[-22,-9.85]},{"rect":[110,448,57,21],"offset":[-22,-10.85]},{"rect":[169,448,48,25],"offset":[-20,-22.85]},{"rect":[219,448,46,25],"offset":[-20,-29.85]},{"rect":[267,448,46,27],"offset":[-22,-34.85]},{"rect":[315,448,54,48],"offset":[-32,-51.85]},{"rect":[371,448,80,68],"offset":[-48,-64.85]},{"rect":[453,448,83,68],"offset":[-52,-68.85]},{"rect":[538,448,86,70],"offset":[-55,-73.85]},{"rect":[626,448,88,71],"offset":[-58,-76.85]},{"rect":[1,521,86,73],"offset":[-59,-77.85]},{"rect":[89,521,86,72],"offset":[-60,-74.85]},{"rect":[177,521,59,68],"offset":[-49,-66.85]},{"rect":[238,521,49,68],"offset":[-48,-60.85]},{"rect":[289,521,49,81],"offset":[-47,-53.85]},{"rect":[340,521,47,67],"offset":[-42,-41.85]},{"rect":[389,521,49,65],"offset":[-43,-38.85]},{"rect":[440,521,52,67],"offset":[-47,-41.85]},{"rect":[494,521,55,68],"offset":[-51,-44.85]},{"rect":[551,521,62,68],"offset":[-55,-44.85]},{"rect":[615,521,70,68],"offset":[-59,-44.85]},{"rect":[687,521,78,68],"offset":[-63,-44.85]},{"rect":[1,604,50,69],"offset":[-45,-44.85]},{"rect":[53,604,48,68],"offset":[-45,-44.85]},{"rect":[103,604,48,68],"offset":[-45,-44.85]},{"rect":[153,604,48,68],"offset":[-45,-44.85]},{"rect":[203,604,48,68],"offset":[-45,-44.85]}],"evolve-right":[{"rect":[253,604,48,25],"offset":[-30,-14.85]},{"rect":[303,604,58,20],"offset":[-36,-9.85]},{"rect":[363,604,58,21],"offset":[-36,-10.85]},{"rect":[423,604,48,25],"offset":[-29,-22.85]},{"rect":[473,604,46,25],"offset":[-26,-29.85]},{"rect":[521,604,45,27],"offset":[-24,-34.85]},{"rect":[568,604,54,42],"offset":[-23,-49.85]},{"rect":[624,604,71,64],"offset":[-25,-63.85]},{"rect":[1,675,73,66],"offset":[-24,-68.85]},{"rect":[76,675,83,68],"offset":[-27,-73.85]},{"rect":[161,675,91,72],"offset":[-29,-76.85]},{"rect":[254,675,97,77],"offset":[-30,-77.85]},{"rect":[353,675,98,80],"offset":[-29,-76.85]},{"rect":[453,675,67,68],"offset":[-12,-66.85]},{"rect":[522,675,53,68],"offset":[-5,-60.85]},{"rect":[577,675,52,81],"offset":[-4,-53.85]},{"rect":[631,675,50,68],"offset":[-5,-42.85]},{"rect":[683,675,48,66],"offset":[-5,-39.85]},{"rect":[1,758,52,68],"offset":[-5,-42.85]},{"rect":[55,758,56,68],"offset":[-5,-44.85]},{"rect":[113,758,63,68],"offset":[-8,-44.85]},{"rect":[178,758,71,68],"offset":[-12,-44.85]},{"rect":[251,758,79,68],"offset":[-16,-44.85]},{"rect":[332,758,51,69],"offset":[-4,-44.85]},{"rect":[385,758,51,68],"offset":[-4,-44.85]},{"rect":[438,758,51,68],"offset":[-4,-44.85]},{"rect":[491,758,51,68],"offset":[-4,-44.85]},{"rect":[544,758,51,68],"offset":[-4,-44.85]}],"react-ordinary-left":[{"rect":[597,758,95,73],"offset":[-50,-72.92]},{"rect":[1,833,95,73],"offset":[-50,-72.92]},{"rect":[98,833,96,73],"offset":[-51,-72.92]},{"rect":[196,833,96,72],"offset":[-51,-71.92]},{"rect":[294,833,97,70],"offset":[-52,-69.92]},{"rect":[393,833,97,68],"offset":[-52,-67.92]},{"rect":[492,833,97,68],"offset":[-52,-67.92]},{"rect":[591,833,97,70],"offset":[-52,-69.92]},{"rect":[1,908,96,72],"offset":[-51,-71.92]},{"rect":[99,908,96,73],"offset":[-51,-72.92]},{"rect":[197,908,95,73],"offset":[-50,-72.92]},{"rect":[294,908,95,73],"offset":[-50,-72.92]}],"react-evolving-left":[{"rect":[391,908,95,73],"offset":[-50,-72.92]},{"rect":[488,908,91,74],"offset":[-47,-73.92]},{"rect":[581,908,79,68],"offset":[-40,-67.92]},{"rect":[662,908,74,68],"offset":[-38,-67.92]},{"rect":[1,984,76,71],"offset":[-40,-70.92]},{"rect":[79,984,78,73],"offset":[-42,-72.92]},{"rect":[159,984,79,72],"offset":[-43,-71.92]},{"rect":[240,984,79,71],"offset":[-43,-70.92]},{"rect":[321,984,79,71],"offset":[-43,-70.92]},{"rect":[402,984,84,72],"offset":[-45,-71.92]},{"rect":[488,984,93,73],"offset":[-49,-72.92]},{"rect":[583,984,95,73],"offset":[-50,-72.92]}],"react-ordinary-right":[{"rect":[1,1059,97,73],"offset":[-47,-72.92]},{"rect":[100,1059,97,73],"offset":[-47,-72.92]},{"rect":[199,1059,97,73],"offset":[-47,-72.92]},{"rect":[298,1059,98,72],"offset":[-47,-71.92]},{"rect":[398,1059,98,70],"offset":[-47,-69.92]},{"rect":[498,1059,99,68],"offset":[-47,-67.92]},{"rect":[599,1059,99,68],"offset":[-47,-67.92]},{"rect":[1,1134,98,70],"offset":[-47,-69.92]},{"rect":[101,1134,98,72],"offset":[-47,-71.92]},{"rect":[201,1134,97,73],"offset":[-47,-72.92]},{"rect":[300,1134,97,73],"offset":[-47,-72.92]},{"rect":[399,1134,97,73],"offset":[-47,-72.92]}],"react-evolving-right":[{"rect":[498,1134,97,73],"offset":[-47,-72.92]},{"rect":[597,1134,92,74],"offset":[-46,-73.92]},{"rect":[1,1210,81,69],"offset":[-41,-68.92]},{"rect":[84,1210,74,69],"offset":[-37,-68.92]},{"rect":[160,1210,76,73],"offset":[-37,-72.92]},{"rect":[238,1210,79,74],"offset":[-37,-73.92]},{"rect":[319,1210,80,71],"offset":[-37,-70.92]},{"rect":[401,1210,80,71],"offset":[-37,-70.92]},{"rect":[483,1210,80,71],"offset":[-37,-70.92]},{"rect":[565,1210,86,72],"offset":[-41,-71.92]},{"rect":[653,1210,94,73],"offset":[-46,-72.92]},{"rect":[1,1286,97,73],"offset":[-47,-72.92]}]},"atlas":[768,1360],"image":"fish/b7bbc1bc0c93242a736e.png"};
return {mountBundledStage(container,options){return __entry.mountStage(container,{...options,ui:{...ui,fontBytes:Uint8Array.from(atob(ui.font),c=>c.charCodeAt(0)).buffer},manifest,loadAtlas:async name=>{const r=await options.loadResource(name);if(r.type!=="image/png"||!ArrayBuffer.isView(r.bytes))throw Error("像素资源格式无效");return createImageBitmap(new Blob([r.bytes],{type:r.type}),{premultiplyAlpha:"none"});}});}};
}});
