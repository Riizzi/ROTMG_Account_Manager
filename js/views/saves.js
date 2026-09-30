import { saveStats } from '../logic/items.js';
import { STATE, emptySave, sv } from '../state.js';
import { confirmModal, go, render, root } from '../ui/core.js';
import { esc } from '../utils.js';

// ═══ SAVES ═══════════════════════════════════════════════
function renderSaves(){
  STATE.currentSave=null;STATE.view='saves';
  document.title='RotMG Account Manager';
  root.innerHTML=`<div class="saves-title">RotMG Account Manager</div><div class="saves-sub">Select or create an account</div>`;
  const g=document.createElement('div');g.className='saves-grid';
  ["1","2","3"].forEach(k=>{
    const s=STATE.saves[k];
    if(!s){
      const slot=document.createElement('div');slot.className='save-slot-empty';
      slot.innerHTML=`<div class="plus">+</div><div class="hint">New Account</div>`;
      slot.addEventListener('click',()=>{STATE.saves[k]=emptySave('Account '+k);sv();render();});
      g.appendChild(slot);
    } else {
      const st=saveStats(k);
      const card=document.createElement('div');card.className='save-card';
      card.innerHTML=`
        <div class="save-name-display">${esc(s.name)} <button class="rename-btn" data-a="rename" title="Rename">✎</button></div>
        <div class="save-stat" style="margin-top:10px;">Characters 8/8: <strong>${st.maxed}</strong>/${st.charCount}</div>
        <div class="save-actions">
          <button class="btn danger" data-a="del">Delete</button>
          <button class="btn primary" data-a="open">Continue</button>
        </div>`;
      card.addEventListener('click',e=>{if(e.target.closest('[data-a="del"]')||e.target.closest('[data-a="rename"]'))return;go('home',{currentSave:k});});
      card.querySelector('[data-a="rename"]').addEventListener('click',e=>{e.stopPropagation();openSaveRenameModal(s,k);});
      card.querySelector('[data-a="del"]').addEventListener('click',e=>{e.stopPropagation();confirmModal(`Delete "${s.name}"? All progress will be lost.`,()=>{STATE.saves[k]=null;sv();render();});});
      g.appendChild(card);
    }
  });
  root.appendChild(g);
  root.appendChild(Object.assign(document.createElement('footer'),{innerHTML:'Progress saved in localStorage.'}));
}

function openSaveRenameModal(s,k){
  const bg=document.getElementById('modal-bg');const m=bg.querySelector('.modal');
  m.className='modal rename-modal';
  m.innerHTML=`
    <div class="rename-header">
      <div class="rename-title">Name Your Account</div>
      <div class="rename-sub">Choose a name for this save slot.</div>
    </div>
    <input class="rename-input" id="rename-val" type="text" value="${esc(s.name)}" maxlength="24" placeholder="Account ${k}" autofocus>
    <div class="modal-actions">
      <button class="btn" id="modal-cancel">Cancel</button>
      <button class="btn primary" id="modal-ok">Confirm</button>
    </div>`;
  bg.classList.add('on');
  setTimeout(()=>{const inp=document.getElementById('rename-val');if(inp){inp.focus();inp.select();}},50);
  m.querySelector('#modal-ok').onclick=()=>{
    const val=(document.getElementById('rename-val').value||'').trim();
    s.name=val||'Account '+k;
    bg.classList.remove('on');m.className='modal';sv();render();
  };
  m.querySelector('#modal-cancel').onclick=()=>{bg.classList.remove('on');m.className='modal';};
  m.querySelector('#rename-val').addEventListener('keydown',e=>{if(e.key==='Enter')m.querySelector('#modal-ok').click();});
}

export { renderSaves, openSaveRenameModal };
