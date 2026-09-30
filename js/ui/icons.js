import { CLASS_SPRITES, GRAVESTONE_SPRITES, ITEM_SPRITES, UI_SPRITES } from '../data/sprites.js';
import { esc } from '../utils.js';

// ── pixel bitmaps ─────────────────────────────────────────
const BITMAPS = {
  sword:["......11","...1.111","....111.","...111..","..111.1.",".111....","111.....","11......"],
  altweapon:["...11...",".111111.","11111111","11.11.11","11111111",".111111.","...11...","...11..."],
  armor:["111..111","11111111","11111111",".111111.","..1111..","..1111..","..1111..","...11..."],
  ability:["11111111","11111111","1..11..1","11111111","1.1111.1","11.11.11","1..11..1","..1111.."],
  ring:["..1111..",".111111.","11.11.11","11....11","11....11","11.11.11",".111111.","..1111.."],
  stickman:["...11...","...11...","..1111..",".111111.","1.1111.1","..1111..","..1..1..","..1..1.."],
  chest:["11111111","1......1","11111111","1.1111.1","1.1111.1","1.1111.1","1......1","11111111"],
  scroll:["..111111",".1111111","11111111","11111111","11111111","11111111","1111111.","111111.."],
  paw:[".11..11.","11111111",".11..11.","........","..1111..",".111111.","1111111.",".11111.."]
};
function bpx(bm){const r=bm.length,c=bm[0].length;let s='';for(let y=0;y<r;y++)for(let x=0;x<c;x++)if(bm[y][x]==='1')s+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="currentColor"/>`;return `<svg viewBox="0 0 ${c} ${r}" shape-rendering="crispEdges">${s}</svg>`;}
const ICONS={};for(const k in BITMAPS) ICONS[k]=bpx(BITMAPS[k]);
function classSpriteImg(name){const src=CLASS_SPRITES[name];return src?`<img src="${src}" alt="${esc(name)}" draggable="false">`:ICONS.stickman;}
function itemSpriteImg(pool,name){const src=ITEM_SPRITES[pool+'::'+name];return src?`<img src="${src}" alt="${esc(name)}" draggable="false">`:iconForPool(pool);}
const VAULT_CHEST_ICON=`<img src="${UI_SPRITES.vault}" alt="Vault" draggable="false">`;
const CHARACTER_ICON=classSpriteImg('Wizard');
const PET_MAIN_ICON=`<img src="${UI_SPRITES.pet}" alt="Pet" draggable="false">`;
const INDEX_ICON=`<img src="${UI_SPRITES.index}" alt="Item Index" draggable="false">`;

function potSvg(c){return `<svg viewBox="0 0 9 12" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect x="3" y="0" width="3" height="1" fill="#2b1f14"/><rect x="3" y="1" width="3" height="1" fill="#5a3f24"/><rect x="3" y="2" width="3" height="2" fill="#1c1811"/><rect x="3" y="2" width="1" height="2" fill="#3a2e1f"/><rect x="2" y="4" width="5" height="1" fill="#1c1811"/><rect x="1" y="5" width="7" height="1" fill="#1c1811"/><rect x="0" y="6" width="1" height="4" fill="#1c1811"/><rect x="8" y="6" width="1" height="4" fill="#1c1811"/><rect x="1" y="6" width="7" height="4" fill="${c}"/><rect x="1" y="6" width="1" height="3" fill="rgba(255,255,255,0.28)"/><rect x="2" y="6" width="1" height="1" fill="rgba(255,255,255,0.35)"/><rect x="1" y="10" width="7" height="1" fill="#1c1811"/><rect x="2" y="11" width="5" height="1" fill="#1c1811"/></svg>`;}
// ── gravestone skins (progression 0/8..8/8 stat-maxed at death) ──
function gravestoneStageHeight(stage){
  stage=Math.max(0,Math.min(8,stage));
  return 22+stage*6; // grows progressively taller from stage 0 (22px) to stage 8 (70px)
}
function gravestoneSvg(stage,h){
  stage=Math.max(0,Math.min(8,stage));
  const height=h||gravestoneStageHeight(stage);
  return `<img src="${GRAVESTONE_SPRITES[stage]}" alt="${stage}/8 gravestone" draggable="false" style="height:${height}px;width:auto;display:block;">`;
}
function iconForPool(p){return p==='weapons'?ICONS.sword:p==='alt_weapons'?ICONS.altweapon:p==='armors'?ICONS.armor:p==='abilities'?ICONS.ability:p==='rings'?ICONS.ring:ICONS.sword;}

export { BITMAPS, bpx, ICONS, classSpriteImg, itemSpriteImg, VAULT_CHEST_ICON, CHARACTER_ICON, PET_MAIN_ICON, INDEX_ICON, potSvg, gravestoneStageHeight, gravestoneSvg, iconForPool };
