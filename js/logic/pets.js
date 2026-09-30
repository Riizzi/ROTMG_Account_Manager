import { PET_RARITIES } from '../data/game.js';

function petUnlockedCount(rarity){ return rarity>=3?3:(rarity>=1?2:1); }
function petYardTier(s){ if(!s.petYard) s.petYard={tier:0}; return s.petYard.tier; }
function petDisplayName(p){ return p.name ? p.name : PET_RARITIES[p.rarity].name+' '+p.family; }
function petCap(p){ return (typeof p.cap==='number') ? p.cap : PET_RARITIES[p.rarity].cap; }
function fusePreview(recipient,catalyst){
  const nextRarity=recipient.rarity+1;
  const bonus=recipient.rarity===3?10:20; // both-Legendary fusion (→Divine) uses +10 instead of +20
  const a1=(recipient.abilities[0]&&recipient.abilities[0].level)||0;
  const b1=(catalyst.abilities[0]&&catalyst.abilities[0].level)||0;
  const sourceRarityCap=PET_RARITIES[recipient.rarity].cap; // the resultant pet can never end up worse than the pre-fusion rarity's own cap
  const cap=Math.max(Math.floor((a1+b1)/2)+bonus,sourceRarityCap);
  const unlocked=petUnlockedCount(nextRarity);
  const abilities=recipient.abilities.map((ab,i)=>{
    if(i>=unlocked) return {type:ab.type,level:0,locked:true};
    const al=ab.level||0, bl=(catalyst.abilities[i]&&catalyst.abilities[i].level)||0;
    const lvl=Math.min(Math.floor((al+bl)/2),cap);
    return {type:ab.type,level:lvl,locked:false};
  });
  return {family:recipient.family,rarity:nextRarity,abilities,cap};
}

export { petUnlockedCount, petYardTier, petDisplayName, petCap, fusePreview };
