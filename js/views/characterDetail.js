import { POTIONS, POT_FULL, POT_MAX } from '../data/game.js';
import { DATA } from '../data/items.js';
import { charCapacity, charHasRoom, charInventoryUsed, vaultCapacity, vaultHasRoom } from '../logic/account.js';
import { charStats, findItem, itemsForClass, mainDungeons } from '../logic/items.js';
import { vaultStats } from '../logic/vault.js';
import { VIEW, curChar, curSave, expandedAwakens, expandedSections, sv } from '../state.js';
import { alertModal, go, mkBack, mkControls, render, root } from '../ui/core.js';
import { classSpriteImg, itemSpriteImg, potSvg } from '../ui/icons.js';
import { esc, pluralize, wikiUrl } from '../utils.js';
import { openRenameModal } from './characters.js';
import { killChar } from './death.js';

// ═══ CHARACTER DETAIL ════════════════════════════════════
function renderCharDetail(){
  const ch=curChar();const s=curSave();
  if(!ch){go('characters');return;}
  const cls=DATA.classes.find(c=>c.name===ch.className);
  if(!cls){go('characters');return;}
  const st=charStats(ch);const pct=st.total?(st.done/st.total*100):0;
  const displayName=ch.name||ch.className;
  document.title=displayName+' — '+s.name;
  root.appendChild(mkBack('Back to Characters','characters'));

  // banner
  const banner=document.createElement('div');banner.className='class-banner';
  banner.innerHTML=`<div class="class-portrait">${classSpriteImg(ch.className)}</div><div class="class-banner-info"><h2 class="class-banner-name">${esc(displayName)} <button class="rename-btn" data-role="rename" title="Rename">✎</button></h2><div class="class-banner-sub">${esc(ch.className)}</div><div class="char-tag-toggles"><label class="tag-toggle crucible ${ch.crucible?'on':''}"><input type="checkbox" data-role="tag-crucible" ${ch.crucible?'checked':''}><span>Crucible</span></label><label class="tag-toggle seasonal ${ch.seasonal?'on':''}"><input type="checkbox" data-role="tag-seasonal" ${ch.seasonal?'checked':''}><span>Seasonal</span></label></div><div class="class-banner-progress"><span class="num">${st.done} / ${st.total}</span><div class="barbg"><div class="barfg" style="width:${pct}%"></div></div></div><button class="death-btn" data-role="die">Mark as Dead</button></div>`;
  banner.querySelector('[data-role="rename"]').addEventListener('click',()=>openRenameModal(ch));
  banner.querySelector('[data-role="die"]').addEventListener('click',()=>killChar(ch,cls));
  banner.querySelector('[data-role="tag-crucible"]').addEventListener('change',e=>{ch.crucible=e.target.checked;sv();render();});
  banner.querySelector('[data-role="tag-seasonal"]').addEventListener('change',e=>{ch.seasonal=e.target.checked;sv();render();});
  root.appendChild(banner);

  // pots
  root.appendChild(renderPots(ch));

  // mini stats
  const dng=mainDungeons(cls);
  const panels=document.createElement('div');panels.className='stat-panels';
  panels.innerHTML=`<div class="stat-panel"><div class="stat-panel-num ut">${st.utDone}/${st.ut}</div><div class="stat-panel-lbl">UT</div></div><div class="stat-panel"><div class="stat-panel-num st">${st.stDone}/${st.st}</div><div class="stat-panel-lbl">ST</div></div>${dng.length?`<div class="stat-panel" style="text-align:left;grid-column:span 2;"><div class="stat-panel-lbl" style="margin-bottom:6px;">Main Drops</div>${dng.map(([d,n])=>`<div style="font-size:12.5px;color:var(--text);margin:2px 0;">▸ ${esc(d)} <span style="color:var(--text-dim);">(${n})</span></div>`).join('')}</div>`:''}`;
  root.appendChild(panels);

  // ── inventory ──
  const invOrn=document.createElement('div');invOrn.className='ornament';invOrn.innerHTML='🎒 &nbsp;·&nbsp; I N V E N T O R Y &nbsp;·&nbsp; 🎒';
  root.appendChild(invOrn);
  root.appendChild(renderCharInventoryPanel(ch));

  const orn=document.createElement('div');orn.className='ornament';orn.innerHTML='❦ &nbsp;·&nbsp; L O O T &nbsp;·&nbsp; ❦';
  root.appendChild(orn);
  root.appendChild(mkControls(false));

  // ── Favorites collapsible section ──
  const pools=itemsForClass(cls);
  const allSections=[
    {key:'weapon',pool:'weapons',items:pools.weapon},
    {key:'altweapon',pool:'alt_weapons',items:pools.altweapon},
    {key:'armor',pool:'armors',items:pools.armor},
    {key:'ability',pool:'abilities',items:pools.ability},
    {key:'rings',pool:'rings',items:DATA.rings}
  ];
  // gather all favorited items across all pools for this character
  const favItems=[];
  allSections.forEach(sec=>{
    sec.items.forEach(i=>{
      const e=ch.items[sec.pool+'::'+i.name];
      if(e&&e.fav) favItems.push({pool:sec.pool,item:i});
    });
  });
  if(favItems.length>0){
    const favKey=ch.id+'::__fav__';const favOpen=expandedSections.has(favKey);
    const favCat=document.createElement('div');favCat.className='category collapsible'+(favOpen?' open':'');
    const favTitle=document.createElement('div');favTitle.className='cat-title clickable fav-section';
    favTitle.innerHTML=`<span class="cat-caret">${favOpen?'▾':'▸'}</span>★ Favorites<span class="cat-count">${favItems.length} items</span>`;
    favTitle.addEventListener('click',()=>{if(favOpen)expandedSections.delete(favKey);else expandedSections.add(favKey);render();});
    favCat.appendChild(favTitle);
    if(favOpen){
      const favBody=document.createElement('div');favBody.className='cat-body';
      const favGrid=document.createElement('div');favGrid.className='grid';
      const favFiltered=favItems.filter(({pool,item})=>matchFilter(ch,pool,item));
      if(!favFiltered.length) favGrid.innerHTML=`<div class="empty-cat">No favorites match the filter.</div>`;
      else favFiltered.sort((a,b)=>a.item.name.localeCompare(b.item.name)).forEach(({pool,item})=>favGrid.appendChild(mkItemCard(ch,pool,item)));
      favBody.appendChild(favGrid);
      favCat.appendChild(favBody);
    }
    root.appendChild(favCat);
  }

  // item sections
  [{key:'weapon',pool:'weapons',label:pluralize(cls.weapon),items:pools.weapon},
   {key:'altweapon',pool:'alt_weapons',label:pluralize(cls.alt_weapon),items:pools.altweapon},
   {key:'armor',pool:'armors',label:pluralize(cls.armor),items:pools.armor},
   {key:'ability',pool:'abilities',label:pluralize(cls.ability),items:pools.ability},
   {key:'rings',pool:'rings',label:'Rings',items:DATA.rings}
  ].forEach(sec=>{
    const doneCount=sec.items.filter(i=>{const e=ch.items[sec.pool+'::'+i.name];return e&&e.count>0;}).length;
    const sKey=ch.id+'::'+sec.key;const isOpen=expandedSections.has(sKey);
    const catEl=document.createElement('div');catEl.className='category collapsible'+(isOpen?' open':'');
    const title=document.createElement('div');title.className='cat-title clickable';
    title.innerHTML=`<span class="cat-caret">${isOpen?'▾':'▸'}</span>${esc(sec.label)}<span class="cat-count">${doneCount}/${sec.items.length}</span>`;
    title.addEventListener('click',()=>{if(isOpen)expandedSections.delete(sKey);else expandedSections.add(sKey);render();});
    catEl.appendChild(title);
    if(isOpen){
      const body=document.createElement('div');body.className='cat-body';
      if(sec.items.length===0){body.innerHTML=`<div class="empty-hint">No items registered yet.</div>`;}
      else{
        ['UT','ST'].forEach(tier=>{
          const bucket=sec.items.filter(i=>i.tier===tier);if(!bucket.length)return;
          const sorted=[...bucket].sort((a,b)=>a.name.localeCompare(b.name));
          const tierKey=sKey+'::'+tier;const tierOpen=expandedSections.has(tierKey);
          const bDone=bucket.filter(i=>{const e=ch.items[sec.pool+'::'+i.name];return e&&e.count>0;}).length;
          const sub=document.createElement('div');sub.className='subgroup collapsible'+(tierOpen?' open':'');
          const lbl=document.createElement('div');lbl.className='subgroup-label clickable '+(tier==='UT'?'is-ut':'is-st');
          lbl.innerHTML=`<span class="cat-caret">${tierOpen?'▾':'▸'}</span>${tier==='UT'?'Untiered':'Set Tier'}<span class="subgroup-count">${bDone}/${bucket.length}</span>`;
          lbl.addEventListener('click',()=>{if(tierOpen)expandedSections.delete(tierKey);else expandedSections.add(tierKey);render();});
          sub.appendChild(lbl);
          if(tierOpen){
            const filtered=sorted.filter(i=>matchFilter(ch,sec.pool,i));
            const gr=document.createElement('div');gr.className='grid';
            if(!filtered.length)gr.innerHTML=`<div class="empty-cat">No items match the filter.</div>`;
            else filtered.forEach(i=>gr.appendChild(mkItemCard(ch,sec.pool,i)));
            sub.appendChild(gr);
          }
          body.appendChild(sub);
        });
      }
      catEl.appendChild(body);
    }
    root.appendChild(catEl);
  });
}

