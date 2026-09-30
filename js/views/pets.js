import { PET_ABILITIES, PET_FAMILIES, PET_FUSE_COST, PET_MAX_SLOTS, PET_RARITIES } from '../data/game.js';
import { fusePreview, petCap, petDisplayName, petUnlockedCount, petYardTier } from '../logic/pets.js';
import { curSave, sv } from '../state.js';
import { confirmModal, mkBack, mkHeader, render, root } from '../ui/core.js';
import { PET_MAIN_ICON } from '../ui/icons.js';
import { esc, uid } from '../utils.js';

// ═══ PETS PAGE ═══════════════════════════════════════════
function renderPets(){
  const s=curSave();document.title='Pets — '+s.name;
  if(!s.pets)s.pets=[];
  if(!s.petYard)s.petYard={tier:0};

  root.appendChild(mkBack('Back to '+s.name,'home'));
  root.appendChild(mkHeader('Pets','Your Pet Yard companions'));

  root.appendChild(renderPetYardSection(s));

  const orn=document.createElement('div');orn.className='ornament';orn.innerHTML='🐾 &nbsp;·&nbsp; R O S T E R &nbsp;·&nbsp; 🐾';
  root.appendChild(orn);

  const petTitle=document.createElement('div');petTitle.className='section-title';
  petTitle.innerHTML=`Pets <span style="font-size:11px;color:var(--text-dim);">${s.pets.length}/${PET_MAX_SLOTS}</span>`;
  root.appendChild(petTitle);

  const g=document.createElement('div');g.className='pet-grid';
  s.pets.forEach(p=>g.appendChild(renderPetCard(p)));
  if(s.pets.length<PET_MAX_SLOTS){
    const slot=document.createElement('div');slot.className='pet-slot-empty';
    slot.innerHTML=`<div class="plus">+</div><div class="hint">New Pet</div>`;
    slot.addEventListener('click',()=>openPetEditor(null));
    g.appendChild(slot);
  }
  root.appendChild(g);
}

function renderPetCard(p){
  const rar=PET_RARITIES[p.rarity];
  const unlocked=petUnlockedCount(p.rarity);
  const cap=petCap(p);
  const weakened=cap<rar.cap;
  const el=document.createElement('div');el.className='pet-card rarity-'+rar.key;
  const abilHtml=p.abilities.map((ab,i)=>{
    const on=i<unlocked;
    return `<div class="pet-abil-row ${on?'':'locked'}"><span class="pet-abil-type">${on?esc(ab.type):'—'}</span><span class="pet-abil-lvl">${on?ab.level+'/'+cap:'Locked'}</span></div>`;
  }).join('');
  el.innerHTML=`
    <div class="pet-badge" style="background:${rar.color};">${esc(rar.name)}</div>
    <div class="pet-icon">${PET_MAIN_ICON}</div>
    <div class="pet-name">${esc(petDisplayName(p))}</div>
    <div class="pet-family">${esc(p.family)}</div>
    ${weakened?`<div class="pet-weak-tag" title="This pet's ability cap was reduced by fusing under-leveled pets (cap ${cap} instead of ${rar.cap})">⚠ Weakened cap: ${cap}/${rar.cap}</div>`:''}
    <div class="pet-abils">${abilHtml}</div>
  `;
  el.addEventListener('click',()=>openPetEditor(p));
  return el;
}

