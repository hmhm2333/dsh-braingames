import React from 'react';
import {createReadinessTracker,createStateSnapshot,readRows} from './task-state.mjs';
import {createTaskAttentionMonitor} from './task-attention.mjs';
import {createGameRuntime} from './runtime/session-runtime.mjs';
import {GAME_CATALOG} from './games.mjs';
import {BACKUP_WORDS, CHALLENGE_WORDS, SETTINGS_WORDS, localizedGameCopy, pluginLanguage, sharedWords} from './ui-copy.mjs';
import {createRefreshStore} from './runtime/refresh-store.mjs';
import {createPracticeStore} from './practice-store.mjs';
import {createPracticeWriter} from './practice-writer.mjs';
import {PracticePanel} from './practice-panel.mjs';
import {AgentChallengeSettings,ChallengePopup,GameIcon,GameSettings,PixelPopup,SETTINGS_FIELDS} from './host-ui.mjs';

export const inject=['slots','sessions','uiSession','conversation','connection','remote','shortcuts','configForms','locale'];
const h=React.createElement,PACKAGE='dsh-braingames';
const hostUiCss=__BRAINGAMES_HOST_UI_CSS__;
const practiceRules=__BRAINGAMES_RULES__;

export function apply(ctx){
  let container=null,unloaded=false,resolveHost;
  const hostReady=new Promise(resolve=>{resolveHost=resolve;});
  let revision=0,openError='',guardDispose=null,guardSequence=0,guardUpdating=false,guardSignature='',guardBindings=[];
  let guardState={foreground:false,heldCodes:[],ownedKeys:[]},errors=[];
  const listeners=new Set(),readiness=createReadinessTracker(),attention=createTaskAttentionMonitor();
  const resourceAbort=new AbortController(),preferences=ctx.configForms.get('braingames');
  const practiceRecords=createPracticeStore();
  let language=pluginLanguage(ctx.locale.getSnapshot().active);
  let shared=sharedWords(language);
  let practiceRevision=0,practiceError='';
  function practiceChanged(error) {
    if(error){
      practiceError=error.name==='QuotaExceededError'?'writeQuota':'writeFailed';
      console.error('练习记录保存失败',error);
    }else practiceRevision++;
    refresh();
  }
  const practiceWriter=createPracticeWriter({store:practiceRecords,onChange:practiceChanged});
  let hasRunning=false,preferencesReady=false,preferenceSignature='',saving=false,settingsError='',editedField='',returnFocus=null;
  let challenge=null,challengeError=false,challengeNotice=false,challengePreferences='',challengeSync=Promise.resolve();
  const hookConnections=new Map();
  let currentSessionId=null,refreshStore=null,bootSettled=false,bootError='',resumeError=false,bootstrapJob=null,viewportFailure=null;
  const canFit=game=>!container||(
    container.clientWidth>=game.minimumSize.width&&container.clientHeight>=game.minimumSize.height);
  const bindingKey=b=>JSON.stringify([b.code,[...b.modifiers].sort(),b.secondCode??null]);
  const isForeground=()=>runtime.status().mode==='foreground';
  function snapshot(source){
    const list=ctx.sessions.list.getSnapshot(),status=ctx.uiSession.sessionStatus.getSnapshot();
    const connection=ctx.connection.state.getSnapshot(),generation=ctx.connection.generation.getSnapshot()?.id;
    return createStateSnapshot({observedAt:Date.now(),readiness:readiness(connection,generation,list.phase,source),generation,
      rows:readRows(ctx,list,status),catalogIds:[...list.ids],errors});
  }
  function refresh(){revision++;for(const listener of listeners)listener();}
  function changed(source){
    if(unloaded)return;
    const list=ctx.sessions.list.getSnapshot(),status=ctx.uiSession.sessionStatus.getSnapshot();
    const state=ctx.connection.state.getSnapshot(),generation=ctx.connection.generation.getSnapshot()?.id;
    const rows=new Map(Object.entries(list.byId??{}));
    for(const [id,value]of status)rows.set(id,{...rows.get(id),...value});
    const ready=state==='connected'&&list.phase==='ready'&&generation!==undefined;
    const running=[...rows.values()].some(row=>row.running===true);
    const pending=[...status.values()].some(row=>!!row.pendingInteraction);
    if(hasRunning!==running){hasRunning=running;refresh();}
    const unread=[...status.values()].some(row=>row.completionUnread===true);
    runtime.observe({running,ready:ready&&preferencesReady&&bootSettled&&!bootError,attention:pending,unread}).catch(report);
    if(isForeground()||runtime.status().loading&&runtime.status().presentation==='active'){
      const s=snapshot(source),signal=attention.observe(s,s.readiness.generation);
      if(signal)runtime.background(signal.reason);
    }
  }
  function report(error){if(unloaded)return;console.error(error);openError=error.message;refresh();}
  const store={getSnapshot:()=>revision,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);}};
  function releaseGuard(){
    guardState={foreground:false,heldCodes:[],ownedKeys:[]};guardBindings=[];guardSignature='';
    const dispose=guardDispose;guardDispose=null;dispose?.();
  }
  function reconcileGuard(){
    if(guardUpdating||unloaded)return;
    const catalog=ctx.shortcuts.catalog.getSnapshot();
    if(!Array.isArray(catalog))throw Error('DSH快捷键目录尚未准备好');
    const held=new Set(guardState.heldCodes);
    const owns=b=>b.modifiers.length===0&&guardState.ownedKeys.some(key=>key===b.code||key===b.secondCode)||guardState.ownedKeys.includes('Tab')&&b.code==='Tab'&&b.modifiers.length===1&&b.modifiers[0]==='shift';
    const bindings=[...new Map(catalog.filter(row=>row.binding&&row.issue===null&&
      (guardState.foreground&&owns(row.binding)||row.binding.modifiers.length===0&&(held.has(row.binding.code)||held.has(row.binding.secondCode)))).map(row=>[bindingKey(row.binding),row.binding])).values()]
      .sort((a,b)=>bindingKey(a).localeCompare(bindingKey(b)));
    const signature=JSON.stringify(bindings.map(bindingKey));
    if(signature===guardSignature)return;
    guardUpdating=true;
    try{
      const old=guardDispose;
      const next=bindings.length?ctx.shortcuts.registerFixed({id:'braingames.input.'+(++guardSequence),label:()=> 'BrainGames input',
        bindings:bindings.map(b=>({...b,modifiers:[...b.modifiers]})),keys:[],group:'BrainGames'}):null;
      guardDispose=next;guardBindings=bindings;guardSignature=signature;old?.();
    }finally{guardUpdating=false;}
  }
  function setGuard(state){guardState=state;reconcileGuard();}
  for(const [name,source]of [['list',ctx.sessions.list],['status',ctx.uiSession.sessionStatus],['connection',ctx.connection.state],['generation',ctx.connection.generation]]){
    ctx.effect(()=>source.subscribe(()=>changed(name)),'BrainGames task state '+name);
  }
  ctx.effect(()=>ctx.remote.$on('api-session/error',id=>{errors.push({id,at:Date.now()});errors=errors.slice(-64);changed('task-error');}),'BrainGames task errors');
  for(const source of[ctx.shortcuts.catalog,ctx.shortcuts.config])ctx.effect(()=>source.subscribe(()=>{reconcileGuard();refresh();}),'BrainGames input bindings');
  let dismissErrors=false;
  const run=action=>{openError='';viewportFailure=null;dismissErrors=false;refresh();void action().catch(report);};
  const button={font:'inherit',fontSize:13,padding:'5px 10px',border:'1px solid color-mix(in srgb,currentColor 22%,transparent)',borderRadius:6,background:'transparent',color:'inherit',cursor:'pointer'};
  const pixelLabel=text=>h('span',{'data-pixel-text':true},text);
  function TaskEntry({sessionId}={}){
    React.useSyncExternalStore(store.subscribe,store.getSnapshot);
    React.useEffect(()=>{
      const id=sessionId??null;
      if(id!==currentSessionId&&runtime.status().selecting)runtime.background('task-changed');
      currentSessionId=id;
      return()=>{
        if(currentSessionId!==id)return;
        if(runtime.status().selecting)runtime.background('task-changed');
        currentSessionId=null;
      };
    },[sessionId]);
    const s=api.status(),active=s.resident?GAME_CATALOG.find(game=>game.id===s.gameId):null;
    const label=s.selecting?shared.selecting:s.loading||!s.ready&&!bootError?shared.loading:s.hasRound?shared.headerContinue:shared.headerStart;
    return h('div',{'data-braingames-task-entry':true,style:{position:'relative',display:'flex',alignItems:'center'}},
      s.mode==='foreground'?h('span',{'data-braingames-active':true,style:{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',fontSize:13,opacity:.65}},h(GameIcon,{icon:active?.icon}),shared.headerPlaying):h('button',{'data-braingames-entry':true,type:'button',style:{...button,display:'flex',alignItems:'center',gap:6},
        disabled:s.loading||!s.ready&&!bootError||s.ready&&!s.canStart&&!s.hasRound,
        title:!s.canStart&&!s.hasRound?shared.noGames:active?localizedGameCopy(active.id,language).game.title:shared.appLabel,
        onClick:()=>{if(bootError){dismissErrors=false;refresh();}else run(()=>api.open());}},h(GameIcon,{icon:active?.icon}),label),
      s.presentation==='waiting'?h(PixelPopup,{lang:language==='zh'?'zh-CN':'en','data-braingames-invitation':true,'aria-label':shared.inviteLabel},
        h('p',{className:'braingames-popup-message'},h(GameIcon),pixelLabel(hasRunning?shared.invite:shared.inviteIdle)),
        h('div',{className:'braingames-popup-actions'},
          h('button',{'data-braingames-accept':true,type:'button',onClick:()=>run(()=>api.open())},pixelLabel(shared.inviteAccept)),
          h('button',{'data-braingames-dismiss':true,type:'button',onClick:()=>runtime.dismissInvitation()},pixelLabel(shared.inviteDismiss)))):null);
  }
  const challengeEnabled=()=>{
    const scope=preferences.getSnapshot().value?.agentChallengeScope;
    return scope==='dsh'||scope==='local';
  };
  const challengeLocked=()=>challengeEnabled()&&challenge?.locked===true;
  function setChallengeNotice(open){
    if(challengeNotice===open)return;
    challengeNotice=open;refresh();
  }
  function ChallengeComposer({sessionId}){
    React.useSyncExternalStore(store.subscribe,store.getSnapshot);
    const anchor=React.useRef(null);
    const locked=challengeLocked(),copy=CHALLENGE_WORDS[language];
    React.useLayoutEffect(()=>{
      if(!locked)return;
      const card=anchor.current.closest('[data-composer-card]');
      const openFromInput=event=>{
        if(!event.composedPath().some(node=>node.hasAttribute?.('data-composer-input')))return;
        event.preventDefault();
        event.stopPropagation();
        setChallengeNotice(true);
      };
      card.addEventListener('click',openFromInput,true);
      const blocks=ctx.conversation.blocks,state=blocks.storeFor(sessionId),ours={reason:copy.inputLocked};
      const block=()=>{if(state.getSnapshot()===undefined)blocks.set(sessionId,ours);};
      const stop=state.subscribe(block);
      block();
      return()=>{
        card.removeEventListener('click',openFromInput,true);
        stop();
        if(state.getSnapshot()===ours)blocks.set(sessionId,undefined);
      };
    },[sessionId,locked,copy]);
    return locked?h('span',{ref:anchor,hidden:true,'data-braingames-challenge-anchor':true}):null;
  }
  async function savePreference(field,value){
    editedField=field;saving=true;settingsError='';refresh();
    try{if(!await preferences.set(field,value))throw Error(SETTINGS_WORDS[language].saveFailed);}
    catch(error){console.error('Game settings save failed',error);settingsError=true;}
    finally{saving=false;refresh();}
  }
  function syncChallenge(record){
    challengeSync=challengeSync.then(async()=>{
      if(unloaded)return;
      try{
        const response=await fetch(new URL('api/braingames/agent-challenge',document.baseURI),{
          signal:resourceAbort.signal,...(record?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(record)}:{})
        });
        if(!response.ok)throw Error('BrainGames Agent challenge HTTP '+response.status);
        const next=await response.json();
        if(unloaded)return;
        if(!next.locked||!challengeEnabled())challengeNotice=false;
        challenge=next;challengeError=false;refresh();
      }catch(error){
        if(!unloaded){challengeError=true;console.error(error);refresh();}
      }
    });
    return challengeSync;
  }
  function recordPractice(record){
    practiceWriter.save(record);
    if(challengeEnabled()){
      void syncChallenge({gameId:record.gameId,score:record.score,finishedAt:record.finishedAt});
    }
  }
  async function connectAgent(agentId){
    if(hookConnections.get(agentId)?.pending)return;
    hookConnections.set(agentId,{pending:true});
    refresh();
    const request=()=>fetch(new URL('api/braingames/agent-challenge/connect',document.baseURI),{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({agentId}),signal:resourceAbort.signal,
    });
    try{
      let response=await request();
      if(response.status===404){
        // The missing route did not reach the installer. Recheck the host before trying once more.
        await syncChallenge();
        if(unloaded)return;
        if(!challengeError&&challenge?.scope==='local'&&!challenge.bridgeError)response=await request();
        if(response.status===404){
          hookConnections.set(agentId,{error:'connect-unavailable'});
          return;
        }
      }
      if(response.headers.get('Content-Type')?.split(';',1)[0]!=='application/json'){
        throw Error('BrainGames Agent hook HTTP '+response.status);
      }
      const receipt=await response.json();
      if(!response.ok){
        hookConnections.set(agentId,{error:receipt?.error||'connect-response'});
      }else{
        if(receipt?.result!=='installed'&&receipt?.result!=='already-installed')throw Error('Invalid Agent hook installation receipt');
        hookConnections.set(agentId,{result:receipt.result});
      }
    }catch(error){
      if(!unloaded){console.error('Agent hook installation failed',error);hookConnections.set(agentId,{error:'connect-response'});}
    }finally{if(!unloaded)refresh();}
  }
  function PluginDetails(){
    React.useSyncExternalStore(store.subscribe,store.getSnapshot);
    const state=preferences.getSnapshot();
    const form={locale:language,catalog:GAME_CATALOG,state,saving,onChange:savePreference};
    const feedback={saving,error:settingsError};
    const challengeEdit=editedField==='agentChallengeScope'||editedField==='agentChallengeTargets';
    return h(React.Fragment,null,
      h(GameSettings,{...form,feedback:challengeEdit?null:feedback}),
      h(PracticePanel,{locale:language,catalog:GAME_CATALOG,store:practiceRecords,revision:practiceRevision,rules:practiceRules,
        storageError:BACKUP_WORDS[language][practiceError],onImported:()=>practiceChanged(null)}),
      h(AgentChallengeSettings,{...form,feedback:challengeEdit?feedback:null,status:challenge,failed:challengeError,
        onRefresh:()=>void syncChallenge(),hookConnections,onConnectAgent:connectAgent})
    );
  }
  function StageHost(){
    React.useSyncExternalStore(store.subscribe,store.getSnapshot);
    const ref=React.useRef(null);
    React.useEffect(()=>{
      container=ref.current;resolveHost(container);
      const observer=new ResizeObserver(()=>{
        if(viewportFailure?.fromResize&&canFit(viewportFailure.game))viewportFailure=null;
        if(!viewportFailure&&isForeground()){
          const game=GAME_CATALOG.find(item=>item.id===runtime.status().gameId);
          if(game&&!canFit(game))viewportFailure={game,fromResize:true};
        }
        runtime.refreshAvailability();
        refresh();
      });
      observer.observe(container);
      return()=>{observer.disconnect();container=null;};
    },[]);
    const s=runtime.status(),error=bootError||openError||s.error;
    const displayError=bootError?shared.bootError:shared.loadedError;
    const requirement=viewportFailure?.game.minimumSize;
    const retryFit=viewportFailure&&canFit(viewportFailure.game);
    return h('div',{'data-braingames-overlay':true,style:{position:'absolute',inset:0,pointerEvents:'none',zIndex:9500}},
      h('style',null,hostUiCss),h('div',{ref,style:{position:'absolute',inset:0}}),
      viewportFailure?h(PixelPopup,{lang:language==='zh'?'zh-CN':'en','data-braingames-error':true,'data-braingames-viewport':true,role:'alert'},
        h('p',{className:'braingames-popup-detail'},shared.viewportError.replace('{width}',requirement.width).replace('{height}',requirement.height)),
        h('div',{className:'braingames-popup-actions'},
          retryFit?h('button',{'data-braingames-action':true,type:'button',onClick:()=>run(()=>api.open())},pixelLabel(shared.retry)):null,
          h('button',{'data-braingames-action':true,type:'button',onClick:()=>{viewportFailure=null;refresh();}},pixelLabel(shared.inviteDismiss)))):
      error&&!dismissErrors?h(PixelPopup,{lang:language==='zh'?'zh-CN':'en','data-braingames-error':true,role:'alert'},
        h('p',{className:'braingames-popup-detail'},displayError),
        h('div',{className:'braingames-popup-actions'},
          h('button',{'data-braingames-action':true,type:'button',onClick:()=>run(()=>bootError?(resumeError?api.discardSavedRound():api.retryBoot()):api.open())},
            pixelLabel(bootError?(resumeError?shared.discardSavedRound:shared.retry):shared.reload)),
          h('button',{'data-braingames-action':true,type:'button',onClick:()=>{dismissErrors=true;refresh();}},pixelLabel(shared.inviteDismiss)))):null,
      challengeNotice&&challengeLocked()&&s.mode!=='foreground'&&!s.loading?h(ChallengePopup,{locale:language,status:challenge,
        onDismiss:()=>setChallengeNotice(false),
        onPlay:api.status().ready&&(s.canStart||s.hasRound)?()=>run(()=>api.open()):null}):null);
  }
  const runtime=createGameRuntime({games:GAME_CATALOG,canFit,enabledGameIds:[],autoInvite:false,onChange:refresh,onInputGuardChange:setGuard,
    async chooseGame(candidates,{signal}){
      const response=await fetch(new URL('api/braingames/recommend',document.baseURI),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:currentSessionId,gameIds:candidates.map(game=>game.id)}),signal});
      const result=await response.json();if(!response.ok)throw Error(result.error.message);return result.gameId;
    },
    async loadStage(game,callbacks){
      const host=container??await hostReady;if(unloaded)return null;
      const mod=await require.async(game.chunk);if(unloaded)return null;
      return mod.mountBundledStage(host,{...callbacks,practiceRules:practiceRules[game.id],
        onPracticeRecord:recordPractice,onPracticePart:practiceWriter.savePart,
        getGameCopy:requested=>localizedGameCopy(game.id,requested??language),
        getReturnFocus:()=>returnFocus,onModeChange(mode,reason){
        if(mode==='foreground'){openError='';viewportFailure=null;const baseline=snapshot('activation-baseline');attention.observe(baseline,baseline.readiness.generation);}
        callbacks.onModeChange(mode,reason);
      },loadResource:async name=>{
        const url=new URL('api/braingames/resource',document.baseURI);url.searchParams.set('name',name);
        const response=await fetch(url,{signal:resourceAbort.signal});
        if(!response.ok)throw Error('角色资源加载失败 ('+response.status+')');
        return{type:response.headers.get('Content-Type'),bytes:new Uint8Array(await response.arrayBuffer())};
      }});
    }
  });
  async function bootstrap(){
    bootSettled=false;bootError='';resumeError=false;refresh();
    const deadline=AbortSignal.any([resourceAbort.signal,AbortSignal.timeout(10000)]);
    if(!preferencesReady){
      void ctx.configForms.describe().ensure();
      await new Promise((resolve,reject)=>{
        const finished=()=>{stop();deadline.removeEventListener('abort',aborted);};
        const aborted=()=>{finished();reject(deadline.reason);};
        const check=()=>{
          const state=preferences.getSnapshot().status;
          if(state==='loading')return;
          finished();
          if(state==='ready')resolve();else reject(Error('dsh-braingames 设置不可用。'));
        };
        const stop=preferences.subscribe(check);
        deadline.addEventListener('abort',aborted,{once:true});
        check();
      });
    }
    const response=await fetch(new URL('api/braingames/runtime',document.baseURI),{signal:deadline});
    if(!response.ok)throw Error('游戏运行信息读取失败 ('+response.status+')');
    const {runtimeId}=await response.json();
    refreshStore=createRefreshStore({storage:window.sessionStorage,runtimeId,navigationType:performance.getEntriesByType('navigation')[0]?.type});
    if(preferences.getSnapshot().value.keepOnRefresh){
      try{const saved=refreshStore.read();if(saved)await runtime.restore(saved);}
      catch(error){resumeError=true;throw error;}
    }else refreshStore.clear();
    bootSettled=true;changed('bootstrap');refresh();
  }
  function startBootstrap(){
    if(bootstrapJob)return bootstrapJob;
    bootstrapJob=bootstrap().then(()=>true,error=>{
      if(!unloaded){console.error(error);bootError=error.message;bootSettled=true;refresh();}
      return false;
    }).finally(()=>{bootstrapJob=null;});
    return bootstrapJob;
  }
  const api={
    status(){return{installed:!unloaded,version:__BRAINGAMES_VERSION__,language,preferencesReady,ready:preferencesReady&&bootSettled&&!bootError,...runtime.status()};},
    diagnostics(){return{...api.status(),taskState:snapshot(),inputGuard:{foreground:guardState.foreground,reserved:guardBindings.length,heldCodes:guardState.heldCodes},stage:runtime.diagnostics().stage,preferences:{status:preferences.getSnapshot().status,value:preferences.getSnapshot().value,writable:preferences.getSnapshot().writable,saving,error:settingsError},error:bootError||openError,restoreFailed:resumeError};},
    async open(options){
      setChallengeNotice(false);
      if(!await api.ready)throw Error(bootError||'dsh-braingames 设置尚未就绪');
      const baseline=snapshot('activation-baseline');attention.observe(baseline,baseline.readiness.generation);
      const result=await runtime.open(options);
      if(result.reason==='viewport'){
        const game=GAME_CATALOG.find(item=>item.id===result.gameId);
        viewportFailure={game,fromResize:false};refresh();
      }
      return result;
    },
    retryBoot(){api.ready=startBootstrap();return api.ready;},
    async discardSavedRound(){refreshStore.clear();runtime.abandonRestore();resumeError=false;bootError='';bootSettled=true;api.ready=Promise.resolve(true);return api.open();},
    background:reason=>runtime.background(reason),random:()=>runtime.random()
  };
  ctx.slots.inject('shell.overlay',()=>ctx.slots.register({name:'shell.overlay',id:'braingames.overlay'},StageHost));
  ctx.slots.inject('conversation.session.header.utilities',()=>ctx.slots.register({name:'conversation.session.header.utilities',id:'braingames.runtime',order:-20},TaskEntry));
  ctx.slots.inject('conversation.input.overlay',()=>ctx.slots.register({name:'conversation.input.overlay',id:'braingames.challenge'},ChallengeComposer));
  ctx.slots.inject('plugins.bundle.config',()=>ctx.slots.register({name:'plugins.bundle.config',key:PACKAGE},PluginDetails));
  ctx.effect(()=>{
    const cancel=reason=>{const s=runtime.status();if(s.loading&&s.presentation==='active')runtime.background(reason);};
    const pointer=event=>{
      const path=event.composedPath();
      if(path.some(node=>node?.dataset?.braingamesTaskEntry!==undefined)&&!isForeground()){
        const focused=document.activeElement;if(focused instanceof HTMLElement&&!focused.closest('[data-braingames-task-entry]'))returnFocus=focused;
      }
      if(!path.some(node=>node?.dataset?.braingamesTaskEntry!==undefined||node?.dataset?.braingamesAction!==undefined))cancel('task-pointer');
    },blur=()=>cancel('window-blur'),hidden=()=>{if(document.hidden)cancel('hidden');};
    try{practiceWriter.resumePending(window.sessionStorage);}catch(error){practiceChanged(error);}
    const pagehide=()=>{
      const round=runtime.checkpoint();
      try{practiceWriter.savePending(window.sessionStorage);}catch(error){practiceChanged(error);}
      if(!bootSettled||!refreshStore||resumeError)return;
      if(preferences.getSnapshot().value.keepOnRefresh)refreshStore.save(round);else refreshStore.clear();
    };
    window.addEventListener('pointerdown',pointer,{capture:true});window.addEventListener('blur',blur);window.addEventListener('pagehide',pagehide);document.addEventListener('visibilitychange',hidden);
    return()=>{window.removeEventListener('pointerdown',pointer,{capture:true});window.removeEventListener('blur',blur);window.removeEventListener('pagehide',pagehide);document.removeEventListener('visibilitychange',hidden);};
  },'BrainGames pending activation and refresh');
  function syncPreferences(){
    const state=preferences.getSnapshot();
    preferencesReady=state.status==='ready';
    if(preferencesReady){
      if(bootSettled&&bootError&&refreshStore===null)api.ready=startBootstrap();
      const value=state.value,signature=JSON.stringify(value);
      if(signature!==preferenceSignature){preferenceSignature=signature;runtime.configure({enabledGameIds:value.enabledGames,...Object.fromEntries(SETTINGS_FIELDS.filter(field=>field!=='modelRecommendation').map(field=>[field,value[field]])),recommendByTask:value.modelRecommendation===true});if(!value.keepOnRefresh)refreshStore?.clear();}
      const challengeSignature=JSON.stringify([value.agentChallengeScope,value.agentChallengeTargets]);
      if(challengeSignature!==challengePreferences){
        challengePreferences=challengeSignature;
        if(!challengeEnabled())challengeNotice=false;
        void syncChallenge();
      }
    }
    changed('preferences');refresh();
  }
  ctx.effect(()=>preferences.subscribe(syncPreferences),'BrainGames preferences');
  ctx.effect(()=>ctx.connection.generation.subscribe(()=>{
    if(preferencesReady&&ctx.connection.generation.getSnapshot())void syncChallenge();
  }),'BrainGames challenge reconnect');
  ctx.effect(()=>ctx.locale.subscribe(()=>{
    const next=pluginLanguage(ctx.locale.getSnapshot().active);
    if(next===language)return;
    language=next;shared=sharedWords(next);refresh();
  }),'BrainGames language');
  window.brainGames=api;syncPreferences();api.ready=startBootstrap();
  ctx.effect(()=>async()=>{
    unloaded=true;resolveHost(null);resourceAbort.abort();await runtime.dispose();releaseGuard();
    if(window.brainGames===api)delete window.brainGames;
  },'BrainGames unload');
}
