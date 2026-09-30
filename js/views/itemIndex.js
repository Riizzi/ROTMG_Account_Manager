import { DATA } from '../data/items.js';
import { VIEW, curSave } from '../state.js';
import { mkBack, mkHeader, refocusSearch, render, root } from '../ui/core.js';
import { itemSpriteImg } from '../ui/icons.js';
import { esc, wikiUrl } from '../utils.js';

// ═══ ITEM INDEX ══════════════════════════════════════════
function renderIndex(){
  const s=curSave();document.title='Item Index — '+s.name;
  root.appendChild(mkBack('Back to '+s.name,'home'));
  root.appendChild(mkHeader('Item Index','Browse the full catalog'));
  const search=document.createElement('div');search.className='controls';
  search.innerHTML=`<input type="text" id="search" placeholder="Search any item by name, drop, awakening..." value="${esc(VIEW.search)}">`;
  search.querySelector('#search').addEventListener('input',e=>{VIEW.search=e.target.value.toLowerCase();render();refocusSearch();});
  root.appendChild(search);
  if(!VIEW.search){root.appendChild(Object.assign(document.createElement('div'),{className:'empty-hint',innerHTML:'Type to search across all items in the game.'}));return;}
  const allItems=[...DATA.weapons.map(i=>({pool:'weapons',item:i})),...DATA.alt_weapons.map(i=>({pool:'alt_weapons',item:i})),...DATA.armors.map(i=>({pool:'armors',item:i})),...DATA.abilities.map(i=>({pool:'abilities',item:i})),...DATA.rings.map(i=>({pool:'rings',item:i}))];
  const filtered=allItems.filter(({item:i})=>(i.name+' '+i.drop+' '+(i.awaken||'')+(i.type||'')).toLowerCase().includes(VIEW.search));
  if(!filtered.length){root.appendChild(Object.assign(document.createElement('div'),{className:'empty-cat',textContent:'No items match "'+VIEW.search+'".'}));return;}
  const gr=document.createElement('div');gr.className='grid';
  filtered.slice(0,50).forEach(({pool,item})=>{
    const el=document.createElement('div');el.className='item';const isSt=item.tier==='ST';
    const chips=[];if(item.shiny)chips.push('Shiny');if(item.awaken)chips.push('Awakened');
    el.innerHTML=`<div class="item-top-row"><div class="icon-slot ${isSt?'st':'ut'}">${itemSpriteImg(pool,item.name)}</div><div class="item-info"><div class="item-name"><a href="${wikiUrl(item.name)}" target="_blank" rel="noopener">${esc(item.name)}</a> <span style="font-size:10px;color:var(--text-mute);">${esc(item.type||pool)}</span></div><div class="item-loc">${item.drop?'📍 '+esc(item.drop):''}</div>${item.awaken?`<div class="item-loc" style="color:var(--awaken);opacity:.85;">✧ ${esc(item.awaken)}</div>`:''}</div></div>${chips.length?`<div class="variant-row">${chips.map(c=>`<div class="variant-chip ${c==='Shiny'?'shiny':'awaken'} readonly" style="opacity:1;cursor:default;"><span class="dot"></span>${c}</div>`).join('')}</div>`:''}`;
    gr.appendChild(el);
  });
  root.appendChild(gr);
  if(filtered.length>50)root.appendChild(Object.assign(document.createElement('div'),{className:'empty-cat',textContent:`Showing 50 of ${filtered.length} results. Refine your search.`}));
}

export { renderIndex };
