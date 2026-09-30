import { POTIONS, POT_FULL, POT_MAX } from '../data/game.js';
import { DATA } from '../data/items.js';
import { characterSlotLimit } from '../logic/account.js';
import { exaltTier, getExalts } from '../logic/exalts.js';
import { curSave, sv } from '../state.js';
import { alertModal, confirmModal, go, mkBack, mkHeader, render, root } from '../ui/core.js';
import { classSpriteImg, gravestoneSvg } from '../ui/icons.js';
import { esc, uid } from '../utils.js';
import { renderTomb } from './cemetery.js';
import { renderExaltSection } from './exalts.js';

// ═══ CHARACTERS PAGE ═════════════════════════════════════
function renderChars(){
  const s=curSave();document.title='Characters \u2014 '+s.name;
  // top bar: back left, cemetery right
  const topBar=document.createElement('div');topBar.className='top-bar';
  const backBtn=mkBack('Back to '+s.name,'home');
  topBar.appendChild(backBtn);
  const cemBtn=document.createElement('button');cemBtn.className='btn cemetery-btn';
  cemBtn.innerHTML=s.cemetery.length>0?`<span class="inline-grave">${gravestoneSvg(0,13)}</span> Cemetery (${s.cemetery.length})`:`<span class="inline-grave">${gravestoneSvg(0,13)}</span> Cemetery`;
  cemBtn.addEventListener('click',()=>go('cemetery'));
  topBar.appendChild(cemBtn);
  root.appendChild(topBar);
  root.appendChild(mkHeader('Characters','Your roster and exaltations'));

  // \u2500\u2500 SUB-SECTION: Characters \u2500\u2500
  const charTitle=document.createElement('div');charTitle.className='section-title';
  const charLimit=characterSlotLimit(s);
  charTitle.innerHTML=`Characters <span style="font-size:11px;color:var(--text-dim);">${s.characters.length}/${charLimit} slots used</span>`;
  root.appendChild(charTitle);

  const g=document.createElement('div');g.className='char-grid';
  const sorted=[...s.characters].sort((a,b)=>{const af=a.fav?1:0,bf=b.fav?1:0;return bf-af;});
  sorted.forEach(ch=>{
    const cls=DATA.classes.find(c=>c.name===ch.className);
    const potsCount=(ch.pots||[]).length;const potsPct=potsCount/POT_MAX*100;
    const potsFull=potsCount>=POT_MAX;
    const lastPot=POTIONS.find(p=>p.key===(ch.pots||[])[potsCount-1]);
    const potsColor=potsFull?POT_FULL:(lastPot?lastPot.color:'');
    const tier=exaltTier(getExalts(s,ch.className));
    const cardClasses=['char-card'];
    if(potsFull) cardClasses.push('maxed');
    if(ch.fav) cardClasses.push('fav-char');
    if(tier>0) cardClasses.push('exalt-t'+tier);
    const card=document.createElement('div');card.className=cardClasses.join(' ');
    const displayName=ch.name||ch.className;
    const corners=tier>0?'<div class="corner-tl"></div><div class="corner-tr"></div><div class="corner-bl"></div><div class="corner-br"></div>':'';
    let ornamentSymbol='';
    if(tier>=8) ornamentSymbol='✦ ◆ ✦';
    else if(tier>=7) ornamentSymbol='◆';
    else if(tier>=5) ornamentSymbol='❖';
    const ornamentTop=ornamentSymbol?`<div class="exalt-ornament-top">${ornamentSymbol}</div>`:'';
    const tagDots=`<div class="char-tag-dots">
        <span class="tag-dot crucible ${ch.crucible?'on':''}" title="Crucible character">C</span>
        <span class="tag-dot seasonal ${ch.seasonal?'on':''}" title="Seasonal character">S</span>
      </div>`;
    card.innerHTML=`${corners}${ornamentTop}
      <button class="char-delete" data-role="del" title="Delete">\u2715</button>
      <div class="char-fav ${ch.fav?'on':''}" data-role="cfav" title="Favorite">\u2605</div>
      <div class="char-icon">${classSpriteImg(ch.className)}</div>
      <div class="char-name">${esc(displayName)}</div>
      <div class="char-class-tag">${ch.name&&ch.name!==ch.className?esc(ch.className):''}</div>
      <div class="char-prog-count ${potsFull?'filled':''}" style="${potsColor?`color:${potsColor}`:''}">${potsCount}/${POT_MAX}</div>
      <div class="char-bottom-row">
        <div class="char-mini-bar" title="${potsCount}/${POT_MAX} stats maxed"><div style="width:${potsPct}%"></div></div>
        ${tagDots}
      </div>`;
    card.addEventListener('click',e=>{if(e.target.closest('[data-role="del"]')||e.target.closest('[data-role="cfav"]'))return;go('charDetail',{currentCharId:ch.id});});
    card.querySelector('[data-role="cfav"]').addEventListener('click',e=>{e.stopPropagation();ch.fav=!ch.fav;sv();render();});
    card.querySelector('[data-role="del"]').addEventListener('click',e=>{e.stopPropagation();confirmModal(`Delete ${displayName}? Items will be lost.`,()=>{s.characters=s.characters.filter(c=>c.id!==ch.id);sv();render();});});
    g.appendChild(card);
  });
  const slot=document.createElement('div');
  const atCharLimit=s.characters.length>=charLimit;
  slot.className='char-slot-empty'+(atCharLimit?' full':'');
  slot.innerHTML=atCharLimit
    ?`<div class="plus">🔒</div><div class="hint">All ${charLimit} slots full</div>`
    :`<div class="plus">+</div><div class="hint">New Character</div>`;
  slot.addEventListener('click',()=>{
    if(atCharLimit){alertModal(`You've used all ${charLimit} character slot${charLimit===1?'':'s'}. Increase Character Slots in Account Progression (on the home page) to create more.`);return;}
    openClassPicker();
  });
  g.appendChild(slot);
  root.appendChild(g);

  // \u2500\u2500 SUB-SECTION: Exaltations \u2500\u2500
  const exOrn=document.createElement('div');exOrn.className='ornament';exOrn.innerHTML='\u2726 &nbsp;\u00b7&nbsp; E X A L T A T I O N S &nbsp;\u00b7&nbsp; \u2726';
  root.appendChild(exOrn);
  root.appendChild(renderExaltSection(s));

  // \u2500\u2500 SUB-SECTION: Cemetery \u2500\u2500
  if(s.cemetery.length>0){
    const cemOrn=document.createElement('div');cemOrn.className='ornament';cemOrn.innerHTML='<span class="inline-grave">'+gravestoneSvg(0,13)+'</span> &nbsp;\u00b7&nbsp; C E M E T E R Y &nbsp;\u00b7&nbsp; <span class="inline-grave">'+gravestoneSvg(0,13)+'</span>';
    root.appendChild(cemOrn);
    const cg=document.createElement('div');cg.className='cemetery-grid';
    s.cemetery.forEach(t2=>cg.appendChild(renderTomb(t2)));
    root.appendChild(cg);
  }
}
function openClassPicker(){
  const s=curSave();
  if(s.characters.length>=characterSlotLimit(s)){alertModal(`You've used all ${characterSlotLimit(s)} character slots. Increase Character Slots in Account Progression to create more.`);return;}
  const bg=document.getElementById('modal-bg');const m=bg.querySelector('.modal');
  m.className='modal class-picker';
  m.innerHTML=`<h2 style="font-family:'Cinzel',Georgia,serif;color:var(--gold-bright);text-align:center;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Choose a Class</h2><div class="class-pick-grid"></div><div class="modal-actions"><button class="btn" id="modal-cancel">Cancel</button></div>`;
  const grid=m.querySelector('.class-pick-grid');
  DATA.classes.forEach(cls=>{
    const btn=document.createElement('div');btn.className='class-pick-btn';
    btn.innerHTML=`<div class="cpb-icon">${classSpriteImg(cls.name)}</div><div class="cpb-name">${esc(cls.name)}</div>`;
    btn.addEventListener('click',()=>{
      if(s.characters.length>=characterSlotLimit(s)){bg.classList.remove('on');m.className='modal';alertModal(`You've used all ${characterSlotLimit(s)} character slots.`);return;}
      s.characters.push({id:'ch_'+uid(),className:cls.name,name:cls.name,createdAt:Date.now(),pots:[],items:{}});
      bg.classList.remove('on');m.className='modal';sv();render();
    });
    grid.appendChild(btn);
  });
  bg.querySelector('#modal-cancel').onclick=()=>{bg.classList.remove('on');m.className='modal';};
  bg.classList.add('on');
}

