import { EXALT_MAX } from '../data/game.js';

function getExalts(save,className){
  if(!save.exalts) save.exalts={};
  if(!save.exalts[className]) save.exalts[className]={atk:0,def:0,spd:0,dex:0,vit:0,wis:0,lif:0,man:0};
  return save.exalts[className];
}
function classExaltTotal(save,className){
  const e=getExalts(save,className);
  return Object.values(e).reduce((a,b)=>a+b,0);
}
function accountExaltTotal(save){
  if(!save.exalts) return 0;
  return Object.values(save.exalts).reduce((sum,e)=>sum+Object.values(e).reduce((a,b)=>a+b,0),0);
}
// exalt tier for visual ornaments: based on how many stats are fully exalted (5/5)
// 0=none, 1-7=progressively ornate, 8=full crown
function exaltTier(exaltsObj){
  if(!exaltsObj) return 0;
  const vals = typeof exaltsObj === 'object' ? Object.values(exaltsObj) : [];
  return vals.filter(v => v >= EXALT_MAX).length; // 0-8
}

export { getExalts, classExaltTotal, accountExaltTotal, exaltTier };
