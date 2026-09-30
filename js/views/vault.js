import { DATA } from '../data/items.js';
import { charCapacity, charHasRoom, charInventoryUsed, vaultCapacity, vaultHasRoom } from '../logic/account.js';
import { findItem } from '../logic/items.js';
import { transferVaultItemToCharacter, vaultAllItems, vaultStats } from '../logic/vault.js';
import { VIEW, curSave, sv } from '../state.js';
import { alertModal, confirmModal, go, mkBack, mkControls, mkHeader, render, root } from '../ui/core.js';
import { VAULT_CHEST_ICON, gravestoneSvg, itemSpriteImg } from '../ui/icons.js';
import { esc, uid } from '../utils.js';

// ═══ ITEMS PAGE ══════════════════════════════════════════
function renderItems(){
  const s=curSave();document.title='Items — '+s.name;
  root.appendChild(mkBack('Back to '+s.name,'home'));
  root.appendChild(mkHeader('Items','Vault, Rings, and Item Catalog'));
  const g=document.createElement('div');g.className='section-grid';
  const vs=vaultStats();
  g.innerHTML=`
    <div class="section-card" data-s="vault"><div class="section-icon">${VAULT_CHEST_ICON}</div><div class="section-info"><div class="section-name">Vault</div><div class="section-desc">All items aggregated across characters.</div><div class="section-stat"><strong>${vs.unique}</strong> unique · <strong>${vs.total}</strong> total</div></div></div>`;
  root.appendChild(g);
  g.querySelectorAll('.section-card').forEach(c=>c.addEventListener('click',()=>go(c.dataset.s)));
}
function renderVault(){
  const s=curSave();const items=vaultAllItems();const vs=vaultStats();
  document.title='Vault — '+s.name;
  const topBar=document.createElement('div');topBar.className='top-bar';
  topBar.appendChild(mkBack('Back to '+s.name,'home'));
  const addBtn=document.createElement('button');addBtn.className='btn primary';addBtn.innerHTML='+ Add Item';
  addBtn.addEventListener('click',()=>openAddVaultItemModal());
  topBar.appendChild(addBtn);
  root.appendChild(topBar);
  root.appendChild(mkHeader('⛃ Vault','Aggregated inventory',{done:vs.total,total:vaultCapacity(s),label:'slots used'}));
  root.appendChild(mkControls(false));
  if(!items.length){root.appendChild(Object.assign(document.createElement('div'),{className:'empty-hint',innerHTML:'The vault is empty. Send items here from a character\'s Inventory panel, or use "+ Add Item" above.'}));return;}
  const groups=[{pool:'weapons',label:'Weapons'},{pool:'alt_weapons',label:'Alt Weapons'},{pool:'armors',label:'Armors'},{pool:'abilities',label:'Abilities'},{pool:'rings',label:'Rings'}];
  groups.forEach(g=>{
    let bucket=items.filter(x=>x.pool===g.pool);if(!bucket.length)return;
    bucket=bucket.filter(x=>{if(VIEW.filter==='done'&&x.totalCount<=0)return false;if(VIEW.filter==='pending'&&x.totalCount>0)return false;if(VIEW.search&&!(x.item.name+' '+x.item.drop).toLowerCase().includes(VIEW.search))return false;return true;});
    if(!bucket.length)return;
    const cat=document.createElement('div');cat.className='category';cat.innerHTML=`<div class="cat-title">${esc(g.label)}</div>`;
    const gr=document.createElement('div');gr.className='grid';
    bucket.sort((a,b)=>a.item.name.localeCompare(b.item.name)).forEach(x=>{
      const el=document.createElement('div');el.className='item done vault-card';
      const chips=[];if(x.item.shiny&&x.totalShiny>0)chips.push({key:'shiny',label:`Shiny ${x.totalShiny}/${x.totalCount}`});if(x.anyAwaken)chips.push({key:'awaken',label:'Awakened'});
      el.innerHTML=`<div class="item-top-row"><div class="icon-slot ${x.item.tier==='ST'?'st':'ut'}">${itemSpriteImg(x.pool,x.item.name)}</div><div class="item-info"><div class="item-name">${esc(x.item.name)}<span class="count-badge">×${x.totalCount}</span></div><div class="item-loc">${x.item.drop?'📍 '+esc(x.item.drop):''}</div></div></div>${chips.length?`<div class="variant-row">${chips.map(c=>`<div class="variant-chip ${c.key} on readonly"><span class="dot"></span>${c.label}</div>`).join('')}</div>`:''}
      <div class="vault-breakdown">${x.perOwner.map(p=>`<span class="vault-owner ${p.isDead?'deceased':''}">${p.isDead?'<span class="skull-tiny">'+gravestoneSvg(0,10)+'</span> ':''}${esc(p.label)} <strong>×${p.count}</strong>${p.shinyCount>0?` <span class="vault-owner-shiny">✦${p.shinyCount}</span>`:''}${p.isExtra?`<button class="vault-owner-del" data-role="del-extra" data-id="${esc(p.extraId)}" title="Remove">✕</button>`:''}${(p.sourceType!=='ring')?`<button class="vault-owner-send" data-role="send-char" data-pool="${esc(x.pool)}" data-item="${esc(x.item.name)}" data-source-type="${esc(p.sourceType||'')}" data-source-id="${esc(p.sourceId||'')}" data-max="${p.count}" title="Send to a character">↩</button>`:''}</span>`).join('')}</div>`;
      el.querySelectorAll('[data-role="del-extra"]').forEach(btn=>btn.addEventListener('click',e=>{
        e.stopPropagation();const id=btn.dataset.id;
        confirmModal('Remove this manually-added item from the vault?',()=>{s.vaultExtras=(s.vaultExtras||[]).filter(x2=>x2.id!==id);sv();render();});
      }));
      el.querySelectorAll('[data-role="send-char"]').forEach(btn=>btn.addEventListener('click',e=>{
        e.stopPropagation();
        openSendToCharacterModal(btn.dataset.pool,btn.dataset.item,btn.dataset.sourceType,btn.dataset.sourceId,parseInt(btn.dataset.max)||1);
      }));
      gr.appendChild(el);
    });
    cat.appendChild(gr);root.appendChild(cat);
  });
}

