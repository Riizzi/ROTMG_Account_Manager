import { EXALT_MAX, EXALT_MILESTONES, EXALT_PER_CLASS, EXALT_STATS, EXALT_TOTAL } from '../data/game.js';
import { DATA } from '../data/items.js';
import { accountExaltTotal, classExaltTotal, exaltTier, getExalts } from '../logic/exalts.js';
import { sv } from '../state.js';
import { confirmModal, render } from '../ui/core.js';
import { classSpriteImg } from '../ui/icons.js';
import { esc } from '../utils.js';

// \u2500\u2500 exaltation section \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function openExaltInfoModal(){
  const bg=document.getElementById('modal-bg');const m=bg.querySelector('.modal');
  m.className='modal exalt-info-modal';
  const rows=EXALT_STATS.map(st=>`<div class="exalt-info-row"><div class="exalt-info-stat" style="color:${st.color};">${esc(st.name)}</div><div class="exalt-info-dungeons">${st.dungeons.map(d=>esc(d)).join(', ')}</div></div>`).join('');
  m.innerHTML=`
    <h2 class="pet-modal-title">Exalt Dungeons</h2>
    <p class="exalt-info-sub">Each stat's 5 exalt milestones are earned by completing these dungeons for that class. Completions accumulate per stat, per class, and are permanent — they're never lost on death.</p>
    <div class="exalt-info-list">${rows}</div>
    <div class="modal-actions"><button class="btn primary" id="modal-ok">Got it</button></div>
  `;
  m.querySelector('#modal-ok').onclick=()=>{bg.classList.remove('on');m.className='modal';};
  bg.classList.add('on');
}
function renderExaltSection(s){
  const wrap=document.createElement('div');wrap.className='exalt-section';
  const totalEx=accountExaltTotal(s);
  const pct=EXALT_TOTAL?(totalEx/EXALT_TOTAL*100):0;
  if(!s.exaltLocked) s.exaltLocked=false;
  const locked=s.exaltLocked;
  let nextMs=EXALT_MILESTONES.find(m=>m.at>totalEx);
  const nextMsHtml=nextMs?`<div class="exalt-next">Next reward at <strong>${nextMs.at}</strong>: ${esc(nextMs.reward)}</div>`:`<div class="exalt-next" style="color:var(--gold-bright);">All milestones achieved!</div>`;
  const msHtml=EXALT_MILESTONES.map(m=>{
    const done=totalEx>=m.at;
    return `<div class="exalt-ms ${done?'done':''}" title="${m.reward}"><div class="exalt-ms-num">${m.at}</div><div class="exalt-ms-dot">${done?'\u2713':'\u25cb'}</div></div>`;
  }).join('');
  wrap.innerHTML=`
    <div class="exalt-overview">
      <div class="exalt-controls">
        <button class="btn" data-role="exinfo" title="Which dungeons count for each stat">ℹ Info</button>
        <button class="btn ${locked?'primary':''}" data-role="lock" title="${locked?'Unlock editing':'Lock to prevent misclicks'}">${locked?'🔒 Locked':'🔓 Unlocked'}</button>
        <button class="btn danger" data-role="exreset" title="Reset all exaltations" ${locked?'disabled':''}>Reset All</button>
      </div>
      <div class="exalt-total">
        <div class="exalt-total-num">${totalEx}<span class="exalt-total-of"> / ${EXALT_TOTAL}</span></div>
        <div class="exalt-total-lbl">Total Exaltations</div>
        <div class="exalt-total-bar barbg" style="width:100%;"><div class="barfg" style="width:${pct}%;background:linear-gradient(90deg,#8b3d9e,#f5a623);"></div></div>
      </div>
      ${nextMsHtml}
      <div class="exalt-milestones">${msHtml}</div>
    </div>
  `;
  wrap.querySelector('[data-role="lock"]').addEventListener('click',()=>{s.exaltLocked=!s.exaltLocked;sv();render();});
  wrap.querySelector('[data-role="exinfo"]').addEventListener('click',()=>openExaltInfoModal());
  const resetBtn=wrap.querySelector('[data-role="exreset"]');
  if(resetBtn)resetBtn.addEventListener('click',()=>{if(locked)return;confirmModal('Reset ALL exaltations for this account? This cannot be undone.',()=>{s.exalts={};sv();render();});});
  const classGrid=document.createElement('div');classGrid.className='exalt-class-grid';
  DATA.classes.forEach(cls=>{
    const ex=getExalts(s,cls.name);
    const total=classExaltTotal(s,cls.name);
    const tier=exaltTier(ex);
    const row=document.createElement('div');row.className='exalt-class-row'+(total>=EXALT_PER_CLASS?' full':'');
    const statsHtml=EXALT_STATS.map(st=>{
      const val=ex[st.key]||0;
      const pips=Array.from({length:EXALT_MAX},(_,i)=>`<div class="exalt-pip ${i<val?'on':''}" style="${i<val?'background:'+st.color+';border-color:'+st.color:''}"></div>`).join('');
      return `<div class="exalt-stat-col" data-cls="${esc(cls.name)}" data-stat="${st.key}">
        <div class="exalt-stat-name" style="color:${st.color};">${st.key==='lif'?'LIFE':st.key==='man'?'MANA':st.key.toUpperCase()}</div>
        <div class="exalt-pips">${pips}</div>
      </div>`;
    }).join('');
    row.innerHTML=`
      <div class="exalt-class-head">
        <div class="exalt-class-icon">${classSpriteImg(cls.name)}</div>
        <div class="exalt-class-name">${esc(cls.name)}</div>
        <div class="exalt-class-total">${total}/${EXALT_PER_CLASS}</div>
      </div>
      <div class="exalt-stats-row">${statsHtml}</div>
    `;
    row.querySelectorAll('.exalt-stat-col').forEach(col=>{
      if(!locked){
        col.style.cursor='pointer';
        col.addEventListener('click',()=>{
          const clsN=col.dataset.cls,statK=col.dataset.stat;
          const exObj=getExalts(s,clsN);
          exObj[statK]=(exObj[statK]||0)+1;
          if(exObj[statK]>EXALT_MAX) exObj[statK]=0;
          sv();render();
        });
      } else {
        col.style.cursor='default';
      }
    });
    classGrid.appendChild(row);
  });
  wrap.appendChild(classGrid);
  return wrap;
}

export { openExaltInfoModal, renderExaltSection };
