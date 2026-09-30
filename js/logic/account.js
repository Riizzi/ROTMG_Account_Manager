import { CHAR_BACKPACK_INV_SLOTS, CHAR_BASE_INV_SLOTS, CHAR_EQUIP_SLOTS, VAULT_SLOTS_PER_CHEST } from '../data/game.js';
import { vaultStats } from './vault.js';

function getAccountProgress(s){
  if(!s.accountProgress) s.accountProgress={level:0,characterSlots:1,vaultSlots:1};
  if(typeof s.accountProgress.level!=='number') s.accountProgress.level=0;
  if(!(s.accountProgress.characterSlots>=1)) s.accountProgress.characterSlots=1;
  if(!(s.accountProgress.vaultSlots>=1)) s.accountProgress.vaultSlots=1;
  return s.accountProgress;
}
function vaultCapacity(s){return getAccountProgress(s).vaultSlots*VAULT_SLOTS_PER_CHEST;}
function vaultHasRoom(s,addCount){return vaultStats().total+(addCount||1)<=vaultCapacity(s);}
function characterSlotLimit(s){return getAccountProgress(s).characterSlots;}
function charCapacity(ch){return CHAR_EQUIP_SLOTS+(ch.backpack?CHAR_BACKPACK_INV_SLOTS:CHAR_BASE_INV_SLOTS);}
function charInventoryUsed(ch){let n=0;for(const key in ch.items){const e=ch.items[key];n+=Math.max(0,(e.count||0)-(e.vaultCount||0));}return n;}
function charHasRoom(ch,addCount){return charInventoryUsed(ch)+(addCount||1)<=charCapacity(ch);}

export { getAccountProgress, vaultCapacity, vaultHasRoom, characterSlotLimit, charCapacity, charInventoryUsed, charHasRoom };