// potions
function renderPots(ch){
  const sel=ch.pots||[];const count=sel.length;const full=count>=POT_MAX;
  const last=POTIONS.find(p=>p.key===sel[sel.length-1]);
  const color=full?POT_FULL:(last?last.color:'');
  const w=document.createElement('div');w.className='potion-tracker';
  w.innerHTML=`<div class="potion-header"><div class="potion-count ${full?'filled':''}" style="${color?`color:${color}`:''}">${count} / ${POT_MAX}</div><div class="potion-label">Stats Maxed</div></div><div class="potion-row">${POTIONS.map(p=>{const consumed=sel.includes(p.key);const liq=full?POT_FULL:consumed?p.color:'#3a3530';return`<div class="pot ${consumed?'consumed':'empty'}" data-pot="${p.key}">${potSvg(liq)}<div class="pot-name">${p.short}</div></div>`;}).join('')}</div>${count>0?'<button class="potion-reset" data-role="reset">Reset</button>':''}`;
  w.querySelectorAll('.pot').forEach(el=>el.addEventListener('click',()=>{const k=el.dataset.pot;const i=ch.pots.indexOf(k);if(i>=0)ch.pots.splice(i,1);else ch.pots.push(k);sv();render();}));
  const rb=w.querySelector('[data-role="reset"]');if(rb)rb.addEventListener('click',()=>{ch.pots=[];sv();render();});
  return w;
}
// item card
function matchFilter(ch,pool,item){
  const e=ch.items[pool+'::'+item.name]||{};const has=(e.count||0)>0;
  if(VIEW.filter==='pending'&&has)return false;if(VIEW.filter==='done'&&!has)return false;
  if(VIEW.search){const h=(item.name+' '+item.drop+' '+(item.awaken||'')).toLowerCase();if(!h.includes(VIEW.search))return false;}
  return true;
}
function renderCharInventoryPanel(ch){
  const s=curSave();
  const cap=charCapacity(ch);const used=charInventoryUsed(ch);
  const pct=cap?Math.min(100,used/cap*100):0;const over=used>cap;
  const onHand=[];
  for(const key in ch.items){
    const e=ch.items[key];const onHandCount=(e.count||0)-(e.vaultCount||0);
    if(onHandCount>0){
      const sep=key.indexOf('::');const pool=key.slice(0,sep);const name=key.slice(sep+2);
      const item=findItem(pool,name);if(item)onHand.push({pool,item,entry:e,onHandCount});
    }
  }
  onHand.sort((a,b)=>a.item.name.localeCompare(b.item.name));

  const wrap=document.createElement('div');wrap.className='char-inventory-panel';
  wrap.innerHTML=`
    <div class="char-inv-header">
      <div class="char-inv-cap ${over?'over':''}">${used}/${cap} slots used</div>
      <label class="tag-toggle backpack ${ch.backpack?'on':''}"><input type="checkbox" data-role="tag-backpack"${ch.backpack?' checked':''}><span>Backpack (+8 slots)</span></label>
    </div>
    <div class="char-inv-bar"><div class="char-inv-fill ${over?'over':''}" style="width:${pct}%"></div></div>
    ${onHand.length?`<div class="char-inv-list">${onHand.map(o=>{
      const key=o.pool+'::'+o.item.name;
      const shinyTxt=o.entry.shinyCount>0?` <span class="inv-shiny-tag">✦${o.entry.shinyCount>1?'×'+o.entry.shinyCount:''}</span>`:'';
      return `<div class="char-inv-row">
        <div class="icon-slot ${o.item.tier==='ST'?'st':'ut'} small">${itemSpriteImg(o.pool,o.item.name)}</div>
        <div class="char-inv-name">${esc(o.item.name)}${shinyTxt}</div>
        <div class="char-inv-count">×${o.onHandCount}</div>
        <button class="btn small" data-role="send-vault" data-key="${esc(key)}">→ Vault</button>
      </div>`;
    }).join('')}</div>`:`<div class="empty-hint" style="padding:14px 0;">Nothing on hand — check off items below as you find them.</div>`}
  `;
  wrap.querySelector('[data-role="tag-backpack"]').addEventListener('change',e=>{ch.backpack=e.target.checked;sv();render();});
  wrap.querySelectorAll('[data-role="send-vault"]').forEach(btn=>btn.addEventListener('click',()=>{
    const key=btn.dataset.key;const e=ch.items[key];if(!e)return;
    if(!vaultHasRoom(s,1)){alertModal(`Your vault is full (${vaultStats().total}/${vaultCapacity(s)} slots used). Add more Vault Chests in Account Progression first.`);return;}
    e.vaultCount=(e.vaultCount||0)+1;
    sv();render();
  }));
  return wrap;
}