function openRenameModal(ch){
  const bg=document.getElementById('modal-bg');const m=bg.querySelector('.modal');
  m.className='modal rename-modal';
  m.innerHTML=`
    <div class="rename-header">
      <div class="rename-icon">${classSpriteImg(ch.className)}</div>
      <div class="rename-title">Name Your ${esc(ch.className)}</div>
      <div class="rename-sub">Choose a name for your hero. Leave empty to use the class name.</div>
    </div>
    <input class="rename-input" id="rename-val" type="text" value="${esc(ch.name&&ch.name!==ch.className?ch.name:'')}" maxlength="20" placeholder="${esc(ch.className)}" autofocus>
    <div class="modal-actions">
      <button class="btn" id="modal-cancel">Cancel</button>
      <button class="btn primary" id="modal-ok">Confirm</button>
    </div>`;
  bg.classList.add('on');
  setTimeout(()=>{const inp=document.getElementById('rename-val');if(inp){inp.focus();inp.select();}},50);
  m.querySelector('#modal-ok').onclick=()=>{
    const val=(document.getElementById('rename-val').value||'').trim();
    ch.name=val||ch.className;
    bg.classList.remove('on');m.className='modal';sv();render();
  };
  m.querySelector('#modal-cancel').onclick=()=>{bg.classList.remove('on');m.className='modal';};
  // enter key confirms
  m.querySelector('#rename-val').addEventListener('keydown',e=>{if(e.key==='Enter')m.querySelector('#modal-ok').click();});
}

export { renderChars, openClassPicker, openRenameModal };
