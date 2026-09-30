import { DATA } from '../data/items.js';
import { vaultCapacity, vaultHasRoom } from '../logic/account.js';
import { ringsDone } from '../logic/items.js';
import { vaultStats } from '../logic/vault.js';
import { VIEW, curSave, getRingEntry, sv } from '../state.js';
import { alertModal, mkBack, mkControls, mkHeader, render, root } from '../ui/core.js';
import { itemSpriteImg } from '../ui/icons.js';
import { esc, wikiUrl } from '../utils.js';

// ═══ RINGS ═══════════════════════════════════════════════
function renderRings(){
  const s=curSave();document.title='Rings — '+s.name;
  root.appendChild(mkBack('Back to Items','items'));
  root.appendChild(mkHeader('◈ Rings','Account-wide ring collection',{done:ringsDone(),total:DATA.rings.length}));
  root.appendChild(mkControls(true));
  ['UT','ST'].forEach(tier=>{
    const bucket=DATA.rings.filter(i=>i.tier===tier);if(!bucket.length)return;
    const sorted=[...bucket].sort((a,b)=>a.name.localeCompare(b.name));
    const filtered=sorted.filter(i=>{const e=s.rings[i.name]||{};const has=(e.count||0)>0;if(VIEW.filter==='pending'&&has)return false;if(VIEW.filter==='done'&&!has)return false;if(VIEW.search&&!(i.name+' '+i.drop).toLowerCase().includes(VIEW.search))return false;return true;});
    const doneCount=bucket.filter(i=>(s.rings[i.name]||{}).count>0).length;
    const cat=document.createElement('div');cat.className='category';
    cat.innerHTML=`<div class="cat-title">${tier==='UT'?'Untiered':'Set Tier'} Rings <span class="cat-count">${doneCount}/${bucket.length}</span></div>`;
    const gr=document.createElement('div');gr.className='grid';
    if(!filtered.length)gr.innerHTML=`<div class="empty-cat">No items match the filter.</div>`;
    else filtered.forEach(i=>gr.appendChild(mkRingCard(i)));
    cat.appendChild(gr);root.appendChild(cat);
  });
}
function mkRingCard(item){
  const s=curSave();const entry=getRingEntry(item.name);const has=entry.count>0;const isSt=item.tier==='ST';
  const el=document.createElement('div');el.className='item'+(has?' done':'')+(entry.fav?' fav':'');
  const countBadge=entry.count>1?`<span class="count-badge">×${entry.count}</span>`:'';
  const chips=[];if(item.shiny)chips.push({key:'shiny',label:'Shiny'});if(item.awaken)chips.push({key:'awaken',label:'Awakened'});
  el.innerHTML=`<div class="item-top-row"><div class="icon-slot ${isSt?'st':'ut'}">${itemSpriteImg('rings',item.name)}</div><div class="item-info"><div class="item-name"><a href="${wikiUrl(item.name)}" target="_blank" rel="noopener">${esc(item.name)}</a>${countBadge}</div><div class="item-loc">${item.drop?'📍 '+esc(item.drop):''}</div></div><div class="item-actions"><div class="check" data-role="check">${has?'✓':''}</div><div class="fav-star ${entry.fav?'on':''}" data-role="fav">★</div>${has?'<div class="stepper"><button class="step-btn" data-role="minus">−</button><button class="step-btn" data-role="plus">+</button></div>':''}</div></div>${chips.length?`<div class="variant-row">${chips.map(c=>{
    if(c.key==='awaken')return`<div class="variant-chip awaken ${entry.awaken?'on':''}" data-key="awaken"><span class="dot"></span>${c.label}</div>`;
    const sc=entry.shinyCount||0;const scLabel=entry.count>1?`${c.label} ${sc}/${entry.count}`:c.label;
    return`<div class="variant-chip shiny ${sc>0?'on':''}" data-key="shiny" title="${entry.count>1?'Click to set how many copies are shiny':'Click to toggle shiny'}"><span class="dot"></span>${scLabel}</div>`;
  }).join('')}</div>`:''}`;
  el.querySelector('[data-role="check"]').addEventListener('click',()=>{const s=curSave();if(entry.count>0){entry.count=0;entry.shinyCount=0;entry.awaken=false;}else{if(!vaultHasRoom(s,1)){alertModal(`Your vault is full (${vaultStats().total}/${vaultCapacity(s)} slots used). Add more Vault Chests in Account Progression, or free up space first.`);return;}entry.count=1;}sv();render();});
  const plus=el.querySelector('[data-role="plus"]');if(plus)plus.addEventListener('click',()=>{const s=curSave();if(!vaultHasRoom(s,1)){alertModal(`Your vault is full (${vaultStats().total}/${vaultCapacity(s)} slots used). Add more Vault Chests in Account Progression, or free up space first.`);return;}entry.count++;sv();render();});
  const minus=el.querySelector('[data-role="minus"]');if(minus)minus.addEventListener('click',()=>{entry.count=Math.max(0,entry.count-1);entry.shinyCount=Math.min(entry.shinyCount||0,entry.count);if(!entry.count){entry.awaken=false;}sv();render();});
  el.querySelector('[data-role="fav"]').addEventListener('click',()=>{entry.fav=!entry.fav;sv();render();});
  el.querySelectorAll('.variant-chip').forEach(chip=>{
    const k=chip.dataset.key;
    chip.addEventListener('click',()=>{
      if(!entry.count)return;
      if(k==='shiny') entry.shinyCount=((entry.shinyCount||0)+1)%(entry.count+1);
      else entry.awaken=!entry.awaken;
      sv();render();
    });
  });
  return el;
}

export { renderRings, mkRingCard };