function mkItemCard(ch,pool,item){
  const key=pool+'::'+item.name;if(!ch.items[key])ch.items[key]={count:0,shinyCount:0,vaultCount:0,awaken:false,fav:false};
  const entry=ch.items[key];const has=entry.count>0;const isSt=item.tier==='ST';
  const el=document.createElement('div');el.className='item'+(has?' done':'')+(entry.fav?' fav':'');
  const chips=[];if(item.shiny)chips.push({key:'shiny',label:'Shiny'});if(item.awaken)chips.push({key:'awaken',label:'Awakened',name:item.awaken});
  const countBadge=entry.count>1?`<span class="count-badge">×${entry.count}</span>`:'';
  const awExpKey=ch.id+'::'+key;
  el.innerHTML=`<div class="item-top-row"><div class="icon-slot ${isSt?'st':'ut'}">${itemSpriteImg(pool,item.name)}</div><div class="item-info"><div class="item-name"><a href="${wikiUrl(item.name)}" target="_blank" rel="noopener">${esc(item.name)}</a>${countBadge}</div><div class="item-loc">${item.drop?'📍 '+esc(item.drop):'<span style="color:var(--text-mute);">drop pendente</span>'}</div></div><div class="item-actions"><div class="check" data-role="check" title="Toggle obtained">${has?'✓':''}</div><div class="fav-star ${entry.fav?'on':''}" data-role="fav">★</div>${has?'<div class="stepper"><button class="step-btn" data-role="minus">−</button><button class="step-btn" data-role="plus">+</button></div>':''}</div></div>${chips.length?`<div class="variant-row">${chips.map(c=>{
    if(c.key==='awaken'){const exp=expandedAwakens.has(awExpKey);return`<div class="variant-chip awaken ${entry.awaken?'on':''} ${exp?'expanded':''}" data-key="awaken"><span class="chip-body" data-role="chip-toggle"><span class="dot"></span>${c.label}</span><span class="chip-arrow" data-role="chip-expand">${exp?'▴':'▾'}</span></div>`;}
    const sc=entry.shinyCount||0;const scLabel=entry.count>1?`${c.label} ${sc}/${entry.count}`:c.label;
    return`<div class="variant-chip shiny ${sc>0?'on':''}" data-key="shiny" title="${entry.count>1?'Click to set how many copies are shiny':'Click to toggle shiny'}"><span class="dot"></span>${scLabel}</div>`;
  }).join('')}</div>`:''}${(item.awaken&&expandedAwakens.has(awExpKey))?`<div class="awaken-name-panel">✧ ${esc(item.awaken)}</div>`:''}`;
  el.querySelector('[data-role="check"]').addEventListener('click',()=>{const ch2=ch;if(entry.count>0){entry.count=0;entry.shinyCount=0;entry.vaultCount=0;entry.awaken=false;}else{if(!charHasRoom(ch2,1)){alertModal(`${ch2.name||ch2.className}'s inventory is full (${charInventoryUsed(ch2)}/${charCapacity(ch2)} slots). Send items to the Vault or add a Backpack to free up room.`);return;}entry.count=1;}sv();render();});
  const plus=el.querySelector('[data-role="plus"]');if(plus)plus.addEventListener('click',()=>{if(!charHasRoom(ch,1)){alertModal(`${ch.name||ch.className}'s inventory is full (${charInventoryUsed(ch)}/${charCapacity(ch)} slots). Send items to the Vault or add a Backpack to free up room.`);return;}entry.count++;sv();render();});
  const minus=el.querySelector('[data-role="minus"]');if(minus)minus.addEventListener('click',()=>{entry.count=Math.max(0,entry.count-1);entry.shinyCount=Math.min(entry.shinyCount||0,entry.count);entry.vaultCount=Math.min(entry.vaultCount||0,entry.count);if(!entry.count){entry.awaken=false;}sv();render();});
  el.querySelector('[data-role="fav"]').addEventListener('click',()=>{entry.fav=!entry.fav;sv();render();});
  el.querySelectorAll('.variant-chip').forEach(chip=>{
    const k2=chip.dataset.key;
    if(k2==='awaken'){
      chip.querySelector('[data-role="chip-toggle"]').addEventListener('click',e=>{e.stopPropagation();if(!entry.count)return;entry.awaken=!entry.awaken;sv();render();});
      chip.querySelector('[data-role="chip-expand"]').addEventListener('click',e=>{e.stopPropagation();if(expandedAwakens.has(awExpKey))expandedAwakens.delete(awExpKey);else expandedAwakens.add(awExpKey);render();});
    } else if(k2==='shiny'){
      chip.addEventListener('click',()=>{if(!entry.count)return;entry.shinyCount=((entry.shinyCount||0)+1)%(entry.count+1);sv();render();});
    }
  });
  return el;
}

export { renderCharDetail, renderPots, matchFilter, renderCharInventoryPanel, mkItemCard };
