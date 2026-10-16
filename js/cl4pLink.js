// Gerado a partir de cl4pLink.ts (CL4P-RZ). Link com o hub pessoal: veja docs no repositório CL4P-RZ.
const CHAVE = "cl4p.link.v1";
const CHAVE_STATUS = "cl4p.link.status.v1";
const ESPERA_MS = 3e3;
function lerJson(k) {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
function gravarJson(k, v) {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {
  }
}
function decodificarCodigo(codigo) {
  const m = (codigo || "").trim().match(/^cl4p1\.([A-Za-z0-9_-]+)$/);
  if (!m) return null;
  try {
    const b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
    const json = decodeURIComponent(Array.from(bin, (c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""));
    const o = JSON.parse(json);
    if (typeof o.u !== "string" || typeof o.k !== "string" || !/^https?:\/\//.test(o.u) || !o.k) return null;
    return { u: o.u.replace(/\/+$/, ""), k: o.k };
  } catch {
    return null;
  }
}
let vinculo = lerJson(CHAVE);
let status = lerJson(CHAVE_STATUS) ?? { ultimoEnvio: null, erro: null };
let enviando = false;
const ouvintes = /* @__PURE__ */ new Set();
let pendente = null;
let timer = null;
let ultimoHash = null;
function avisar() {
  gravarJson(CHAVE_STATUS, status);
  ouvintes.forEach((f) => f());
}
function cl4pStatus() {
  let servidor = null;
  try {
    servidor = vinculo ? new URL(vinculo.u).host : null;
  } catch {
    servidor = vinculo?.u ?? null;
  }
  return { vinculado: Boolean(vinculo), servidor, enviando, ...status };
}
function cl4pOuvir(f) {
  ouvintes.add(f);
  return () => void ouvintes.delete(f);
}
function cl4pVincular(codigo) {
  const v = decodificarCodigo(codigo);
  if (!v) return false;
  vinculo = v;
  gravarJson(CHAVE, v);
  ultimoHash = null;
  status = { ...status, erro: null };
  avisar();
  if (pendente) agendar(0);
  return true;
}
function cl4pDesvincular() {
  vinculo = null;
  gravarJson(CHAVE, null);
  status = { ultimoEnvio: null, erro: null };
  avisar();
}
function cl4pCapturarDaUrl() {
  try {
    const u = new URL(window.location.href);
    const hash2 = new URLSearchParams(u.hash.replace(/^#/, ""));
    const cod = hash2.get("cl4p") || u.searchParams.get("cl4p");
    if (!cod) return false;
    u.searchParams.delete("cl4p");
    hash2.delete("cl4p");
    const resto = hash2.toString();
    history.replaceState(history.state, "", u.pathname + u.search + (resto ? `#${resto}` : ""));
    return cl4pVincular(cod);
  } catch {
    return false;
  }
}
function cl4pVinculo() {
  return vinculo ? { ...vinculo } : null;
}
function cl4pCapturarDeepLink(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== "cl4p" && !u.pathname.replace(/^\/+/, "").startsWith("cl4p")) return false;
    const cod = u.searchParams.get("code");
    return cod ? cl4pVincular(cod) : true;
  } catch {
    return false;
  }
}
function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i) | 0;
  return `${s.length}:${h}`;
}
function agendar(ms = ESPERA_MS) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void enviarAgora(), ms);
}
function cl4pPublicar(app, montar) {
  pendente = { app, montar };
  if (vinculo) agendar();
}
async function cl4pEnviarAgora() {
  ultimoHash = null;
  await enviarAgora();
  return cl4pStatus();
}
async function enviarAgora() {
  timer = null;
  if (!vinculo || !pendente || enviando) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  let corpo;
  try {
    const data = pendente.montar();
    const dataJson = JSON.stringify(data);
    const h = hash(dataJson);
    if (h === ultimoHash) return;
    corpo = `{"app":${JSON.stringify(pendente.app)},"schema":1,"generatedAt":${JSON.stringify((/* @__PURE__ */ new Date()).toISOString())},"data":${dataJson}}`;
    ultimoHash = h;
  } catch (e) {
    status = { ...status, erro: `Falha ao montar o resumo: ${e.message}` };
    avisar();
    return;
  }
  enviando = true;
  avisar();
  try {
    const r = await fetch(`${vinculo.u}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${vinculo.k}` },
      body: corpo
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || `Erro ${r.status}`);
    status = { ultimoEnvio: (/* @__PURE__ */ new Date()).toISOString(), erro: null };
  } catch (e) {
    ultimoHash = null;
    status = { ...status, erro: e.message === "Failed to fetch" ? "Sem conex\xE3o com o CL4P-RZ." : e.message };
  } finally {
    enviando = false;
    avisar();
  }
}
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    if (vinculo && pendente) agendar(1e3);
  });
}
export {
  cl4pCapturarDaUrl,
  cl4pCapturarDeepLink,
  cl4pDesvincular,
  cl4pEnviarAgora,
  cl4pOuvir,
  cl4pPublicar,
  cl4pStatus,
  cl4pVincular,
  cl4pVinculo,
  decodificarCodigo
};
