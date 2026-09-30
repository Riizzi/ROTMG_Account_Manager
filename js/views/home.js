import { ACCOUNT_LEVELS, ACCOUNT_LEVEL_MAX, EXALT_TOTAL, PET_MAX_SLOTS, PET_RARITIES, POT_MAX } from '../data/game.js';
import { DATA } from '../data/items.js';
import { getAccountProgress, vaultCapacity } from '../logic/account.js';
import { classExaltTotal } from '../logic/exalts.js';
import { saveStats } from '../logic/items.js';
import { petYardTier } from '../logic/pets.js';
import { accountItemProgress, vaultStats } from '../logic/vault.js';
import { STATE, curSave, expandedSections, sv } from '../state.js';
import { go, mkBack, mkHeader, render, root } from '../ui/core.js';
import { CHARACTER_ICON, ICONS, INDEX_ICON, PET_MAIN_ICON, VAULT_CHEST_ICON, gravestoneSvg } from '../ui/icons.js';
import { esc, fmtNum } from '../utils.js';

// ═══ SAVE HOME ═══════════════════════════════════════════
function renderHome(){
  const s=curSave();document.title=s.name;
  const st=saveStats(STATE.currentSave);
  const vs=vaultStats();
  const ip=accountItemProgress();
  root.appendChild(mkBack('Change Account','saves'));
  root.appendChild(mkHeader(s.name,'Account Overview'));

  // ── dashboard ──
  const dash=document.createElement('div');dash.className='dashboard';

  // row 1: key metric cards
  const maxedPct=st.charCount?(st.maxed/st.charCount*100):0;
  const vaultPct=ip.total?(ip.done/ip.total*100):0;
  const totalExalts=DATA.classes.reduce((a,c)=>a+classExaltTotal(s,c.name),0);
  const exaltPct=EXALT_TOTAL?(totalExalts/EXALT_TOTAL*100):0;
  const ap=getAccountProgress(s);
  const lvlPct=(ap.level/ACCOUNT_LEVEL_MAX)*100;
  dash.innerHTML=`
    <div class="dash-metrics">
      <div class="dash-card accent-gold">
        <div class="dash-card-icon">${CHARACTER_ICON}</div>
        <div class="dash-card-body">
          <div class="dash-card-num" style="color:#f5a623;">${st.maxed}<span class="dash-card-of">/${st.charCount}</span></div>
          <div class="dash-card-lbl">Maxed 8/8</div>
          <div class="dash-bar"><div class="dash-bar-fill gold" style="width:${maxedPct}%"></div></div>
        </div>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon" style="color:var(--ut-bright);">${ICONS.chest}</div>
        <div class="dash-card-body">
          <div class="dash-card-num" style="color:var(--ut-bright);">${totalExalts}<span class="dash-card-of">/${EXALT_TOTAL}</span></div>
          <div class="dash-card-lbl">Total Exalts</div>
          <div class="dash-bar"><div class="dash-bar-fill" style="width:${exaltPct}%;background:var(--ut-bright);"></div></div>
        </div>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon" style="color:var(--gold-bright);">${ICONS.scroll}</div>
        <div class="dash-card-body">
          <div class="dash-card-num" style="color:var(--gold-bright);">${ap.level}<span class="dash-card-of">/${ACCOUNT_LEVEL_MAX}</span></div>
          <div class="dash-card-lbl">Account Level</div>
          <div class="dash-bar"><div class="dash-bar-fill" style="width:${lvlPct}%;background:var(--gold-bright);"></div></div>
        </div>
      </div>
      <div class="dash-card">
        <div class="dash-card-icon">${gravestoneSvg(0,30)}</div>
        <div class="dash-card-body">
          <div class="dash-card-num" style="color:#c47060;">${s.cemetery.length}</div>
          <div class="dash-card-lbl">Fallen Heroes</div>
        </div>
      </div>
    </div>

    <div class="dash-progress-section">
      <div class="dash-progress-card">
        <div class="dash-progress-header">
          <span class="dash-progress-title">Item Collection</span>
          <span class="dash-progress-pct">${Math.round(vaultPct)}%</span>
        </div>
        <div class="dash-progress-bar"><div class="dash-progress-fill" style="width:${vaultPct}%"></div></div>
        <div class="dash-progress-detail">
          <span><span class="dot-ut"></span> UT: ${ip.utDone}/${ip.ut}</span>
          <span><span class="dot-st"></span> ST: ${ip.stDone}/${ip.st}</span>
          <span><span class="dot-shiny"></span> Shiny: ${ip.shinyDone}/${ip.shinyP}</span>
          <span><span class="dot-awaken"></span> Awakened: ${ip.awakenDone}/${ip.awakenP}</span>
        </div>
      </div>

      <div class="dash-breakdown">
        <div class="dash-breakdown-title">Collection by Tier</div>
        <div class="dash-tier-row">
          <div class="dash-tier-label" style="color:var(--ut-bright);">UT</div>
          <div class="dash-tier-bar"><div class="dash-tier-fill" style="width:${ip.ut?(ip.utDone/ip.ut*100):0}%;background:var(--ut-bright);"></div></div>
          <div class="dash-tier-val">${ip.utDone}/${ip.ut}</div>
        </div>
        <div class="dash-tier-row">
          <div class="dash-tier-label" style="color:var(--st-bright);">ST</div>
          <div class="dash-tier-bar"><div class="dash-tier-fill" style="width:${ip.st?(ip.stDone/ip.st*100):0}%;background:var(--st-bright);"></div></div>
          <div class="dash-tier-val">${ip.stDone}/${ip.st}</div>
        </div>
        <div class="dash-tier-row">
          <div class="dash-tier-label" style="color:var(--shiny);">Shiny</div>
          <div class="dash-tier-bar"><div class="dash-tier-fill" style="width:${ip.shinyP?(ip.shinyDone/ip.shinyP*100):0}%;background:var(--shiny);"></div></div>
          <div class="dash-tier-val">${ip.shinyDone}/${ip.shinyP}</div>
        </div>
        <div class="dash-tier-row">
          <div class="dash-tier-label" style="color:var(--awaken);">Awaken</div>
          <div class="dash-tier-bar"><div class="dash-tier-fill" style="width:${ip.awakenP?(ip.awakenDone/ip.awakenP*100):0}%;background:var(--awaken);"></div></div>
          <div class="dash-tier-val">${ip.awakenDone}/${ip.awakenP}</div>
        </div>
      </div>
    </div>
  `;
  root.appendChild(dash);

  // account progression
  const apOrn=document.createElement('div');apOrn.className='ornament';apOrn.innerHTML='⚜ &nbsp;·&nbsp; A C C O U N T &nbsp; P R O G R E S S I O N &nbsp;·&nbsp; ⚜';
  root.appendChild(apOrn);
  root.appendChild(renderAccountProgressSection(s));

  // ornament
  const orn=document.createElement('div');orn.className='ornament';orn.innerHTML='◆ &nbsp;·&nbsp; S E C T I O N S &nbsp;·&nbsp; ◆';
  root.appendChild(orn);

  // sections
  const g=document.createElement('div');g.className='section-grid';
  const maxed=s.characters.filter(c=>c.pots&&c.pots.length>=POT_MAX).length;
  g.innerHTML=`
    <div class="section-card" data-s="characters"><div class="section-icon">${CHARACTER_ICON}</div><div class="section-info"><div class="section-name">Characters</div><div class="section-desc">Manage your heroes and track their journey.</div><div class="section-stat"><strong>${st.charCount}</strong> characters · <strong>${maxed}</strong> at 8/8${s.cemetery.length?` · <span style="color:#c47060;display:inline-flex;align-items:center;gap:3px;"><span class="mini-grave">${gravestoneSvg(0,11)}</span>${s.cemetery.length}</span>`:''}</div></div></div>
    <div class="section-card" data-s="vault"><div class="section-icon">${VAULT_CHEST_ICON}</div><div class="section-info"><div class="section-name">Vault</div><div class="section-desc">All items aggregated across characters.</div><div class="section-stat"><strong>${vs.unique}</strong> unique items · <strong>${vs.total}</strong> total</div></div></div>
    <div class="section-card" data-s="pets"><div class="section-icon">${PET_MAIN_ICON}</div><div class="section-info"><div class="section-name">Pets</div><div class="section-desc">Pet Yard roster and fusion.</div><div class="section-stat"><strong>${(s.pets||[]).length}</strong>/${PET_MAX_SLOTS} pets · ${PET_RARITIES[petYardTier(s)].name} Yard</div></div></div>
    <div class="section-card" data-s="index"><div class="section-icon">${INDEX_ICON}</div><div class="section-info"><div class="section-name">Item Index</div><div class="section-desc">Search and browse the full item catalog.</div><div class="section-stat">${DATA.weapons.length+DATA.alt_weapons.length+DATA.armors.length+DATA.abilities.length+DATA.rings.length} items</div></div></div>`;
  root.appendChild(g);
  g.querySelectorAll('.section-card').forEach(c=>c.addEventListener('click',()=>go(c.dataset.s)));
}
// ── account progression section ────────────────────────────
function renderAccountProgressSection(s){
  const ap=getAccountProgress(s);
  const level=ap.level;
  const current=level>0?ACCOUNT_LEVELS[level-1]:null;
  const next=level<ACCOUNT_LEVEL_MAX?ACCOUNT_LEVELS[level]:null;
  const pct=(level/ACCOUNT_LEVEL_MAX)*100;
  const msKey='home::account-milestones';const msOpen=expandedSections.has(msKey);

  const wrap=document.createElement('div');wrap.className='account-progress-section';
  wrap.innerHTML=`
    <div class="account-progress-card">
      <div class="account-level-badge">
        <div class="account-level-num">${level}</div>
        <div class="account-level-lbl">Level</div>
      </div>
      <div class="account-progress-body">
        <div class="account-level-slider-row">
          <button class="account-level-step" data-role="lvl-minus" ${level<=0?'disabled':''}>−</button>
          <input type="range" id="account-level-slider" min="0" max="${ACCOUNT_LEVEL_MAX}" step="1" value="${level}">
          <button class="account-level-step" data-role="lvl-plus" ${level>=ACCOUNT_LEVEL_MAX?'disabled':''}>+</button>
        </div>
        <div class="account-progress-bar"><div class="account-progress-fill" style="width:${pct}%"></div></div>
        <div class="account-progress-rewards">
          ${current?`<div class="account-reward-line current"><strong>Lvl ${current.tier} — ${esc(current.name)}:</strong> ${esc(current.reward)} <span class="account-alxp-ref">(${fmtNum(current.alxp)} ALXP)</span></div>`:'<div class="account-reward-line current" style="color:var(--text-mute);">No milestones reached yet.</div>'}
          ${next?`<div class="account-reward-line next">Next — Lvl ${next.tier} ${esc(next.name)}: ${esc(next.reward)} <span class="account-alxp-ref">(${fmtNum(next.alxp)} ALXP)</span></div>`:`<div class="account-reward-line next" style="color:var(--gold-bright);">Max account level reached!</div>`}
        </div>
      </div>
    </div>

    <div class="account-slots-row">
      <div class="account-slot-box">
        <div class="account-slot-icon">${CHARACTER_ICON}</div>
        <div class="account-slot-info">
          <div class="account-slot-label">Character Slots</div>
          <div class="account-slot-stepper">
            <button data-role="char-minus" ${ap.characterSlots<=1?'disabled':''}>−</button>
            <span class="account-slot-val">${ap.characterSlots}</span>
            <button data-role="char-plus">+</button>
          </div>
          <div class="account-slot-usage">${s.characters.length}/${ap.characterSlots} characters in use</div>
        </div>
      </div>
      <div class="account-slot-box">
        <div class="account-slot-icon">${VAULT_CHEST_ICON}</div>
        <div class="account-slot-info">
          <div class="account-slot-label">Vault Chests</div>
          <div class="account-slot-stepper">
            <button data-role="vault-minus" ${ap.vaultSlots<=1?'disabled':''}>−</button>
            <span class="account-slot-val">${ap.vaultSlots}</span>
            <button data-role="vault-plus">+</button>
          </div>
          <div class="account-slot-usage">${vaultStats().total}/${vaultCapacity(s)} item slots used</div>
        </div>
      </div>
    </div>

    <div class="account-ms-toggle" data-role="ms-toggle"><span class="cat-caret">${msOpen?'▾':'▸'}</span>View all ${ACCOUNT_LEVEL_MAX} milestones</div>
    ${msOpen?`<div class="account-ms-list">${ACCOUNT_LEVELS.map(m=>{
      const done=level>=m.tier;
      return `<div class="account-ms-row ${done?'done':''}"><span class="account-ms-tier">${m.tier}</span><span class="account-ms-name">${esc(m.name)}</span><span class="account-ms-reward">${esc(m.reward)}</span><span class="account-ms-xp">${fmtNum(m.alxp)}</span><span class="account-ms-check">${done?'✓':''}</span></div>`;
    }).join('')}</div>`:''}
  `;

  const setLevel=v=>{ap.level=Math.max(0,Math.min(ACCOUNT_LEVEL_MAX,v));sv();render();};
  wrap.querySelector('#account-level-slider').addEventListener('input',e=>{setLevel(parseInt(e.target.value)||0);});
  wrap.querySelector('[data-role="lvl-minus"]').addEventListener('click',()=>setLevel(level-1));
  wrap.querySelector('[data-role="lvl-plus"]').addEventListener('click',()=>setLevel(level+1));
  wrap.querySelector('[data-role="char-minus"]').addEventListener('click',()=>{ap.characterSlots=Math.max(1,ap.characterSlots-1);sv();render();});
  wrap.querySelector('[data-role="char-plus"]').addEventListener('click',()=>{ap.characterSlots++;sv();render();});
  wrap.querySelector('[data-role="vault-minus"]').addEventListener('click',()=>{ap.vaultSlots=Math.max(1,ap.vaultSlots-1);sv();render();});
  wrap.querySelector('[data-role="vault-plus"]').addEventListener('click',()=>{ap.vaultSlots++;sv();render();});
  wrap.querySelector('[data-role="ms-toggle"]').addEventListener('click',()=>{if(msOpen)expandedSections.delete(msKey);else expandedSections.add(msKey);render();});
  return wrap;
}

export { renderHome, renderAccountProgressSection };
