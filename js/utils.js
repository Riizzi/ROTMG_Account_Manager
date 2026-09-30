function fmtNum(n){return n.toLocaleString('en-US');}
const pluralize=s=>!s?'?':(/s$/i.test(s)?s:s+'s');
function wikiUrl(n){return 'https://www.google.com/search?q='+encodeURIComponent('realm.wiki '+n+' rotmg');}
function esc(s){return(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function uid(){return Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);}
function fmtDate(ts){return new Date(ts).toLocaleString(undefined,{year:'numeric',month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'});}

export { fmtNum, pluralize, wikiUrl, esc, uid, fmtDate };
