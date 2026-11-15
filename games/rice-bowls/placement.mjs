import {MAX_MENU_HALF_WIDTH} from './layout.mjs';

export const PLACEMENT_KEY='braingames.g04.stage-anchor.v1';
export function placementBounds(phase,viewport,dialogHeight=0){
  if(!['welcome','summary'].includes(phase))return{left:-MAX_MENU_HALF_WIDTH,right:MAX_MENU_HALF_WIDTH,top:-176,bottom:182};
  const [x,y]=viewport.scene.whale,[lobbyX,lobbyY]=viewport.lobbyAnchor.map((value,i)=>value-viewport.scene.whale[i]);
  const left=viewport.panel.left-x,right=left+viewport.panel.width;
  const centre=viewport.height/2+viewport.offset[1]-y;
  return{left:Math.min(left,lobbyX-80),right:Math.max(right,lobbyX+80),
    top:Math.min(centre-dialogHeight/2,lobbyY-176),bottom:Math.max(centre+dialogHeight/2,lobbyY)};
}
export function clampAnchor(anchor,bounds,width,height){
  const axis=(value,min,max)=>Math.round(min>max?(min+max)/2:Math.max(min,Math.min(max,value)));
  return[axis(anchor[0],16-bounds.left,width-16-bounds.right),axis(anchor[1],16-bounds.top,height-16-bounds.bottom)];
}
