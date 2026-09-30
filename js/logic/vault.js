import { DATA } from '../data/items.js';
import { findItem, itemsForClass } from './items.js';
import { curSave } from '../state.js';
import { go } from '../ui/core.js';

// ═══ VAULT ═══════════════════════════════════════════════
function vaultAllItems(){
  const s=curSave();const agg=new Map();
  const add=(owner,isDead,pool,item,count,shinyCount,awaken,sourceType,sourceId)=>{
    if(!count)return;const k=pool+'::'+item.name;
    if(!agg.has(k))agg.set(k,{pool,item,totalCount:0,totalShiny:0,anyAwaken:false,perOwner:[]});
    const e=agg.get(k);e.totalCount+=count;e.totalShiny+=Math.min(shinyCount||0,count);if(awaken)e.anyAwaken=true;
    e.perOwner.push({label:owner,isDead,count,shinyCount:shinyCount||0,awaken,isExtra:sourceType==='extra',extraId:sourceType==='extra'?sourceId:null,sourceType:sourceType||null,sourceId:sourceId||null});
  };
  // characters: only the portion explicitly sent to the vault counts here
  s.characters.forEach(ch=>{const cls=DATA.classes.find(c=>c.name===ch.className);if(!cls)return;const p=itemsForClass(cls);
    const ownerLabel=ch.name&&ch.name!==ch.className?ch.name:ch.className;
    ['weapon','altweapon','armor','ability'].forEach(slot=>{const pool=slot==='weapon'?'weapons':slot==='altweapon'?'alt_weapons':slot==='armor'?'armors':'abilities';
      (p[slot]||[]).forEach(i=>{const e=ch.items[pool+'::'+i.name];const vc=e?(e.vaultCount||0):0;if(vc>0)add(ownerLabel,false,pool,i,vc,Math.min(e.shinyCount||0,vc),e.awaken,'char',ch.id);});
    });
  });
  // rings are account-wide, always fully in the vault
  DATA.rings.forEach(i=>{const e=s.rings[i.name];if(e&&e.count>0)add('Account (Ring)',false,'rings',i,e.count,e.shinyCount||0,e.awaken,'ring',null);});
  // manually-added vault items (e.g. off-class drops)
  (s.vaultExtras||[]).forEach(x=>{const item=findItem(x.pool,x.itemName);if(item)add(x.ownerLabel||'Unknown',false,x.pool,item,x.count,x.shinyCount||0,x.awaken,'extra',x.id);});
  // deceased characters' unclaimed items go straight to the vault
  const dec=new Map();s.cemetery.forEach(t=>{
    const deadLabel='Deceased '+(t.charName||t.className);
    (t.survivors||[]).forEach(sv2=>{const k=deadLabel+'::'+sv2.pool+'::'+sv2.name;if(!dec.has(k))dec.set(k,{label:deadLabel,pool:sv2.pool,name:sv2.name,count:0,shinyCount:0,awaken:false,tombId:t.id});const e=dec.get(k);e.count+=sv2.count;if(sv2.hadShiny)e.shinyCount+=1;if(sv2.hadAwaken)e.awaken=true;});
  });
  dec.forEach(d=>{const item=findItem(d.pool,d.name);if(item)add(d.label,true,d.pool,item,d.count,d.shinyCount,d.awaken,'dead',d.tombId);});
  return Array.from(agg.values());
}
function vaultStats(){const items=vaultAllItems();return{unique:items.length,total:items.reduce((a,x)=>a+x.totalCount,0)};}

// account-wide item collection measured against every item in the GAME (not just items relevant to characters created)
function gameItemTotals(){
  const pools=[DATA.weapons,DATA.alt_weapons,DATA.armors,DATA.abilities,DATA.rings];
  let total=0,ut=0,st2=0,shinyP=0,awakenP=0;
  pools.forEach(arr=>arr.forEach(i=>{total++;if(i.tier==='UT')ut++;else if(i.tier==='ST')st2++;if(i.shiny)shinyP++;if(i.awaken)awakenP++;}));
  return{total,ut,st:st2,shinyP,awakenP};
}
function accountItemProgress(){
  const totals=gameItemTotals();
  const items=vaultAllItems();
  let done=0,utDone=0,stDone=0,shinyDone=0,awakenDone=0;
  items.forEach(e=>{
    done++;
    if(e.item.tier==='UT')utDone++;else if(e.item.tier==='ST')stDone++;
    if(e.item.shiny&&e.totalShiny>0)shinyDone++;
    if(e.item.awaken&&e.anyAwaken)awakenDone++;
  });
  return{done,total:totals.total,ut:totals.ut,utDone,st:totals.st,stDone,shinyP:totals.shinyP,shinyDone,awakenP:totals.awakenP,awakenDone};
}
function transferVaultItemToCharacter(pool,itemName,sourceType,sourceId,qty,targetCh){
  const s=curSave();const key=pool+'::'+itemName;
  const giveToTarget=(take,shinyTake,awakenFlag)=>{
    if(!targetCh.items[key])targetCh.items[key]={count:0,shinyCount:0,vaultCount:0,awaken:false,fav:false};
    const te=targetCh.items[key];
    te.count+=take;
    te.shinyCount=Math.min((te.shinyCount||0)+shinyTake,te.count);
    if(awakenFlag)te.awaken=true;
  };
  if(sourceType==='char'){
    const srcCh=s.characters.find(c=>c.id===sourceId);if(!srcCh)return;
    const e=srcCh.items[key];if(!e)return;
    const take=Math.min(qty,e.vaultCount||0);if(take<=0)return;
    if(srcCh.id===targetCh.id){
      // returning to the same character: just pull it back out of the vault portion
      e.vaultCount=Math.max(0,e.vaultCount-take);
    } else {
      const shinyTake=Math.min(e.shinyCount||0,take);
      e.count=Math.max(0,e.count-take);
      e.vaultCount=Math.max(0,e.vaultCount-take);
      e.shinyCount=Math.min(e.shinyCount||0,e.count);
      giveToTarget(take,shinyTake,e.awaken);
    }
  } else if(sourceType==='extra'){
    const idx=(s.vaultExtras||[]).findIndex(x=>x.id===sourceId);if(idx<0)return;
    const x=s.vaultExtras[idx];const take=Math.min(qty,x.count);if(take<=0)return;
    const shinyTake=Math.min(x.shinyCount||0,take);
    x.count-=take;x.shinyCount=Math.max(0,(x.shinyCount||0)-shinyTake);
    if(x.count<=0)s.vaultExtras.splice(idx,1);
    giveToTarget(take,shinyTake,x.awaken);
  } else if(sourceType==='dead'){
    const tomb=s.cemetery.find(t=>t.id===sourceId);if(!tomb)return;
    const svEntry=(tomb.survivors||[]).find(x=>x.pool===pool&&x.name===itemName);if(!svEntry)return;
    const take=Math.min(qty,svEntry.count);if(take<=0)return;
    const shinyTake=svEntry.hadShiny?take:0; // survivor records only a boolean, so shiny share is approximate
    svEntry.count-=take;
    if(svEntry.count<=0)tomb.survivors=tomb.survivors.filter(x=>x!==svEntry);
    giveToTarget(take,shinyTake,svEntry.hadAwaken);
  }
}

export { vaultAllItems, vaultStats, gameItemTotals, accountItemProgress, transferVaultItemToCharacter };