function openAddVaultItemModal(){
  const s=curSave();
  const bg=document.getElementById('modal-bg');const m=bg.querySelector('.modal');
  m.className='modal add-vault-modal';
  const poolOptions=[{key:'weapons',label:'Weapons'},{key:'alt_weapons',label:'Alt Weapons'},{key:'armors',label:'Armors'},{key:'abilities',label:'Abilities'},{key:'rings',label:'Rings'}];
  const draft={pool:'weapons',itemName:'',ownerLabel:s.characters[0]?(s.characters[0].name||s.characters[0].className):'Unknown',count:1,shinyCount:0,awaken:false};
  const renderForm=()=>{
    const poolItems=(DATA[draft.pool]||[]).slice().sort((a,b)=>a.name.localeCompare(b.name));
    if(!draft.itemName&&poolItems.length)draft.itemName=poolItems[0].name;
    const selectedItem=poolItems.find(i=>i.name===draft.itemName);
    m.innerHTML=`
      <h2 class="pet-modal-title">Add Item to Vault</h2>
      <div class="pet-form-row">
        <label>Category</label>
        <select id="av-pool">${poolOptions.map(p=>`<option value="${p.key}" ${p.key===draft.pool?'selected':''}>${esc(p.label)}</option>`).join('')}</select>
      </div>
      <div class="pet-form-row">
        <label>Item</label>
        <select id="av-item">${poolItems.map(i=>`<option value="${esc(i.name)}" ${i.name===draft.itemName?'selected':''}>${esc(i.name)} (${i.tier})</option>`).join('')}</select>
      </div>
      <div class="pet-form-row">
        <label>Found by</label>
        <select id="av-owner">
          ${s.characters.map(c=>`<option value="${esc(c.name||c.className)}" ${(c.name||c.className)===draft.ownerLabel?'selected':''}>${esc(c.name||c.className)} (${esc(c.className)})</option>`).join('')}
          <option value="Unknown" ${draft.ownerLabel==='Unknown'?'selected':''}>Unknown / Other</option>
        </select>
      </div>
      <div class="pet-form-row" style="display:flex;gap:14px;">
        <div style="flex:1;">
          <label>Count</label>
          <input type="number" id="av-count" min="1" value="${draft.count}">
        </div>
        <div style="flex:1;">
          <label>Shiny copies</label>
          <input type="number" id="av-shiny" min="0" max="${draft.count}" value="${draft.shinyCount}" ${selectedItem&&selectedItem.shiny?'':'disabled'}>
        </div>
      </div>
      ${selectedItem&&selectedItem.awaken?`<div class="pet-form-row"><label class="tag-toggle ${draft.awaken?'on':''}" style="display:inline-flex;"><input type="checkbox" id="av-awaken" ${draft.awaken?'checked':''}><span>Awakened (${esc(selectedItem.awaken)})</span></label></div>`:''}
      <div class="modal-actions">
        <button class="btn" id="modal-cancel">Cancel</button>
        <button class="btn primary" id="modal-ok">Add to Vault</button>
      </div>
    `;
    m.querySelector('#av-pool').addEventListener('change',e=>{draft.pool=e.target.value;draft.itemName='';renderForm();});
    m.querySelector('#av-item').addEventListener('change',e=>{draft.itemName=e.target.value;draft.shinyCount=0;draft.awaken=false;renderForm();});
    m.querySelector('#av-owner').addEventListener('change',e=>{draft.ownerLabel=e.target.value;});
    m.querySelector('#av-count').addEventListener('input',e=>{draft.count=Math.max(1,parseInt(e.target.value)||1);if(draft.shinyCount>draft.count)draft.shinyCount=draft.count;});
    const shinyInput=m.querySelector('#av-shiny');
    if(shinyInput)shinyInput.addEventListener('input',e=>{draft.shinyCount=Math.max(0,Math.min(draft.count,parseInt(e.target.value)||0));});
    const awakenInput=m.querySelector('#av-awaken');
    if(awakenInput)awakenInput.addEventListener('change',e=>{draft.awaken=e.target.checked;});
    m.querySelector('#modal-cancel').onclick=()=>{bg.classList.remove('on');m.className='modal';};
    m.querySelector('#modal-ok').onclick=()=>{
      if(!draft.itemName){bg.classList.remove('on');m.className='modal';return;}
      if(!vaultHasRoom(s,draft.count)){alertModal(`Not enough vault space (${vaultStats().total}/${vaultCapacity(s)} slots used, need ${draft.count} more). Add more Vault Chests in Account Progression first.`);return;}
      if(!s.vaultExtras)s.vaultExtras=[];
      s.vaultExtras.push({id:'vx_'+uid(),pool:draft.pool,itemName:draft.itemName,count:draft.count,shinyCount:draft.shinyCount,awaken:draft.awaken,ownerLabel:draft.ownerLabel,addedAt:Date.now()});
      bg.classList.remove('on');m.className='modal';sv();render();
    };
  };
  renderForm();
  bg.classList.add('on');
}

