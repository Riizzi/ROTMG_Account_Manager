import { POTIONS, POT_MAX } from '../data/game.js';
import { curSave, sv } from '../state.js';
import { confirmModal, mkBack, mkHeader, render, root } from '../ui/core.js';
import { gravestoneSvg, potSvg } from '../ui/icons.js';
import { esc, fmtDate } from '../utils.js';

// ═══ CEMETERY ════════════════════════════════════════════
function renderCemetery(){
  const s=curSave();document.title='Cemetery \u2014 '+s.name;
  root.appendChild(mkBack('Back to Characters','characters'));
  root.appendChild(mkHeader('Cemetery','Memorials of the fallen'));
  if(s.cemetery.length===0){
    root.appendChild(Object.assign(document.createElement('div'),{className:'empty-hint',innerHTML:'No heroes have fallen... <em>yet.</em><br><span style="font-size:11px;margin-top:6px;display:block;color:var(--text-mute);">When a character dies, their memorial will appear here.</span>'}));
    return;
  }
  const cg=document.createElement('div');cg.className='cemetery-grid';
  s.cemetery.forEach(t2=>cg.appendChild(renderTomb(t2)));
  root.appendChild(cg);
}
function renderTomb(t){
  const el=document.createElement('div');el.className='tomb';
  const countTag=(it)=>(it.count&&it.count>1)?` ×${it.count}`:'';
  const tombName=(t.charName&&t.charName!==t.className)?t.charName+', the '+t.className:t.className;
  const stage=(t.pots||[]).length;
  el.innerHTML=`<div class="tomb-top">
      <div class="tomb-grave-badge"><div class="tomb-grave-icon">${gravestoneSvg(stage)}</div><div class="tomb-grave-label">${stage}/${POT_MAX}</div></div>
      <div class="tomb-info"><div class="tomb-title">${esc(tombName)}</div><div class="tomb-date">Fell on ${fmtDate(t.diedAt)}</div></div>
      <button class="tomb-delete" data-role="del">✕</button>
    </div><div class="tomb-stats"><div><span>${t.items.reduce((a,it)=>a+(it.count||1),0)}</span> lost</div><div><span>${(t.survivors||[]).reduce((a,it)=>a+(it.count||1),0)}</span> to vault</div></div><div class="tomb-items">${t.items.length===0?'<div class="tomb-empty">Died empty-handed.</div>':t.items.map(it=>`<div class="tomb-item"><span class="tag ${it.tier==='ST'?'st':'ut'}">${it.tier}</span><span class="n">${esc(it.name)}${countTag(it)}</span><span class="marks">${it.hadShiny?'<span class="mark shiny">S</span>':''}${it.hadAwaken?'<span class="mark awaken">A</span>':''}</span></div>`).join('')}</div><div class="tomb-pots">${(t.pots||[]).length===0?'<span style="color:var(--text-mute);font-style:italic;">No stats maxed</span>':(t.pots||[]).map(k=>{const p=POTIONS.find(pp=>pp.key===k);return p?potSvg(p.color):'';}).join('')}</div>`;
  el.querySelector('[data-role="del"]').addEventListener('click',()=>confirmModal('Delete this memorial?',()=>{const s=curSave();s.cemetery=s.cemetery.filter(x=>x.id!==t.id);sv();render();}));
  return el;
}

export { renderCemetery, renderTomb };
