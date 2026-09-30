import { DATA } from '../data/items.js';
import { itemsForClass } from '../logic/items.js';
import { curSave } from '../state.js';
import { go } from '../ui/core.js';
import { gravestoneSvg } from '../ui/icons.js';
import { esc, uid } from '../utils.js';

// ═══ DEATH ═══════════════════════════════════════════════
function killChar(ch,cls){
  const pools=itemsForClass(cls);const all=[];
  ['weapon','altweapon','armor','ability'].forEach(slot=>{
    const pool=slot==='weapon'?'weapons':slot==='altweapon'?'alt_weapons':slot==='armor'?'armors':'abilities';
    (pools[slot]||[]).forEach(i=>{const e=ch.items[pool+'::'+i.name];if(e&&e.count>0)all.push({pool,item:i,count:e.count,entry:e});});
  });
  // include rings
  DATA.rings.forEach(i=>{const e=ch.items['rings::'+i.name];if(e&&e.count>0)all.push({pool:'rings',item:i,count:e.count,entry:e});});
  const lost={};
  const bg=document.getElementById('modal-bg');
  const renderM=()=>{
    const totalLost=Object.values(lost).reduce((a,b)=>a+b,0);
    const totalOwned=all.reduce((a,x)=>a+x.count,0);
    const m=bg.querySelector('.modal');m.className='modal death-modal';
    const deathName=ch.name&&ch.name!==ch.className?ch.name+', the '+ch.className+' is Dead':ch.className+' is Dead';
    m.innerHTML=`<div class="death-header"><div class="death-header-grave">${gravestoneSvg((ch.pots||[]).length)}</div><div class="death-title">${esc(deathName)}</div><div class="death-sub">Select items carried at death. They will be lost. Everything else goes to the Vault.</div></div><div class="death-summary"><div><strong>${totalLost}</strong> lost · <strong>${totalOwned-totalLost}</strong> to Vault</div></div><div class="death-list">${all.length===0?'<div class="death-empty">No items obtained.</div>':all.map(o=>{const id=o.pool+'::'+o.item.name;const picked=lost[id]||0;return`<div class="death-row ${picked>0?'lost':''}" data-id="${esc(id)}"><div class="death-row-info"><span class="death-tier ${o.item.tier==='ST'?'st':'ut'}">${o.item.tier}</span><div class="death-row-name"><div>${esc(o.item.name)}</div><div class="death-row-drop">${esc(o.item.drop||'')}</div></div></div><div class="death-stepper"><button class="dstep" data-act="minus" ${picked===0?'disabled':''}>−</button><div class="dstep-val ${picked>0?'has':''}">${picked} / ${o.count}</div><button class="dstep" data-act="plus" ${picked>=o.count?'disabled':''}>+</button></div></div>`;}).join('')}</div><div class="modal-actions"><button class="btn" id="modal-cancel">Cancel</button><button class="btn danger" id="modal-ok">Confirm Death</button></div>`;
    m.querySelectorAll('.death-row').forEach(row=>{
      const id=row.dataset.id;const own=all.find(o=>o.pool+'::'+o.item.name===id);
      row.querySelector('[data-act="plus"]').addEventListener('click',()=>{const cur=lost[id]||0;if(cur<own.count){lost[id]=cur+1;renderM();}});
      row.querySelector('[data-act="minus"]').addEventListener('click',()=>{const cur=lost[id]||0;if(cur>0){lost[id]=cur-1;if(!lost[id])delete lost[id];renderM();}});
    });
    m.querySelector('#modal-cancel').onclick=()=>{bg.classList.remove('on');m.className='modal';};
    m.querySelector('#modal-ok').onclick=()=>{
      const lostItems=[],survivors=[];
      all.forEach(o=>{const id=o.pool+'::'+o.item.name;const nL=lost[id]||0;const nS=o.count-nL;
        if(nL>0)lostItems.push({pool:o.pool,name:o.item.name,tier:o.item.tier,drop:o.item.drop,count:nL,hadShiny:(o.entry.shinyCount||0)>0,hadAwaken:!!o.entry.awaken,awakenName:o.item.awaken||null});
        if(nS>0)survivors.push({pool:o.pool,name:o.item.name,tier:o.item.tier,drop:o.item.drop,count:nS,hadShiny:(o.entry.shinyCount||0)>0,hadAwaken:!!o.entry.awaken,awakenName:o.item.awaken||null});
      });
      const s=curSave();
      s.cemetery.unshift({id:'tomb_'+uid(),className:ch.className,charName:ch.name||ch.className,charId:ch.id,diedAt:Date.now(),items:lostItems,survivors,pots:[...ch.pots]});
      s.characters=s.characters.filter(c=>c.id!==ch.id);
      bg.classList.remove('on');m.className='modal';
      go('characters',{currentCharId:null});
    };
  };
  renderM();bg.classList.add('on');
}

export { killChar };