function renderPetYardSection(s){
  if(!s.petYard)s.petYard={tier:0};
  const tier=s.petYard.tier;
  const rar=PET_RARITIES[tier];
  const next=PET_RARITIES[tier+1]||null;
  const canFuseFrom=tier>=1?PET_RARITIES[tier-1]:null;
  const wrap=document.createElement('div');wrap.className='pet-yard-section';
  wrap.innerHTML=`
    <div class="pet-yard-card">
      <div class="pet-yard-icon">${PET_MAIN_ICON}</div>
      <div class="pet-yard-info">
        <div class="pet-yard-tier" style="color:${rar.color};">${esc(rar.name)} Yard</div>
        <div class="pet-yard-sub">${canFuseFrom?`Can fuse ${esc(canFuseFrom.name)} pets → ${esc(rar.name)}`:'Upgrade to enable fusing'}</div>
      </div>
      <div class="pet-yard-actions">
        <button class="btn primary" data-role="fuse">⚗ Fuse Pets</button>
        ${next?`<button class="btn primary" data-role="upgrade">Upgrade to ${esc(next.name)}</button>`:'<span class="pet-yard-max">Max tier reached</span>'}
        ${tier>0?`<button class="btn danger small" data-role="resetyard" title="Reset if upgraded by mistake">Reset</button>`:''}
      </div>
    </div>
  `;
  wrap.querySelector('[data-role="fuse"]').addEventListener('click',()=>openFuseModal());
  const upBtn=wrap.querySelector('[data-role="upgrade"]');
  if(upBtn)upBtn.addEventListener('click',()=>{confirmModal(`Upgrade Pet Yard to ${next.name}?`,()=>{s.petYard.tier++;sv();render();});});
  const resetBtn=wrap.querySelector('[data-role="resetyard"]');
  if(resetBtn)resetBtn.addEventListener('click',()=>{confirmModal('Reset Pet Yard back to Common tier?',()=>{s.petYard.tier=0;sv();render();});});
  return wrap;
}

