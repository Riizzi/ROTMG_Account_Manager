// ── state ─────────────────────────────────────────────────
const SKEY='rotmg-account-v3';
let STATE={currentSave:null,view:'saves',currentCharId:null,saves:{"1":null,"2":null,"3":null}};
function emptySave(name){return{name,created:Date.now(),characters:[],cemetery:[],rings:{},exalts:{},pets:[],petYard:{tier:0},accountProgress:{level:0,characterSlots:1,vaultSlots:1},vaultExtras:[]};}
function migrateItemEntry(e){
  if(!e)return e;
  if(typeof e.shinyCount!=='number'){e.shinyCount=e.shiny?Math.min(1,e.count||0):0;}
  delete e.shiny;
  if(typeof e.vaultCount!=='number')e.vaultCount=0;
  if(e.vaultCount>e.count)e.vaultCount=e.count;
  if(e.shinyCount>e.count)e.shinyCount=e.count;
  return e;
}
function load(){try{const r=localStorage.getItem(SKEY);if(r){STATE=JSON.parse(r);Object.keys(STATE.saves).forEach(k=>{const s=STATE.saves[k];if(!s)return;
  if(!s.exalts)s.exalts={};
  if(!s.pets)s.pets=[];
  if(!s.petYard)s.petYard={tier:0};
  if(!s.accountProgress)s.accountProgress={level:0,characterSlots:1,vaultSlots:1};
  else{if(!(s.accountProgress.characterSlots>=1))s.accountProgress.characterSlots=Math.max(1,s.characters.length);if(!(s.accountProgress.vaultSlots>=1))s.accountProgress.vaultSlots=1;}
  if(!s.vaultExtras)s.vaultExtras=[];
  (s.characters||[]).forEach(ch=>{if(typeof ch.backpack!=='boolean')ch.backpack=false;for(const key in ch.items)migrateItemEntry(ch.items[key]);});
  for(const rk in s.rings)migrateItemEntry(s.rings[rk]);
});}}catch(e){}}
function sv(){try{localStorage.setItem(SKEY,JSON.stringify(STATE));}catch(e){}}
function curSave(){return STATE.saves[STATE.currentSave];}
function curChar(){const s=curSave();return s?s.characters.find(c=>c.id===STATE.currentCharId):null;}

function getRingEntry(name){const s=curSave();if(!s.rings[name])s.rings[name]={count:0,shinyCount:0,awaken:false,fav:false};return s.rings[name];}
function getCharEntry(char,pool,itemName){if(!char.items[pool+'::'+itemName])char.items[pool+'::'+itemName]={count:0,shiny:false,awaken:false,fav:false};return char.items[pool+'::'+itemName];}
// ── view state (non-persistent) ──────────────────────────
const VIEW={filter:'all',search:''};
const expandedAwakens=new Set(),expandedSections=new Set();

export { SKEY, STATE, emptySave, migrateItemEntry, load, sv, curSave, curChar, getRingEntry, getCharEntry, VIEW, expandedAwakens, expandedSections };
