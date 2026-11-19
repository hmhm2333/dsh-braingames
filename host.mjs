import Schema from '@deepseek-ai/schemastery';
import {DEFAULT_CHALLENGE_TARGETS, GAME_CATALOG} from './games.mjs';
import {apply as applyResources} from './resources.mjs';
import {applyCapabilities} from './capabilities.mjs';
import {applyAgentChallenge, challengeScopes} from './agent-challenge.mjs';
import {readFile} from 'node:fs/promises';

export const inject=['connection','llm','sessionQuery','agentDefaultModel'];
export const Config=Schema.object({
  enabledGames:Schema.array(Schema.union(GAME_CATALOG.map(game=>game.id))).default(GAME_CATALOG.map(game=>game.id)).volatile(),
  autoInvite:Schema.boolean().default(true).volatile(),
  inviteRequireRunning:Schema.boolean().default(true).volatile(),
  inviteRequireNoUnread:Schema.boolean().default(true).volatile(),
  keepVisibleOnPause:Schema.boolean().default(false).volatile(),
  keepOnRefresh:Schema.boolean().default(true).volatile(),
  modelRecommendation:Schema.boolean().default(false).volatile(),
  agentChallengeScope:Schema.union(challengeScopes).default('off').volatile(),
  agentChallengeTargets:Schema.object(Object.fromEntries(GAME_CATALOG.map(({id, challengeTarget})=>[
    id, Schema.number().min(1).max(Number.MAX_SAFE_INTEGER).step(1).default(challengeTarget)
  ]))).default(DEFAULT_CHALLENGE_TARGETS).volatile()
});

export async function apply(ctx,config){
  await applyResources(ctx);
  const {version}=JSON.parse(await readFile(new URL('./package.json',import.meta.url),'utf8'));
  applyCapabilities(ctx,{version,enabledGameIds:()=>config.enabledGames.get(),recommendationEnabled:()=>config.modelRecommendation.get()});
  applyAgentChallenge(ctx,{getScope:()=>config.agentChallengeScope.get(),getTargets:()=>config.agentChallengeTargets.get()});
  ctx.inject(['settings'],child=>child.effect(()=>child.settings.configure({auto:false},ctx.fiber)));
}
