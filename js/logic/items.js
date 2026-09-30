import { POT_MAX } from '../data/game.js';
import { DATA } from '../data/items.js';
import { STATE, curSave, sv } from '../state.js';

const normT=t=>(t||'').trim().toLowerCase().replace(/s$/,'');
function itemsForType(pool,type){if(!type)return[];const t=normT(type);return pool.filter(i=>normT(i.type)===t);}
function itemsForClass(cls){return{weapon:itemsForType(DATA.weapons,cls.weapon),altweapon:itemsForType(DATA.alt_weapons,cls.alt_weapon),armor:itemsForType(DATA.armors,cls.armor),ability:itemsForType(DATA.abilities,cls.ability)};}
const EXCLUDED_SRC=new Set(['the machine','forge','st crate','alien event','realm']);
function mainDungeons(cls){const p=itemsForClass(cls);const a=[...p.weapon,...p.altweapon,...p.armor,...p.ability];const c={};a.forEach(i=>{const d=(i.drop||'').split(/\s*[&\/]\s*/)[0].trim();if(!d||EXCLUDED_SRC.has(d.toLowerCase()))return;c[d]=(c[d]||0)+1;});return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,3);}
function findItem(pool,name){const pools={weapons:DATA.weapons,alt_weapons:DATA.alt_weapons,armors:DATA.armors,abilities:DATA.abilities,rings:DATA.rings};return(pools[pool]||[]).find(i=>i.name===name);}
function saveStats(k){
  const s=STATE.saves[k];if(!s)return{done:0,total:0,ut:0,utDone:0,st:0,stDone:0,shinyP:0,shinyDone:0,awakenP:0,awakenDone:0,maxed:0,charCount:0};
  // aggregate unique items across all characters + rings
  const seen=new Map();
  const add=(pool,item,entry)=>{const key=pool+'::'+item.name;if(!seen.has(key))seen.set(key,{pool,item,count:0,shiny:false,awaken:false});const e=seen.get(key);e.count+=(entry.count||0);if(entry.shiny)e.shiny=true;if(entry.awaken)e.awaken=true;};
  s.characters.forEach(ch=>{const cls=DATA.classes.find(c=>c.name===ch.className);if(!cls)return;const p=itemsForClass(cls);
    ['weapon','altweapon','armor','ability'].forEach(slot=>{const pool=slot==='weapon'?'weapons':slot==='altweapon'?'alt_weapons':slot==='armor'?'armors':'abilities';(p[slot]||[]).forEach(i=>{const e=ch.items[pool+'::'+i.name];if(e&&e.count>0)add(pool,i,e);});});
    DATA.rings.forEach(i=>{const e=ch.items['rings::'+i.name];if(e&&e.count>0)add('rings',i,e);});
  });
  // also count deceased survivors
  s.cemetery.forEach(t=>(t.survivors||[]).forEach(sv=>{const item=findItem(sv.pool,sv.name);if(item)add(sv.pool,item,{count:sv.count,shiny:sv.hadShiny,awaken:sv.hadAwaken});}));
  let total=0,done=0,ut=0,utDone=0,st=0,stDone=0,shinyP=0,shinyDone=0,awakenP=0,awakenDone=0;
  seen.forEach(e=>{total++;const has=e.count>0;if(e.item.tier==='UT'){ut++;if(has)utDone++;}else if(e.item.tier==='ST'){st++;if(has)stDone++;}if(has)done++;if(e.item.shiny){shinyP++;if(e.shiny)shinyDone++;}if(e.item.awaken){awakenP++;if(e.awaken)awakenDone++;}});
  let maxed=0;s.characters.forEach(ch=>{if(ch.pots&&ch.pots.length>=POT_MAX)maxed++;});
  return{done,total,ut,utDone,st,stDone,shinyP,shinyDone,awakenP,awakenDone,maxed,charCount:s.characters.length};
}
function charStats(ch){
  const cls=DATA.classes.find(c=>c.name===ch.className);if(!cls)return{done:0,total:0,ut:0,utDone:0,st:0,stDone:0};
  const p=itemsForClass(cls);let done=0,total=0,ut=0,utDone=0,st=0,stDone=0;
  ['weapon','altweapon','armor','ability'].forEach(slot=>{
    const pool=slot==='weapon'?'weapons':slot==='altweapon'?'alt_weapons':slot==='armor'?'armors':'abilities';
    (p[slot]||[]).forEach(i=>{total++;const e=ch.items[pool+'::'+i.name];const has=e&&e.count>0;if(i.tier==='UT'){ut++;if(has)utDone++;}else if(i.tier==='ST'){st++;if(has)stDone++;}if(has)done++;});
  });
  // rings
  DATA.rings.forEach(i=>{total++;const e=ch.items['rings::'+i.name];const has=e&&e.count>0;if(i.tier==='UT'){ut++;if(has)utDone++;}else if(i.tier==='ST'){st++;if(has)stDone++;}if(has)done++;});
  return{done,total,ut,utDone,st,stDone};
}
function ringsDone(){const s=curSave();return DATA.rings.filter(r=>(s.rings[r.name]||{}).count>0).length;}

export { normT, itemsForType, itemsForClass, EXCLUDED_SRC, mainDungeons, findItem, saveStats, charStats, ringsDone };
