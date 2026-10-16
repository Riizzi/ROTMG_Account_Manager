// ── CL4P-RZ link ─────────────────────────────────────────
// Sends a small summary of the accounts (characters, maxed stats, deaths, pets) to the
// owner's personal hub CL4P-RZ. Nothing is sent until a link code is set.
import { STATE } from './state.js';
import { cl4pCapturarDaUrl, cl4pDesvincular, cl4pEnviarAgora, cl4pOuvir, cl4pPublicar, cl4pStatus, cl4pVincular } from './cl4pLink.js';
import { esc } from './utils.js';

function summary() {
  const contas = Object.values(STATE.saves).filter(Boolean).map((s) => ({
    nome: s.name,
    personagens: (s.characters || []).map((c) => ({ classe: c.className, maxados: (c.pots || []).length })),
    mortes: (s.cemetery || []).map((t) => ({ classe: t.className, data: t.diedAt ? new Date(t.diedAt).toISOString() : undefined })),
    pets: (s.pets || []).length,
  }));
  return { contas };
}

function publish() {
  cl4pPublicar('rotmg', summary);
}

export function initCl4p() {
  cl4pCapturarDaUrl();
  publish();
  window.addEventListener('rotmg-saved', publish);
}

/** Settings card shown on the accounts screen. */
export function renderCl4pCard() {
  const el = document.createElement('div');
  el.className = 'cl4p-card';
  const draw = () => {
    const st = cl4pStatus();
    const when = st.ultimoEnvio ? new Date(st.ultimoEnvio).toLocaleString() : null;
    el.innerHTML = `
      <div class="cl4p-head"><span class="cl4p-title">CL4P-RZ link</span><span class="cl4p-state ${st.vinculado ? 'on' : ''}">${st.vinculado ? '● linked' : '○ off'}</span></div>
      <p class="cl4p-text">${st.vinculado ? `A summary of your accounts goes to your hub (${esc(st.servidor || '')}) whenever something changes.` : 'Open this app from CL4P-RZ, or paste the link code shown in the hub settings.'}</p>
      ${st.vinculado
        ? `<p class="cl4p-text mono">${st.enviando ? 'Sending…' : when ? `Last sent: ${esc(when)}` : 'Nothing sent yet.'}</p>${st.erro ? `<p class="cl4p-err">${esc(st.erro)}</p>` : ''}
           <div class="cl4p-row"><button class="btn primary" data-a="send">Send now</button><button class="btn" data-a="unlink">Unlink</button></div>`
        : `<div class="cl4p-row"><input class="cl4p-input" placeholder="cl4p1.…" autocapitalize="off" autocorrect="off"><button class="btn primary" data-a="link">Link</button></div><p class="cl4p-err" hidden></p>`}`;
    el.querySelector('[data-a="send"]')?.addEventListener('click', () => void cl4pEnviarAgora());
    el.querySelector('[data-a="unlink"]')?.addEventListener('click', () => cl4pDesvincular());
    el.querySelector('[data-a="link"]')?.addEventListener('click', () => {
      const input = el.querySelector('.cl4p-input');
      if (!cl4pVincular(input.value)) {
        const err = el.querySelector('.cl4p-err');
        err.textContent = 'Invalid code.';
        err.hidden = false;
      } else publish();
    });
  };
  draw();
  const off = cl4pOuvir(() => (el.isConnected ? draw() : off()));
  return el;
}