function openPetEditor(pet){
  const s=curSave();if(!s.pets)s.pets=[];
  const isNew=!pet;
  const draft=pet?JSON.parse(JSON.stringify(pet)):{id:'pet_'+uid(),family:PET_FAMILIES[0],rarity:0,name:'',abilities:[{type:PET_ABILITIES[0],level:0},{type:PET_ABILITIES[1],level:0},{type:PET_ABILITIES[2],level:0}],createdAt:Date.now(),cap:PET_RARITIES[0].cap};
  if(typeof draft.cap!=='number') draft.cap=PET_RARITIES[draft.rarity].cap; // legacy pets without a stored cap
  const bg=document.getElementById('modal-bg');const m=bg.querySelector('.modal');
  m.className='modal pet-modal';
  const renderForm=()=>{
    const rar=PET_RARITIES[draft.rarity];
    const unlocked=petUnlockedCount(draft.rarity);
    const cap=draft.cap;
    const weakened=cap<rar.cap;
    m.innerHTML=`
      <h2 class="pet-modal-title">${isNew?'New Pet':'Edit Pet'}</h2>
      <div class="pet-form-row">
        <label>Nickname</label>
        <input type="text" id="pet-name" maxlength="20" placeholder="${esc(rar.name+' '+draft.family)}" value="${esc(draft.name||'')}">
      </div>
      <div class="pet-form-row">
        <label>Family</label>
        <select id="pet-family">${PET_FAMILIES.map(f=>`<option value="${esc(f)}" ${f===draft.family?'selected':''}>${esc(f)}</option>`).join('')}</select>
      </div>
      <div class="pet-form-row">
        <label>Rarity</label>
        <div class="pet-rarity-pick">${PET_RARITIES.map((r,i)=>`<div class="pet-rarity-opt ${i===draft.rarity?'on':''}" data-r="${i}" style="--rc:${r.color};">${esc(r.name)}</div>`).join('')}</div>
      </div>
      ${weakened?`<div class="pet-weak-note">⚠ This pet's ability cap is <strong>${cap}</strong> instead of the usual ${rar.cap} — it was fused from under-leveled pets. Changing rarity manually below will reset it to the standard cap.</div>`:''}
      <div class="pet-form-row abilities">
        <label>Abilities <span style="text-transform:none;font-style:italic;color:var(--text-mute);">(max level: ${cap})</span></label>
        ${draft.abilities.map((ab,i)=>{
          const on=i<unlocked;
          return `<div class="pet-abil-edit ${on?'':'locked'}">
            <select data-role="abil-type" data-i="${i}" ${on?'':'disabled'}>${PET_ABILITIES.map(a=>`<option value="${esc(a)}" ${a===ab.type?'selected':''}>${esc(a)}</option>`).join('')}</select>
            <input type="number" data-role="abil-level" data-i="${i}" min="0" max="${cap}" value="${on?ab.level:0}" ${on?'':'disabled'}>
            <span class="pet-abil-cap">/ ${on?cap:'—'}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="modal-actions">
        ${!isNew?`<button class="btn danger" id="pet-release" title="Release this pet from your Pet Yard" style="margin-right:auto;">Release Pet</button>`:''}
        <button class="btn" id="modal-cancel">Cancel</button>
        <button class="btn primary" id="modal-ok">${isNew?'Add Pet':'Save'}</button>
      </div>
    `;
    m.querySelector('#pet-name').addEventListener('input',e=>{draft.name=e.target.value.trim();});
    m.querySelector('#pet-family').addEventListener('change',e=>{draft.family=e.target.value;});
    m.querySelectorAll('.pet-rarity-opt').forEach(o=>o.addEventListener('click',()=>{
      draft.rarity=+o.dataset.r;
      draft.cap=PET_RARITIES[draft.rarity].cap; // manual rarity change = fresh cap, not a fusion result
      draft.abilities.forEach((ab,i)=>{if(i>=petUnlockedCount(draft.rarity))ab.level=0;else if(ab.level>draft.cap)ab.level=draft.cap;});
      renderForm();
    }));
    m.querySelectorAll('[data-role="abil-type"]').forEach(sel=>sel.addEventListener('change',e=>{draft.abilities[+e.target.dataset.i].type=e.target.value;}));
    m.querySelectorAll('[data-role="abil-level"]').forEach(inp=>inp.addEventListener('input',e=>{
      const i=+e.target.dataset.i;let v=parseInt(e.target.value)||0;v=Math.max(0,Math.min(v,draft.cap));draft.abilities[i].level=v;
    }));
    m.querySelector('#modal-cancel').onclick=()=>{bg.classList.remove('on');m.className='modal';};
    const releaseBtn=m.querySelector('#pet-release');
    if(releaseBtn)releaseBtn.addEventListener('click',()=>{
      confirmModal(`Release ${petDisplayName(draft)}? This cannot be undone.`,()=>{
        s.pets=s.pets.filter(x=>x.id!==draft.id);
        bg.classList.remove('on');m.className='modal';sv();render();
      });
    });
    m.querySelector('#modal-ok').onclick=()=>{
      if(isNew){
        if(s.pets.length>=PET_MAX_SLOTS){bg.classList.remove('on');m.className='modal';return;}
        s.pets.push(draft);
      } else {
        const idx=s.pets.findIndex(x=>x.id===draft.id);
        if(idx>=0)s.pets[idx]=draft;
      }
      bg.classList.remove('on');m.className='modal';sv();render();
    };
  };
  renderForm();
  bg.classList.add('on');
}

function openFuseModal(){
  const s=curSave();if(!s.pets)s.pets=[];if(!s.petYard)s.petYard={tier:0};
  const bg=document.getElementById('modal-bg');const m=bg.querySelector('.modal');
  m.className='modal fuse-modal';
  let recipientId=null,catalystId=null;
  const renderF=()=>{
    const pets=s.pets;
    const recipient=pets.find(p=>p.id===recipientId)||null;
    const catalysts=recipient?pets.filter(p=>p.id!==recipient.id&&p.family===recipient.family&&p.rarity===recipient.rarity):[];
    const catalyst=catalysts.find(p=>p.id===catalystId)||null;
    const yardTier=petYardTier(s);
    const yardOk=recipient?yardTier>=recipient.rarity+1:true;
    const preview=(recipient&&catalyst)?fusePreview(recipient,catalyst):null;
    m.innerHTML=`
      <h2 class="pet-modal-title">Fuse Pets</h2>
      <div class="fuse-step">
        <div class="fuse-step-label">1. Choose recipient <span class="fuse-step-hint">(kept &amp; upgraded)</span></div>
        <div class="fuse-pet-list">${pets.filter(p=>p.rarity<4).map(p=>`<div class="fuse-pet-opt ${p.id===recipientId?'on':''}" data-role="pick-recipient" data-id="${p.id}">${esc(petDisplayName(p))}<span class="fuse-pet-meta">${esc(p.family)} · ${esc(PET_RARITIES[p.rarity].name)}</span></div>`).join('')||'<div class="empty-hint">No eligible pets. Pets already at Divine rarity cannot be fused further.</div>'}</div>
      </div>
      ${recipient?`<div class="fuse-step">
        <div class="fuse-step-label">2. Choose catalyst <span class="fuse-step-hint">(consumed)</span></div>
        <div class="fuse-pet-list">${catalysts.length?catalysts.map(p=>`<div class="fuse-pet-opt ${p.id===catalystId?'on':''}" data-role="pick-catalyst" data-id="${p.id}">${esc(petDisplayName(p))}</div>`).join(''):'<div class="empty-hint">No matching family/rarity pets available.</div>'}</div>
      </div>`:''}
      ${(recipient&&!yardOk)?`<div class="fuse-warning">⚠ Pet Yard must be at least ${esc(PET_RARITIES[recipient.rarity+1].name)} tier to fuse ${esc(PET_RARITIES[recipient.rarity].name)} pets. Current: ${esc(PET_RARITIES[yardTier].name)}.</div>`:''}
      ${preview?`<div class="fuse-preview">
        <div class="fuse-preview-title">Result: ${esc(PET_RARITIES[preview.rarity].name)} ${esc(preview.family)}</div>
        ${preview.abilities.map(a=>`<div class="pet-abil-row ${a.locked?'locked':''}"><span class="pet-abil-type">${a.locked?'—':esc(a.type)}</span><span class="pet-abil-lvl">${a.locked?'Locked':a.level+'/'+preview.cap}</span></div>`).join('')}
        <div class="fuse-cost">Cost: ${PET_FUSE_COST[recipient.rarity].fame} Fame or ${PET_FUSE_COST[recipient.rarity].gold} Gold</div>
      </div>`:''}
      <div class="modal-actions">
        <button class="btn" id="modal-cancel">Cancel</button>
        <button class="btn primary" id="modal-ok" ${(!preview||!yardOk)?'disabled':''}>Confirm Fusion</button>
      </div>
    `;
    m.querySelectorAll('[data-role="pick-recipient"]').forEach(o=>o.addEventListener('click',()=>{recipientId=o.dataset.id;catalystId=null;renderF();}));
    m.querySelectorAll('[data-role="pick-catalyst"]').forEach(o=>o.addEventListener('click',()=>{catalystId=o.dataset.id;renderF();}));
    m.querySelector('#modal-cancel').onclick=()=>{bg.classList.remove('on');m.className='modal';};
    const okBtn=m.querySelector('#modal-ok');
    if(okBtn&&!okBtn.disabled)okBtn.onclick=()=>{
      if(!recipient||!catalyst)return;
      const result=fusePreview(recipient,catalyst);
      const newPet={id:'pet_'+uid(),family:result.family,rarity:result.rarity,name:recipient.name||'',abilities:result.abilities.map(a=>({type:a.type,level:a.level})),cap:result.cap,createdAt:Date.now()};
      s.pets=s.pets.filter(p=>p.id!==recipient.id&&p.id!==catalyst.id);
      s.pets.push(newPet);
      bg.classList.remove('on');m.className='modal';sv();render();
    };
  };
  renderF();
  bg.classList.add('on');
}

export { renderPets, renderPetCard, renderPetYardSection, openPetEditor, openFuseModal };