// send vault-held units (from a character's vaultCount, a manually-added extra,
// or a deceased character's memorial) to a chosen living character's inventory
function openSendToCharacterModal(pool,itemName,sourceType,sourceId,maxQty){
  const s=curSave();
  if(!s.characters.length){alertModal('You need at least one character to send items to.');return;}
  const item=findItem(pool,itemName);if(!item)return;
  const bg=document.getElementById('modal-bg');const m=bg.querySelector('.modal');
  m.className='modal add-vault-modal';
  const draft={targetId:(sourceType==='char'&&s.characters.some(c=>c.id===sourceId))?sourceId:s.characters[0].id,qty:1};
  const renderForm=()=>{
    m.innerHTML=`
      <h2 class="pet-modal-title">Send to Character</h2>
      <p style="text-align:center;color:var(--text-dim);font-size:12.5px;margin:-8px 0 16px;">${esc(item.name)} — up to ${maxQty} available</p>
      <div class="pet-form-row">
        <label>Send to</label>
        <select id="stc-target">${s.characters.map(c=>`<option value="${c.id}" ${c.id===draft.targetId?'selected':''}>${esc(c.name||c.className)} (${esc(c.className)})</option>`).join('')}</select>
      </div>
      <div class="pet-form-row">
        <label>Quantity</label>
        <input type="number" id="stc-qty" min="1" max="${maxQty}" value="${draft.qty}">
      </div>
      <div class="modal-actions">
        <button class="btn" id="modal-cancel">Cancel</button>
        <button class="btn primary" id="modal-ok">Send</button>
      </div>
    `;
    m.querySelector('#stc-target').addEventListener('change',e=>{draft.targetId=e.target.value;});
    m.querySelector('#stc-qty').addEventListener('input',e=>{draft.qty=Math.max(1,Math.min(maxQty,parseInt(e.target.value)||1));});
    m.querySelector('#modal-cancel').onclick=()=>{bg.classList.remove('on');m.className='modal';};
    m.querySelector('#modal-ok').onclick=()=>{
      const targetCh=s.characters.find(c=>c.id===draft.targetId);if(!targetCh){bg.classList.remove('on');m.className='modal';return;}
      const qty=Math.max(1,Math.min(maxQty,draft.qty));
      if(!charHasRoom(targetCh,qty)){alertModal(`${targetCh.name||targetCh.className}'s inventory doesn't have room for ${qty} more (${charInventoryUsed(targetCh)}/${charCapacity(targetCh)} slots used).`);return;}
      transferVaultItemToCharacter(pool,itemName,sourceType,sourceId,qty,targetCh);
      bg.classList.remove('on');m.className='modal';sv();render();
    };
  };
  renderForm();
  bg.classList.add('on');
}

export { renderItems, renderVault, openAddVaultItemModal, openSendToCharacterModal };
