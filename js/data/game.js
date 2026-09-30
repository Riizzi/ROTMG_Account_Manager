// ── potions ───────────────────────────────────────────────
const POTIONS=[
  {key:'atk',name:'Attack',color:'#8b3d9e',short:'ATK'},
  {key:'def',name:'Defense',color:'#5a5a60',short:'DEF'},
  {key:'spd',name:'Speed',color:'#4caf50',short:'SPD'},
  {key:'dex',name:'Dexterity',color:'#ff8c1a',short:'DEX'},
  {key:'vit',name:'Vitality',color:'#d63838',short:'VIT'},
  {key:'wis',name:'Wisdom',color:'#3a68b8',short:'WIS'},
  {key:'lif',name:'Life',color:'#6cd0d6',short:'LIF'},
  {key:'man',name:'Mana',color:'#f0d446',short:'MAN'}
];
const POT_MAX=8, POT_FULL='#f5a623';
// ── exaltation data ──────────────────────────────────────
const EXALT_STATS=[
  {key:'wis',name:'Wisdom', color:'#3a68b8',dungeons:['Fungal Cavern','Crystal Cavern','Neo Untaris']},
  {key:'vit',name:'Vitality',color:'#d63838',dungeons:['Kogbold Steamworks','Neo Malogia']},
  {key:'dex',name:'Dexterity',color:'#ff8c1a',dungeons:['The Nest','Plagued Nest','Neo Katalund']},
  {key:'spd',name:'Speed',  color:'#4caf50',dungeons:['Cultist Hideout','Ice Citadel','Neo Forax']},
  {key:'def',name:'Defense',color:'#5a5a60',dungeons:['Lost Halls']},
  {key:'atk',name:'Attack', color:'#8b3d9e',dungeons:['Spectral Penitentiary','The Shatters','Moonlight Village']},
  {key:'man',name:'Mana',   color:'#f0d446',dungeons:['The Void','The Shatters','Moonlight Village']},
  {key:'lif',name:'Life',   color:'#6cd0d6',dungeons:['Oryx Sanctuary','The Shatters','Moonlight Village']}
];
const EXALT_MAX=5; // 5 levels per stat
const EXALT_PER_CLASS=40; // 8 stats × 5
const EXALT_TOTAL=EXALT_PER_CLASS*19; // 760
const EXALT_MILESTONES=[
  {at:25, reward:'Nexus Sheep Pet Skin'},
  {at:50, reward:'Mini Guill Pet Skin'},
  {at:100,reward:'Stone Brothers Pet Skin'},
  {at:250,reward:'Janus the Fategazer Pet Skin'},
  {at:500,reward:'Oryx the Exalted Pet Skin'},
  {at:EXALT_TOTAL,reward:'+10% Drop Rate (all classes)'}
];
// Secondary reward thresholds
// Fast Learner: every 8 exalts on a class → +5% XP, max +20% at 32
// Mastery: exalt on all 8 stats → +2.5% dmg per level, max +10% at 4 on all
// Armor/Weapon Proficiency: cross-class by armor/weapon type
// ── account level data ───────────────────────────────────
const ACCOUNT_LEVELS=[
  {tier:1,name:'Title',reward:'Beginner Title Unlocker',alxp:50},
  {tier:2,name:'Emote',reward:'Oryx Evil Laugh (emote)',alxp:500},
  {tier:3,name:'Fame',reward:'50 Fame',alxp:1000},
  {tier:4,name:'Starting Equipment Tier',reward:'Ring of Minor Defense (T0)',alxp:1500},
  {tier:5,name:'Pet Egg, Fame',reward:'Baby Egg + 100 Fame',alxp:2000},
  {tier:6,name:'Great Taco',reward:'Great Taco',alxp:3000},
  {tier:7,name:'Fame',reward:'150 Fame',alxp:4000},
  {tier:8,name:'Starting Equipment Tier',reward:'Tier 1 Weapon & Armor',alxp:5000},
  {tier:9,name:'Vault Chest Slots',reward:'Vault Chest Unlocker',alxp:7500},
  {tier:10,name:'+3% Permanent More Character EXP Received',reward:'+3% Character EXP Boost',alxp:10000},
  {tier:11,name:'Beginner Equipment',reward:'Beginner Weapon & Armor',alxp:13000},
  {tier:12,name:'Starting Equipment Tier',reward:'Tier 1 Ability',alxp:16000},
  {tier:13,name:'Fame',reward:'200 Fame',alxp:20000},
  {tier:14,name:'Power Pizza',reward:'Power Pizza',alxp:25000},
  {tier:15,name:'Mystery Skin',reward:'Class Mystery Skin Chest',alxp:30000},
  {tier:16,name:'Mystery Cloth',reward:'Mystery Cloth (Small & Large)',alxp:35000},
  {tier:17,name:'Fame',reward:'300 Fame',alxp:42500},
  {tier:18,name:'Grapes Of Wrath',reward:'Grapes Of Wrath',alxp:50000},
  {tier:19,name:'Lucky Clover',reward:'Lucky Clover',alxp:57500},
  {tier:20,name:'Character Slot',reward:'Character Slot Unlocker',alxp:65000},
  {tier:21,name:'Stat Potion',reward:'Stat Potion Choice Chest',alxp:75000},
  {tier:22,name:'Starting Equipment Tier',reward:'Tier 2 Weapon & Armor',alxp:85000},
  {tier:23,name:'Fame',reward:'400 Fame',alxp:100000},
  {tier:24,name:'Potion Of Max Level',reward:'Potion of Max Level 1',alxp:115000},
  {tier:25,name:'Starting Equipment Tier',reward:'Tier 3 Weapon & Armor',alxp:130000},
  {tier:26,name:'Pet Style',reward:'Pet Style (Inner Glow Stones)',alxp:150000},
  {tier:27,name:'Fame',reward:'600 Fame',alxp:170000},
  {tier:28,name:'Common Blueprint',reward:'Blueprints 45 & 47',alxp:190000},
  {tier:29,name:'Superburger',reward:'Superburger',alxp:210000},
  {tier:30,name:'+2% Drop Loot Boost',reward:'+2% Drop Loot Boost',alxp:230000},
  {tier:31,name:'Backpack',reward:'Backpack',alxp:260000},
  {tier:32,name:'Starting Equipment Tier',reward:'Ring of Defense (T1)',alxp:290000},
  {tier:33,name:'Fame',reward:'800 Fame',alxp:320000},
  {tier:34,name:'Stat Potion',reward:'Stat Potion Choice Chest',alxp:350000},
  {tier:35,name:'Greater Ore',reward:'Greater Ore',alxp:390000},
  {tier:36,name:'Greater Blueprint',reward:'Blueprint 48 & 45',alxp:430000},
  {tier:37,name:'Fame',reward:'1000 Fame',alxp:470000},
  {tier:38,name:'Intermediate Equipment',reward:'Intermediate Weapon, Armor, Ability, Ring',alxp:520000},
  {tier:39,name:'Double Cheeseburger Deluxe',reward:'Double Cheeseburger Deluxe',alxp:570000},
  {tier:40,name:'+3% Character EXP Received',reward:'+3% EXP Boost',alxp:630000},
  {tier:41,name:'Stat Potion',reward:'Stat Potion Choice Chest',alxp:685000},
  {tier:42,name:'Starting Equipment Tier',reward:'Tier 4 Weapon & Armor',alxp:750000},
  {tier:43,name:'Fame',reward:'1200 Fame',alxp:820000},
  {tier:44,name:'Starting Equipment Tier',reward:'Tier 2 Ability',alxp:900000},
  {tier:45,name:'Engraving & Green Dust',reward:'Stellar Ascend Engraving & Green Dust Charm',alxp:980000},
  {tier:46,name:'Beam Entrance',reward:'Green & Yellow Beam Entrance',alxp:1000000},
  {tier:47,name:'Starting Equipment Tier',reward:'Ring of Greater Defense (T2)',alxp:1100000},
  {tier:48,name:'Exalted Battle Pass Discount',reward:'70% Battle Pass Discount',alxp:1200000},
  {tier:49,name:'Mystery Key',reward:'Rare Mystery Key',alxp:1300000},
  {tier:50,name:'Title & Drop Loot Boost',reward:'+2% Drop Loot Boost & Battle Hardened Title Unlocker',alxp:1500000}
];
const ACCOUNT_LEVEL_MAX=50;
const VAULT_SLOTS_PER_CHEST=8;
const CHAR_EQUIP_SLOTS=4;const CHAR_BASE_INV_SLOTS=8;const CHAR_BACKPACK_INV_SLOTS=16;
// ── pet data ──────────────────────────────────────────────
const PET_RARITIES=[
  {key:'common',name:'Common',color:'#9aa0a6',cap:30},
  {key:'uncommon',name:'Uncommon',color:'#4caf50',cap:50},
  {key:'rare',name:'Rare',color:'#3a68b8',cap:70},
  {key:'legendary',name:'Legendary',color:'#8b3d9e',cap:90},
  {key:'divine',name:'Divine',color:'#f5a623',cap:100}
];
const PET_MAX_SLOTS=20;
const PET_FAMILIES=['Aquatic','Automation','Avian','Canine','Exotic','Farm','Feline','Humanoid','Insect','Penguin','Reptile','Spooky','Woodland','????'];
const PET_ABILITIES=['Heal','Magic Heal','Attack Close','Attack Mid','Attack Far','Electric','Savage','Rising Fury','Decoy'];
const PET_FUSE_COST=[{fame:525,gold:100},{fame:1750,gold:240},{fame:7000,gold:600},{fame:26250,gold:1800}]; // indexed by source (pre-fusion) rarity

export { POTIONS, POT_MAX, POT_FULL, EXALT_STATS, EXALT_MAX, EXALT_PER_CLASS, EXALT_TOTAL, EXALT_MILESTONES, ACCOUNT_LEVELS, ACCOUNT_LEVEL_MAX, VAULT_SLOTS_PER_CHEST, CHAR_EQUIP_SLOTS, CHAR_BASE_INV_SLOTS, CHAR_BACKPACK_INV_SLOTS, PET_RARITIES, PET_MAX_SLOTS, PET_FAMILIES, PET_ABILITIES, PET_FUSE_COST };
