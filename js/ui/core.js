import { STATE, VIEW, sv } from '../state.js';
import { esc } from '../utils.js';
import { renderCemetery } from '../views/cemetery.js';
import { renderCharDetail } from '../views/characterDetail.js';
import { renderChars } from '../views/characters.js';
import { renderHome } from '../views/home.js';
import { renderIndex } from '../views/itemIndex.js';
import { renderPets } from '../views/pets.js';
import { renderRings } from '../views/rings.js';
import { renderSaves } from '../views/saves.js';
import { renderItems, renderVault } from '../views/vault.js';

// ── rendering ─────────────────────────────────────────────
const root=document.getElementById('root');
function go(view,extra){
  STATE.view=view;
  if(extra)Object.assign(STATE,extra);
  VIEW.filter='all';VIEW.search='';
  sv();render();
}
function render(){
  root.innerHTML='';
  const v=STATE.view;
  if(!STATE.currentSave||v==='saves'){renderSaves();return;}
  if(v==='home'){renderHome();return;}
  if(v==='characters'){renderChars();return;}
  if(v==='charDetail'){renderCharDetail();return;}
  if(v==='items'){renderItems();return;}
  if(v==='vault'){renderVault();return;}
  if(v==='rings'){renderRings();return;}
  if(v==='index'){renderIndex();return;}
  if(v==='cemetery'){renderCemetery();return;}
  if(v==='pets'){renderPets();return;}
  renderHome();
}

function mkHeader(title,sub,prog){
  const h=document.createElement('header');
  const pHtml=prog?`<div class="progress-box"><div class="progress-num">${prog.done}/${prog.total}</div><div class="progress-label">${prog.label||'items'}</div><div class="barbg"><div class="barfg" style="width:${prog.total?(prog.done/prog.total*100):0}%"></div></div></div>`:'';
  h.innerHTML=`<h1>${esc(title)}<span>${esc(sub)}</span></h1>${pHtml}`;return h;
}
function mkBack(label,target,extra){const b=document.createElement('button');b.className='back-btn';b.innerHTML=esc(label);b.addEventListener('click',()=>go(target,extra||{}));return b;}
function mkControls(fav){
  const c=document.createElement('div');c.className='controls';
  c.innerHTML=`<input type="text" id="search" placeholder="Search..." value="${esc(VIEW.search)}"><button class="filter-btn ${VIEW.filter==='all'?'active':''}" data-f="all">All</button><button class="filter-btn ${VIEW.filter==='pending'?'active':''}" data-f="pending">Missing</button><button class="filter-btn ${VIEW.filter==='done'?'active':''}" data-f="done">Obtained</button>${fav?`<button class="filter-btn fav ${VIEW.filter==='fav'?'active':''}" data-f="fav">★ Fav</button>`:''}`;
  c.querySelector('#search').addEventListener('input',e=>{VIEW.search=e.target.value.toLowerCase();render();refocusSearch();});
  c.querySelectorAll('.filter-btn').forEach(b=>b.addEventListener('click',()=>{VIEW.filter=b.dataset.f;render();}));
  return c;
}
function refocusSearch(){
  requestAnimationFrame(()=>{
    const el=document.getElementById('search');
    if(el){el.focus();const len=el.value.length;el.setSelectionRange(len,len);}
  });
}
function confirmModal(text,onOk){const bg=document.getElementById('modal-bg');bg.querySelector('.modal').innerHTML=`<p>${esc(text)}</p><div class="modal-actions"><button class="btn" id="modal-cancel">Cancel</button><button class="btn danger" id="modal-ok">Confirm</button></div>`;bg.classList.add('on');bg.querySelector('#modal-ok').onclick=()=>{bg.classList.remove('on');onOk();};bg.querySelector('#modal-cancel').onclick=()=>bg.classList.remove('on');}
function alertModal(text){
  const bg=document.getElementById('modal-bg');const m=bg.querySelector('.modal');
  m.className='modal';
  m.innerHTML=`<p>${esc(text)}</p><div class="modal-actions"><button class="btn primary" id="modal-ok">OK</button></div>`;
  bg.classList.add('on');
  m.querySelector('#modal-ok').onclick=()=>bg.classList.remove('on');
}

export { root, go, render, mkHeader, mkBack, mkControls, refocusSearch, confirmModal, alertModal };
