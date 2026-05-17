// ==================== DEFAULT SETTINGS (valeur par défaut) ====================
const APP_VERSION = "v1.1.7";
const DEFAULT_SETTINGS = {
    early: {
        legend: { SPD:14, HP:18, DEF:18, ATK:16, CRate:11, CDmg:14, ACC:18, RES:18 },
        hero:   { SPD:10, HP:14, DEF:14, ATK:12, CRate:8,  CDmg:10, ACC:14, RES:14 }
    },
    mid: {
        legend: { SPD:15, HP:20, DEF:20, ATK:17, CRate:13, CDmg:16, ACC:22, RES:22 },
        hero:   { SPD:14, HP:18, DEF:18, ATK:16, CRate:12, CDmg:15, ACC:18, RES:18 }
    },
    late: {
        legend: { SPD:21, HP:28, DEF:28, ATK:23, CRate:19, CDmg:23, ACC:27, RES:27 },
        hero:   { SPD:18, HP:24, DEF:24, ATK:21, CRate:16, CDmg:20, ACC:23, RES:23 }
    },
    duo: {
        legend: {
            early: {
                SPD_min: 10, SPD_partner: 12,
                CRate_for_CDmg: 10, CDmg_for_CRate: 12,
                CRate_for_ATK: 10, ATK_for_CRate: 14,
                HP_for_DEF: 14, DEF_for_HP: 14,
                DEF_for_RES: 14, RES_for_DEF: 14,
                HP_for_RES: 14, RES_for_HP: 14
            },
            mid: {
                SPD_min: 12, SPD_partner: 16,
                CRate_for_CDmg: 12, CDmg_for_CRate: 15,
                CRate_for_ATK: 12, ATK_for_CRate: 14,
                HP_for_DEF: 16, DEF_for_HP: 16,
                DEF_for_RES: 16, RES_for_DEF: 16,
                HP_for_RES: 16, RES_for_HP: 16
            },
            late: {
                SPD_min: 15, SPD_partner: 20,
                CRate_for_CDmg: 14, CDmg_for_CRate: 19,
                CRate_for_ATK: 14, ATK_for_CRate: 14,
                HP_for_DEF: 20, DEF_for_HP: 20,
                DEF_for_RES: 20, RES_for_DEF: 20,
                HP_for_RES: 20, RES_for_HP: 20
            }
        },
        hero: {
            early: {
                SPD_min: 8, SPD_partner: 11,
                CRate_for_CDmg: 8, CDmg_for_CRate: 9,
                CRate_for_ATK: 8, ATK_for_CRate: 14,
                HP_for_DEF: 11, DEF_for_HP: 11,
                DEF_for_RES: 11, RES_for_DEF: 11,
                HP_for_RES: 11, RES_for_HP: 11
            },
            mid: {
                SPD_min: 10, SPD_partner: 12,
                CRate_for_CDmg: 10, CDmg_for_CRate: 12,
                CRate_for_ATK: 10, ATK_for_CRate: 14,
                HP_for_DEF: 14, DEF_for_HP: 14,
                DEF_for_RES: 14, RES_for_DEF: 14,
                HP_for_RES: 14, RES_for_HP: 14
            },
            late: {
                SPD_min: 10, SPD_partner: 14,
                CRate_for_CDmg: 10, CDmg_for_CRate: 14,
                CRate_for_ATK: 10, ATK_for_CRate: 14,
                HP_for_DEF: 14, DEF_for_HP: 14,
                DEF_for_RES: 14, RES_for_DEF: 14,
                HP_for_RES: 14, RES_for_HP: 14
            }
        }
    }
};

// Seuils minimum pour l'innée (Reapp)
const INNATE_THRESHOLDS = {
    'HP%': 7,
    'DEF%': 7,
    'ATK%': 7,
    'CRate': 5,
    'CDmg': 6,
    'ACC': 6,
    'RES': 7,
    'HP flat': 149,
    'DEF flat': 10,
    'ATK flat': 11
};

// ==================== CHARGEMENT DES SETTINGS ====================
let SETTINGS = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
let showAdvanced = false; // mode avancé
let currentDecisionFilters = ['Keep', 'Sell', 'Gem', 'Upgrade', 'Reapp', 'Finish'];

function loadSettings() {
    const saved = localStorage.getItem('sw_rune_settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            SETTINGS = mergeDeep(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), parsed);
        } catch(e) { console.warn(e); }
    }
}

function saveSettings() {
    localStorage.setItem('sw_rune_settings', JSON.stringify(SETTINGS));
}

function mergeDeep(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) output[key] = source[key];
                else output[key] = mergeDeep(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        });
    }
    return output;
}
function isObject(item) { return (item && typeof item === 'object' && !Array.isArray(item)); }

// ==================== FONCTIONS UTILITAIRES ====================
let allRunes = [];
let currentFilterSet = "all";
let currentSort = { column: null, asc: true };
let currentGameLevel = "early";

function getSubstatValue(rune, statName) {
    const val = rune[statName];
    if (val === undefined || val === "" || val === "-") return 0;
    return parseFloat(val) || 0;
}

function getInnateType(rune) { return rune.i_t || ''; }
function getInnateValue(rune) { const v = rune.i_v; return (v && v !== "") ? parseFloat(v) : 0; }
function getInnateText(rune) {
    const type = getInnateType(rune);
    const val = getInnateValue(rune);
    if (!type) return "—";
    return `${type} ${val}${type.includes('%') ? '%' : ''}`;
}

function getMainStatType(rune) { return rune.m_t || ''; }
function getMainStatValue(rune) { return parseFloat(rune.m_v) || 0; }
function getSlot(rune) { return parseInt(rune.slot) || 0; }
function getQuality(rune) { return (rune.quality || '').trim(); }
function isLegend(rune) { return getQuality(rune) === 'Legend'; }
function getRarityKey(rune) { return isLegend(rune) ? 'legend' : 'hero'; }
function getRarityText(rune) {
    if (isLegend(rune)) return "Légendaire";
    const q = getQuality(rune);
    if (q === 'Hero') return "Héroïque";
    if (q === 'Rare') return "Rare";
    return "Commun";
}
function getStatThreshold(rune, statName) {
    const game = SETTINGS[currentGameLevel];
    const rarity = getRarityKey(rune);
    return game[rarity][statName];
}
function getLevel(rune) { return parseInt(rune.level) || 0; }
function getSet(rune) { return rune.set || ''; }

function isStatPresent(rune, statName) {
    const subKey = `sub_${statName.toLowerCase()}`;
    if (getSubstatValue(rune, subKey) > 0) return true;
    if (getMainStatType(rune) === statName) return true;
    if (getInnateType(rune) === statName) return true;
    return false;
}
function getStatValue(rune, statName) {
    const subKey = `sub_${statName.toLowerCase()}`;
    let val = getSubstatValue(rune, subKey);
    if (val > 0) return val;
    if (getMainStatType(rune) === statName) return getMainStatValue(rune);
    if (getInnateType(rune) === statName) return getInnateValue(rune);
    return 0;
}

function getSubstatsText(rune) {
    const parts = [];
    const spd = getSubstatValue(rune, 'sub_spd');
    if (spd) parts.push(`SPD ${spd}`);
    const crate = getSubstatValue(rune, 'sub_crate');
    if (crate) parts.push(`Taux CR ${crate}%`);
    const cdmg = getSubstatValue(rune, 'sub_cdmg');
    if (cdmg) parts.push(`Dég CR ${cdmg}%`);
    const atkp = getSubstatValue(rune, 'sub_atkp');
    if (atkp) parts.push(`ATK% ${atkp}%`);
    const hpp = getSubstatValue(rune, 'sub_hpp');
    if (hpp) parts.push(`HP% ${hpp}%`);
    const defp = getSubstatValue(rune, 'sub_defp');
    if (defp) parts.push(`DEF% ${defp}%`);
    const acc = getSubstatValue(rune, 'sub_acc');
    if (acc) parts.push(`ACC ${acc}%`);
    const res = getSubstatValue(rune, 'sub_res');
    if (res) parts.push(`RES ${res}%`);
    const atkf = getSubstatValue(rune, 'sub_atkf');
    if (atkf) parts.push(`ATK flat ${atkf}`);
    const deff = getSubstatValue(rune, 'sub_deff');
    if (deff) parts.push(`DEF flat ${deff}`);
    const hpf = getSubstatValue(rune, 'sub_hpf');
    if (hpf) parts.push(`HP flat ${hpf}`);
    return parts.join(', ') || "—";
}

// ==================== POWER LEVEL ====================
function getPowerLevel(rune) {
    const thresholds = SETTINGS[currentGameLevel][getRarityKey(rune)];
    const stats = [
        { name: 'SPD', val: getStatValue(rune, 'SPD') },
        { name: 'HP', val: getStatValue(rune, 'HP') },
        { name: 'DEF', val: getStatValue(rune, 'DEF') },
        { name: 'ATK', val: getStatValue(rune, 'ATK') },
        { name: 'CRate', val: getStatValue(rune, 'CRate') },
        { name: 'CDmg', val: getStatValue(rune, 'CDmg') },
        { name: 'ACC', val: getStatValue(rune, 'ACC') },
        { name: 'RES', val: getStatValue(rune, 'RES') }
    ];
    let count = 0;
    for (let s of stats) {
        if (s.val >= thresholds[s.name]) count++;
    }
    return count;
}

// ==================== MODE ====================
function getModeCol(rune) {
    const base = currentGameLevel === 'early' ? 'Early' : (currentGameLevel === 'mid' ? 'Mid' : 'Late');
    return base + (isLegend(rune) ? '_Leg' : '_Hero');
}

// ==================== BAD FLAT ====================
function getBadFlat(rune) {
    const flatStats = [
        { key: 'sub_atkf', threshold: 20 },
        { key: 'sub_hpf', threshold: 200 },
        { key: 'sub_deff', threshold: 20 }
    ];
    let weakFlatCount = 0;
    for (let fs of flatStats) {
        let val = getSubstatValue(rune, fs.key);
        if (val > 0 && val <= fs.threshold) weakFlatCount++;
    }
    const required = currentGameLevel === 'late' ? 1 : 2;
    return weakFlatCount >= required ? 'Flat' : 'Clean';
}

// ==================== HIGH ROLL ====================
function getHighRoll(rune) {
    const stats = ['SPD', 'HP', 'DEF', 'ATK', 'CRate', 'CDmg', 'ACC', 'RES'];
    for (let s of stats) {
        let val = getStatValue(rune, s);
        let threshold = getStatThreshold(rune, s);
        if (val >= threshold) return 'Match';
    }
    return 'No';
}

// ==================== DUO ROLL ====================
function getDuoRoll(rune) {
    const level = currentGameLevel;
    const rarity = getRarityKey(rune);
    const duo = SETTINGS.duo[rarity][level];
    const substats = [
        { name: 'SPD', val: getStatValue(rune, 'SPD') },
        { name: 'HP', val: getStatValue(rune, 'HP') },
        { name: 'DEF', val: getStatValue(rune, 'DEF') },
        { name: 'ATK', val: getStatValue(rune, 'ATK') },
        { name: 'CRate', val: getStatValue(rune, 'CRate') },
        { name: 'CDmg', val: getStatValue(rune, 'CDmg') },
        { name: 'ACC', val: getStatValue(rune, 'ACC') },
        { name: 'RES', val: getStatValue(rune, 'RES') }
    ];
    const hasStat = (name, minVal) => substats.some(s => s.name === name && s.val >= minVal);
    if (hasStat('SPD', duo.SPD_min)) {
        const partnerMin = duo.SPD_partner;
        if (hasStat('HP', partnerMin) || hasStat('DEF', partnerMin) || hasStat('ACC', partnerMin) ||
            hasStat('CRate', partnerMin) || hasStat('ATK', partnerMin) || hasStat('CDmg', partnerMin))
            return 'Match';
    }
    if (hasStat('CRate', duo.CRate_for_CDmg) && hasStat('CDmg', duo.CDmg_for_CRate)) return 'Match';
    if (hasStat('CRate', duo.CRate_for_ATK) && hasStat('ATK', duo.ATK_for_CRate)) return 'Match';
    if (hasStat('HP', duo.HP_for_DEF) && hasStat('DEF', duo.DEF_for_HP)) return 'Match';
    if (hasStat('DEF', duo.DEF_for_RES) && hasStat('RES', duo.RES_for_DEF)) return 'Match';
    if (hasStat('HP', duo.HP_for_RES) && hasStat('RES', duo.RES_for_HP)) return 'Match';
    return 'No';
}

// ==================== CLASSIC DPS ====================
function getClassicDPS(rune) {
    const slot = getSlot(rune);
    const mainType = getMainStatType(rune);
    const mainValue = getMainStatValue(rune);
    const isLeg = isLegend(rune);
    const sub_crate = getSubstatValue(rune, 'sub_crate');
    const sub_cdmg = getSubstatValue(rune, 'sub_cdmg');
    const sub_atk = getSubstatValue(rune, 'sub_atkp');
    const sub_spd = getSubstatValue(rune, 'sub_spd');
    const innateType = getInnateType(rune);
    const innateValue = getInnateValue(rune);
    
    const getVal = (stat) => {
        if (stat === 'SPD') {
            if (sub_spd > 0) return sub_spd;
            if (mainType === 'SPD') return mainValue;
            if (innateType === 'SPD') return innateValue;
        } else if (stat === 'CRate') {
            if (sub_crate > 0) return sub_crate;
            if (mainType === 'CRate') return mainValue;
            if (innateType === 'CRate') return innateValue;
        } else if (stat === 'CDmg') {
            if (sub_cdmg > 0) return sub_cdmg;
            if (mainType === 'CDmg') return mainValue;
            if (innateType === 'CDmg') return innateValue;
        } else if (stat === 'ATK') {
            if (sub_atk > 0) return sub_atk;
            if (mainType === 'ATK%') return mainValue;
            if (innateType === 'ATK%') return innateValue;
        }
        return 0;
    };
    const isPresent = (stat) => {
        if (stat === 'SPD') return sub_spd > 0 || mainType === 'SPD' || innateType === 'SPD';
        if (stat === 'CRate') return sub_crate > 0 || mainType === 'CRate' || innateType === 'CRate';
        if (stat === 'CDmg') return sub_cdmg > 0 || mainType === 'CDmg' || innateType === 'CDmg';
        if (stat === 'ATK') return sub_atk > 0 || mainType === 'ATK%' || innateType === 'ATK%';
        return false;
    };
    const thresholdsHero = SETTINGS[currentGameLevel].hero;
    let anchor = true;
    if (!isLeg) {
        anchor = false;
        for (let s of ['SPD', 'CRate', 'CDmg', 'ATK']) {
            if (getVal(s) >= thresholdsHero[s]) { anchor = true; break; }
        }
    }
    if (!anchor) return 'No';
    const cratePresent = isPresent('CRate');
    const cdmgPresent = isPresent('CDmg');
    const atkPresent = isPresent('ATK');
    const spdPresent = isPresent('SPD');
    const dmgCount = [cratePresent, cdmgPresent, atkPresent].filter(Boolean).length;
    if ([1,3,5].includes(slot)) return (spdPresent && dmgCount >= 2) ? 'Match' : 'No';
    if (slot === 2 && mainType === 'SPD') return (cratePresent && (cdmgPresent || atkPresent)) ? 'Match' : 'No';
    if (slot === 4 && mainType === 'CRate') return (spdPresent && (atkPresent || cdmgPresent)) ? 'Match' : 'No';
    if (slot === 6 && (mainType === 'ATK%' || mainType === 'CDmg')) return (spdPresent && cratePresent) ? 'Match' : 'No';
    return 'No';
}

// ==================== SLOW DPS ====================
function getSlowDPS(rune) {
    const slot = getSlot(rune);
    const mainType = getMainStatType(rune);
    const mainValue = getMainStatValue(rune);
    const isLeg = isLegend(rune);
    const sub_crate = getSubstatValue(rune, 'sub_crate');
    const sub_cdmg = getSubstatValue(rune, 'sub_cdmg');
    const sub_atk = getSubstatValue(rune, 'sub_atkp');
    const innateType = getInnateType(rune);
    const innateValue = getInnateValue(rune);
    const getVal = (stat) => {
        if (stat === 'CRate') {
            if (sub_crate > 0) return sub_crate;
            if (mainType === 'CRate') return mainValue;
            if (innateType === 'CRate') return innateValue;
        } else if (stat === 'CDmg') {
            if (sub_cdmg > 0) return sub_cdmg;
            if (mainType === 'CDmg') return mainValue;
            if (innateType === 'CDmg') return innateValue;
        } else if (stat === 'ATK') {
            if (sub_atk > 0) return sub_atk;
            if (mainType === 'ATK%') return mainValue;
            if (innateType === 'ATK%') return innateValue;
        }
        return 0;
    };
    const isPresent = (stat) => {
        if (stat === 'CRate') return sub_crate > 0 || mainType === 'CRate' || innateType === 'CRate';
        if (stat === 'CDmg') return sub_cdmg > 0 || mainType === 'CDmg' || innateType === 'CDmg';
        if (stat === 'ATK') return sub_atk > 0 || mainType === 'ATK%' || innateType === 'ATK%';
        return false;
    };
    const thresholdsHero = SETTINGS[currentGameLevel].hero;
    let anchor = true;
    if (!isLeg) {
        anchor = false;
        for (let s of ['CRate', 'CDmg', 'ATK']) {
            if (getVal(s) >= thresholdsHero[s]) { anchor = true; break; }
        }
    }
    if (!anchor) return 'No';
    let dmgCount = 0;
    if (isPresent('CRate')) dmgCount++;
    if (isPresent('CDmg')) dmgCount++;
    if (isPresent('ATK')) dmgCount++;
    if ([1,3,5].includes(slot)) return dmgCount === 3 ? 'Match' : 'No';
    if (['ATK%', 'CDmg', 'CRate'].includes(mainType)) return dmgCount >= 2 ? 'Match' : 'No';
    return 'No';
}

// ==================== BOMBER ====================
function getBomber(rune) {
    const slot = getSlot(rune);
    const mainType = getMainStatType(rune);
    const isLeg = isLegend(rune);
    const sub_spd = getSubstatValue(rune, 'sub_spd');
    const sub_atk = getSubstatValue(rune, 'sub_atkp');
    const sub_acc = getSubstatValue(rune, 'sub_acc');
    const innateType = getInnateType(rune);
    const innateValue = getInnateValue(rune);
    const hasStat = (stat) => {
        if (stat === 'SPD') return sub_spd > 0 || mainType === 'SPD' || innateType === 'SPD';
        if (stat === 'ATK') return sub_atk > 0 || mainType === 'ATK%' || innateType === 'ATK%';
        if (stat === 'ACC') return sub_acc > 0 || mainType === 'ACC' || innateType === 'ACC';
        return false;
    };
    const getValue = (stat) => {
        if (stat === 'SPD') {
            if (sub_spd > 0) return sub_spd;
            if (mainType === 'SPD') return getMainStatValue(rune);
            if (innateType === 'SPD') return innateValue;
        } else if (stat === 'ATK') {
            if (sub_atk > 0) return sub_atk;
            if (mainType === 'ATK%') return getMainStatValue(rune);
            if (innateType === 'ATK%') return innateValue;
        } else if (stat === 'ACC') {
            if (sub_acc > 0) return sub_acc;
            if (mainType === 'ACC') return getMainStatValue(rune);
            if (innateType === 'ACC') return innateValue;
        }
        return 0;
    };
    const thresholdsHero = SETTINGS[currentGameLevel].hero;
    if (!isLeg) {
        let anchor = false;
        for (let s of ['SPD', 'ATK', 'ACC']) {
            if (getValue(s) >= thresholdsHero[s]) { anchor = true; break; }
        }
        if (!anchor) return 'No';
    }
    let bomberCount = 0;
    if (hasStat('SPD')) bomberCount++;
    if (hasStat('ATK')) bomberCount++;
    if (hasStat('ACC')) bomberCount++;
    if ([1,3,5].includes(slot)) return bomberCount === 3 ? 'Match' : 'No';
    if (['ATK%', 'SPD', 'ACC'].includes(mainType)) return bomberCount >= 2 ? 'Match' : 'No';
    return 'No';
}

// ==================== TANK & SUPPORT ====================
function getTankSupport(rune) {
    const slot = getSlot(rune);
    const mainType = getMainStatType(rune);
    const isLeg = isLegend(rune);
    const sub_spd = getSubstatValue(rune, 'sub_spd');
    const sub_hp = getSubstatValue(rune, 'sub_hpp');
    const sub_def = getSubstatValue(rune, 'sub_defp');
    const sub_acc = getSubstatValue(rune, 'sub_acc');
    const sub_res = getSubstatValue(rune, 'sub_res');
    const innateType = getInnateType(rune);
    const innateValue = getInnateValue(rune);
    const hasStat = (stat) => {
        if (stat === 'SPD') return sub_spd > 0 || innateType === 'SPD';
        if (stat === 'HP') return sub_hp > 0 || innateType === 'HP%';
        if (stat === 'DEF') return sub_def > 0 || innateType === 'DEF%';
        if (stat === 'ACC') return sub_acc > 0 || innateType === 'ACC';
        if (stat === 'RES') return sub_res > 0 || innateType === 'RES';
        return false;
    };
    const getValue = (stat) => {
        if (stat === 'SPD') {
            if (sub_spd > 0) return sub_spd;
            if (innateType === 'SPD') return innateValue;
        } else if (stat === 'HP') {
            if (sub_hp > 0) return sub_hp;
            if (innateType === 'HP%') return innateValue;
        } else if (stat === 'DEF') {
            if (sub_def > 0) return sub_def;
            if (innateType === 'DEF%') return innateValue;
        } else if (stat === 'ACC') {
            if (sub_acc > 0) return sub_acc;
            if (innateType === 'ACC') return innateValue;
        } else if (stat === 'RES') {
            if (sub_res > 0) return sub_res;
            if (innateType === 'RES') return innateValue;
        }
        return 0;
    };
    let tankCount = 0;
    if (hasStat('SPD')) tankCount++;
    if (hasStat('HP')) tankCount++;
    if (hasStat('DEF')) tankCount++;
    const utility = (hasStat('ACC') || hasStat('RES')) ? 1 : 0;
    tankCount += utility;
    if (!isLeg) {
        const thresholdsHero = SETTINGS[currentGameLevel].hero;
        let anchor = false;
        const tankStats = ['SPD', 'HP', 'DEF', 'ACC', 'RES'];
        for (let s of tankStats) {
            if (getValue(s) >= thresholdsHero[s]) { anchor = true; break; }
        }
        if (!anchor) return 'No';
    }
    if ([1,3,5].includes(slot)) return tankCount >= 3 ? 'Match' : 'No';
    if (['HP%', 'DEF%', 'SPD', 'ACC', 'RES'].includes(mainType)) return tankCount >= 2 ? 'Match' : 'No';
    return 'No';
}

// ==================== BRUISER ====================
function getBruiser(rune) {
    const quality = getQuality(rune);
    if (quality !== 'Legend' && quality !== 'Hero') return 'No';
    const slot = getSlot(rune);
    const mainType = getMainStatType(rune);
    const isLeg = (quality === 'Legend');
    const sub_crate = getSubstatValue(rune, 'sub_crate');
    const sub_spd = getSubstatValue(rune, 'sub_spd');
    const sub_hp = getSubstatValue(rune, 'sub_hpp');
    const sub_def = getSubstatValue(rune, 'sub_defp');
    const sub_cdmg = getSubstatValue(rune, 'sub_cdmg');
    const sub_atk = getSubstatValue(rune, 'sub_atkp');
    const innateType = getInnateType(rune);
    const innateValue = getInnateValue(rune);
    const hasStat = (stat) => {
        if (stat === 'CRate') return sub_crate > 0 || innateType === 'CRate';
        if (stat === 'SPD') return sub_spd > 0 || innateType === 'SPD';
        if (stat === 'HP') return sub_hp > 0 || innateType === 'HP%';
        if (stat === 'DEF') return sub_def > 0 || innateType === 'DEF%';
        if (stat === 'CDmg') return sub_cdmg > 0 || innateType === 'CDmg';
        if (stat === 'ATK') return sub_atk > 0 || innateType === 'ATK%';
        return false;
    };
    let bruiserSubCount = 0;
    if (hasStat('SPD')) bruiserSubCount++;
    if (hasStat('HP')) bruiserSubCount++;
    if (hasStat('DEF')) bruiserSubCount++;
    if (hasStat('CDmg')) bruiserSubCount++;
    if (hasStat('ATK')) bruiserSubCount++;
    const cratePresent = hasStat('CRate') || mainType === 'CRate';
    let bruiserTotalCount = bruiserSubCount;
    if (['HP%', 'DEF%', 'CDmg', 'SPD', 'ATK%'].includes(mainType)) bruiserTotalCount++;
    if (!isLeg) {
        const thresholdsHero = SETTINGS[currentGameLevel].hero;
        let anchor = false;
        const getEffectiveValue = (stat) => {
            if (stat === 'CRate') {
                if (sub_crate > 0) return sub_crate;
                if (mainType === 'CRate') return getMainStatValue(rune);
                if (innateType === 'CRate') return innateValue;
            } else if (stat === 'SPD') {
                if (sub_spd > 0) return sub_spd;
                if (mainType === 'SPD') return getMainStatValue(rune);
                if (innateType === 'SPD') return innateValue;
            } else if (stat === 'HP') {
                if (sub_hp > 0) return sub_hp;
                if (mainType === 'HP%') return getMainStatValue(rune);
                if (innateType === 'HP%') return innateValue;
            } else if (stat === 'DEF') {
                if (sub_def > 0) return sub_def;
                if (mainType === 'DEF%') return getMainStatValue(rune);
                if (innateType === 'DEF%') return innateValue;
            } else if (stat === 'CDmg') {
                if (sub_cdmg > 0) return sub_cdmg;
                if (mainType === 'CDmg') return getMainStatValue(rune);
                if (innateType === 'CDmg') return innateValue;
            } else if (stat === 'ATK') {
                if (sub_atk > 0) return sub_atk;
                if (mainType === 'ATK%') return getMainStatValue(rune);
                if (innateType === 'ATK%') return innateValue;
            }
            return 0;
        };
        for (let s of ['CRate', 'SPD', 'HP', 'DEF', 'CDmg', 'ATK']) {
            if (getEffectiveValue(s) >= thresholdsHero[s]) { anchor = true; break; }
        }
        if (!anchor) return 'No';
    }
    if ([1,3,5].includes(slot)) return (cratePresent && bruiserSubCount >= 2) ? 'Match' : 'No';
    if (['HP%', 'DEF%', 'CDmg', 'SPD', 'ATK%'].includes(mainType)) return (cratePresent && bruiserTotalCount >= 2) ? 'Match' : 'No';
    return 'No';
}

// ==================== REAPP ====================
function getReapp(rune) {
    const metaSets = ['Violent', 'Swift', 'Will', 'Rage', 'Despair', 'Fatal', 'Blade', 'Nemesis', 'Shield', 'Revenge', 'Destroy', 'Vampire'];
    if (!isLegend(rune)) return 'No';
    if (!metaSets.includes(getSet(rune))) return 'No';
    const innateType = getInnateType(rune);
    const innateValue = getInnateValue(rune);
    if (!innateType || innateValue === 0) return 'No';
    if (innateType === 'SPD') return 'No';
    const threshold = INNATE_THRESHOLDS[innateType];
    if (threshold === undefined) return 'No';
    if (innateValue < threshold) return 'No';
    const slot = getSlot(rune);
    if ([2,4,6].includes(slot)) {
        const mainType = getMainStatType(rune);
        const allowedMains = ['HP%', 'DEF%', 'ATK%', 'CDmg', 'SPD', 'CRate'];
        if (!allowedMains.includes(mainType)) return 'No';
    }
    return 'Match';
}

// ==================== UPGRADE ====================
function getUpgrade(rune) { return getLevel(rune) >= 9 ? 'Match' : 'No'; }

// ==================== FINAL (corrigée selon formule Sheets) ====================
function getFinal(rune, highRoll, duoRoll, classicDps, slowDps, bomber, tankSupport, bruiser, reapp, upgrade) {
    const level = getLevel(rune);
    const efficiency = parseFloat(rune.efficiency) || 0;
    const isHero = !isLegend(rune);
    const mode = currentGameLevel;
    
    const highDuo = (highRoll === 'Match' ? 1 : 0) + (duoRoll === 'Match' ? 1 : 0);
    const otherMatches = (classicDps === 'Match' ? 1 : 0) + (slowDps === 'Match' ? 1 : 0) + (bomber === 'Match' ? 1 : 0) + (tankSupport === 'Match' ? 1 : 0) + (bruiser === 'Match' ? 1 : 0);
    const reappMatch = (reapp === 'Match' ? 1 : 0);
    const matches = highDuo + otherMatches + reappMatch;
    
    const heroNoHd = isHero && highDuo === 0;
    const isFlat = getBadFlat(rune) === 'Flat';
    
    if (level < 9) return 'Upgrade';
    
    if (level < 12) {
        if (matches > 0) {
            if (heroNoHd && efficiency < (mode === 'late' ? 85 : (mode === 'mid' ? 70 : 55))) return 'Sell';
            return 'Finish';
        } else {
            const threshold = mode === 'late' ? 80 : (mode === 'mid' ? 65 : 50);
            return efficiency >= threshold ? 'Finish' : 'Sell';
        }
    } else { // level >= 12
        if (matches > 0) {
            if (reappMatch && otherMatches === 0) return 'Reapp';
            if (isFlat) {
                const sellThresh = mode === 'late' ? 70 : (mode === 'mid' ? 55 : 40);
                if (efficiency < sellThresh) return 'Sell';
                if (heroNoHd && efficiency < (mode === 'late' ? 82 : (mode === 'mid' ? 67 : 52))) return 'Sell';
                return 'Gem';
            } else {
                const sellThresh = mode === 'late' ? 65 : (mode === 'mid' ? 50 : 35);
                if (efficiency < sellThresh) return 'Sell';
                if (heroNoHd && efficiency < (mode === 'late' ? 80 : (mode === 'mid' ? 65 : 50))) return 'Sell';
                return 'Keep';
            }
        } else {
            return 'Sell';
        }
    }
}

// ==================== RENDU TABLEAU DYNAMIQUE ====================
const allColumns = [
    { id: 'slot', label: 'Slot', getValue: (r) => r.slot || '?' },
    {
        id: 'set',
        label: 'Set',
        getValue: (r) => {
            const slot = r.slot || '?';
            const set = r.set || '';
            const setClass = set.toLowerCase();
            return `
                <div class="rune-set-container">
                    <div class="rune-slot-bg" style="background-image: url('images/Rune-slot-${slot}-selected.png');"></div>
                    <i class="rune-${setClass} rune-set-icon"></i>
                </div>
                ${set}
            `;
        }
    },
    { id: 'level', label: 'Niv.', getValue: (r) => r.level || 0 },
    { id: 'mainType', label: 'Principal', getValue: (r) => r.m_t || '?' },
    { id: 'mainVal', label: 'Valeur', getValue: (r) => r.m_v || 0 },
    { id: 'origin', label: 'Origine', getValue: (r) => r.originName || r.monster_n || '?' },
    { id: 'innate', label: 'Innate', getValue: (r) => getInnateText(r) },
    { id: 'substats', label: 'Substats', getValue: (r) => getSubstatsText(r) },
    { id: 'efficiency', label: 'Efficacité %', getValue: (r) => `${parseFloat(r.efficiency).toFixed(1)}%` },
    { id: 'final', label: 'Final', getValue: (r) => getFinal(r, getHighRoll(r), getDuoRoll(r), getClassicDPS(r), getSlowDPS(r), getBomber(r), getTankSupport(r), getBruiser(r), getReapp(r), getUpgrade(r)) }
];
const advancedColumns = [
    { id: 'powerLvl', label: 'Power Lvl', getValue: (r) => getPowerLevel(r) },
    { id: 'mode', label: 'Mode', getValue: (r) => getModeCol(r) },
    { id: 'badFlat', label: 'Bad Flat', getValue: (r) => getBadFlat(r) },
    { id: 'highRoll', label: 'High Roll', getValue: (r) => getHighRoll(r) },
    { id: 'duoRoll', label: 'Duo Roll', getValue: (r) => getDuoRoll(r) },
    { id: 'classicDPS', label: 'Classic DPS', getValue: (r) => getClassicDPS(r) },
    { id: 'slowDPS', label: 'Slow DPS', getValue: (r) => getSlowDPS(r) },
    { id: 'bomber', label: 'Bomber', getValue: (r) => getBomber(r) },
    { id: 'tankSupport', label: 'Tank & Support', getValue: (r) => getTankSupport(r) },
    { id: 'bruiser', label: 'Bruiser', getValue: (r) => getBruiser(r) },
    { id: 'reapp', label: 'Reapp', getValue: (r) => getReapp(r) },
    { id: 'upgrade', label: 'Upgrade', getValue: (r) => getUpgrade(r) }
];

function getDisplayColumns() {
    if (showAdvanced) return [...allColumns, ...advancedColumns];
    return allColumns;
}

function renderTable() {
    let filtered = currentFilterSet === "all" ? [...allRunes] : allRunes.filter(r => r.set === currentFilterSet);
    
    // Appliquer le filtre par décision finale
    filtered = filtered.filter(r => {
        const final = getFinal(r, getHighRoll(r), getDuoRoll(r), getClassicDPS(r), getSlowDPS(r), getBomber(r), getTankSupport(r), getBruiser(r), getReapp(r), getUpgrade(r));
        return currentDecisionFilters.includes(final);
    });
    
    // Compteurs
    let sell = 0, gem = 0, keep = 0, upgrade = 0, reapp = 0, finish = 0;
    for (let r of filtered) {
        const final = getFinal(r, getHighRoll(r), getDuoRoll(r), getClassicDPS(r), getSlowDPS(r), getBomber(r), getTankSupport(r), getBruiser(r), getReapp(r), getUpgrade(r));
        if (final === 'Sell') sell++;
        else if (final === 'Gem') gem++;
        else if (final === 'Keep') keep++;
        else if (final === 'Upgrade') upgrade++;
        else if (final === 'Reapp') reapp++;
        else if (final === 'Finish') finish++;
    }
    document.getElementById('runeCount').innerText = filtered.length;
    document.getElementById('sellCount').innerText = sell;
    document.getElementById('gemCount').innerText = gem;
    document.getElementById('keepCount').innerText = keep;
    document.getElementById('upgradeCount').innerText = upgrade;
    document.getElementById('reappCount').innerText = reapp;
    document.getElementById('finishCount').innerText = finish;

    const columns = getDisplayColumns();
    const colCount = columns.length;

    if (currentSort.column !== null && currentSort.column < colCount) {
        filtered.sort((a, b) => {
            const col = columns[currentSort.column];
            let av = col.getValue(a);
            let bv = col.getValue(b);
            if (typeof av === 'string') av = av.toLowerCase();
            if (typeof bv === 'string') bv = bv.toLowerCase();
            if (av < bv) return currentSort.asc ? -1 : 1;
            if (av > bv) return currentSort.asc ? 1 : -1;
            return 0;
        });
    }

    const thead = document.querySelector('#runeTable thead');
    thead.innerHTML = '<tr>' + columns.map(col => `<th>${col.label}</th>`).join('') + '</tr>';
    const tbody = document.getElementById('runeTableBody');
    tbody.innerHTML = '';
    for (let r of filtered) {
        const tr = document.createElement('tr');
        for (let col of columns) {
            let value = col.getValue(r);
            if (col.id === 'final') {
                const final = value;
                let actionClass = '';
                if (final === 'Sell') actionClass = 'btn-sell';
                else if (final === 'Keep') actionClass = 'btn-keep';
                else if (final === 'Gem') actionClass = 'btn-gem';
                else if (final === 'Reapp') actionClass = 'btn-reapp';
                else if (final === 'Finish') actionClass = 'btn-finish';
                else if (final === 'Upgrade') actionClass = 'btn-upgrade';
                value = `<span class="${actionClass}">${final}</span>`;
            }
            const td = document.createElement('td');
            td.innerHTML = value;
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    updateSortIndicators(columns);
}

function updateSortIndicators(columns) {
    const headers = document.querySelectorAll('#runeTable th');
    headers.forEach((th, idx) => {
        const arrowSpan = th.querySelector('.sort-arrow');
        if (arrowSpan) arrowSpan.remove();
        if (currentSort.column === idx) {
            const arrow = document.createElement('span');
            arrow.className = 'sort-arrow';
            arrow.textContent = currentSort.asc ? ' ▲' : ' ▼';
            th.appendChild(arrow);
        }
    });
}

function initSortListeners() {
    const table = document.querySelector('#runeTable');
    table.addEventListener('click', (e) => {
        let th = e.target.closest('th');
        if (!th) return;
        const headers = Array.from(document.querySelectorAll('#runeTable th'));
        const idx = headers.indexOf(th);
        if (idx === -1) return;
        if (currentSort.column === idx) {
            currentSort.asc = !currentSort.asc;
        } else {
            currentSort.column = idx;
            currentSort.asc = true;
        }
        renderTable();
    });
}

// ==================== GESTION MODAL SETTINGS ====================
function buildHighRollForm() {
    const container = document.getElementById('settingsForm');
    if (!container) return;
    container.innerHTML = '';
    const levels = ['early', 'mid', 'late'];
    const rarities = ['legend', 'hero'];
    const powerStats = ['SPD', 'HP', 'DEF', 'ATK', 'CRate', 'CDmg', 'ACC', 'RES'];
    
    for (let level of levels) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'settings-section';
        levelDiv.innerHTML = `<h3>${level.toUpperCase()}</h3>`;
        for (let rarity of rarities) {
            const rarityDiv = document.createElement('div');
            rarityDiv.innerHTML = `<strong>${rarity}</strong>`;
            const grid = document.createElement('div');
            grid.className = 'settings-grid';
            for (let stat of powerStats) {
                const val = SETTINGS[level][rarity][stat];
                const input = document.createElement('input');
                input.type = 'number';
                input.value = val;
                input.dataset.level = level;
                input.dataset.rarity = rarity;
                input.dataset.stat = stat;
                input.classList.add('power-threshold');
                const label = document.createElement('label');
                label.textContent = stat;
                label.appendChild(input);
                grid.appendChild(label);
            }
            rarityDiv.appendChild(grid);
            levelDiv.appendChild(rarityDiv);
        }
        container.appendChild(levelDiv);
    }
}

function buildDuoRollForm() {
    const container = document.getElementById('settingsForm');
    if (!container) return;
    container.innerHTML = '';
    const duoTypes = ['legend', 'hero'];
    const duoLevels = ['early', 'mid', 'late'];
    const duoKeys = [
        { key: 'SPD_min', label: 'SPD min' },
        { key: 'SPD_partner', label: 'SPD partner' },
        { key: 'CRate_for_CDmg', label: 'CRate → CDmg' },
        { key: 'CDmg_for_CRate', label: 'CDmg → CRate' },
        { key: 'CRate_for_ATK', label: 'CRate → ATK' },
        { key: 'ATK_for_CRate', label: 'ATK → CRate' },
        { key: 'HP_for_DEF', label: 'HP → DEF' },
        { key: 'DEF_for_HP', label: 'DEF → HP' },
        { key: 'DEF_for_RES', label: 'DEF → RES' },
        { key: 'RES_for_DEF', label: 'RES → DEF' },
        { key: 'HP_for_RES', label: 'HP → RES' },
        { key: 'RES_for_HP', label: 'RES → HP' }
    ];
    
    for (let dt of duoTypes) {
        const typeDiv = document.createElement('div');
        typeDiv.className = 'settings-section';
        typeDiv.innerHTML = `<h3>${dt.toUpperCase()}</h3>`;
        const grid = document.createElement('div');
        grid.className = 'duo-grid';
        for (let lvl of duoLevels) {
            const lvlDiv = document.createElement('div');
            lvlDiv.className = 'duo-category';
            lvlDiv.innerHTML = `<h4>${lvl}</h4>`;
            for (let item of duoKeys) {
                const val = SETTINGS.duo[dt][lvl][item.key];
                const input = document.createElement('input');
                input.type = 'number';
                input.value = val;
                input.dataset.duoType = dt;
                input.dataset.duoLevel = lvl;
                input.dataset.duoKey = item.key;
                input.classList.add('duo-threshold');
                const label = document.createElement('label');
                label.textContent = item.label;
                label.appendChild(input);
                lvlDiv.appendChild(label);
            }
            grid.appendChild(lvlDiv);
        }
        typeDiv.appendChild(grid);
        container.appendChild(typeDiv);
    }
}

function buildSettingsForm() {
    const activeTab = document.querySelector('.tab-btn.active')?.id;
    if (activeTab === 'tabDuoRollBtn') {
        buildDuoRollForm();
    } else {
        buildHighRollForm();
    }
}

function collectSettingsFromForm() {
    const powerInputs = document.querySelectorAll('#settingsForm .power-threshold');
    for (let inp of powerInputs) {
        const level = inp.dataset.level, rarity = inp.dataset.rarity, stat = inp.dataset.stat;
        if (level && rarity && stat) SETTINGS[level][rarity][stat] = Number(inp.value);
    }
    const duoInputs = document.querySelectorAll('#settingsForm .duo-threshold');
    for (let inp of duoInputs) {
        const dt = inp.dataset.duoType, lvl = inp.dataset.duoLevel, key = inp.dataset.duoKey;
        if (dt && lvl && key && SETTINGS.duo[dt] && SETTINGS.duo[dt][lvl]) SETTINGS.duo[dt][lvl][key] = Number(inp.value);
    }
    saveSettings();
}

function resetSettings() {
    SETTINGS = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    saveSettings();
    buildSettingsForm();
    renderTable();
}

function openModal() {
    buildSettingsForm();
    document.getElementById('settingsModal').style.display = 'block';
}
function closeModal() { document.getElementById('settingsModal').style.display = 'none'; }

function initSettingsTabs() {
    const highRollBtn = document.getElementById('tabHighRollBtn');
    const duoRollBtn = document.getElementById('tabDuoRollBtn');
    if (!highRollBtn || !duoRollBtn) return;
    
    highRollBtn.addEventListener('click', () => {
        highRollBtn.classList.add('active');
        duoRollBtn.classList.remove('active');
        buildHighRollForm();
    });
    duoRollBtn.addEventListener('click', () => {
        duoRollBtn.classList.add('active');
        highRollBtn.classList.remove('active');
        buildDuoRollForm();
    });
}

// ==================== FILTRES PAR DÉCISION ====================
function initDecisionFilters() {
    const checkboxes = document.querySelectorAll('.decision-filter');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            currentDecisionFilters = Array.from(document.querySelectorAll('.decision-filter:checked')).map(cb => cb.value);
            renderTable();
        });
    });
    const selectAllBtn = document.getElementById('selectAllDecisions');
    const deselectAllBtn = document.getElementById('deselectAllDecisions');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.decision-filter').forEach(cb => cb.checked = true);
            currentDecisionFilters = ['Keep', 'Sell', 'Gem', 'Upgrade', 'Reapp', 'Finish'];
            renderTable();
        });
    }
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.decision-filter').forEach(cb => cb.checked = false);
            currentDecisionFilters = [];
            renderTable();
        });
    }
}

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    initSortListeners();
    initGameLevelListeners();
    initSettingsTabs();
    initDecisionFilters();
    document.getElementById('appVersion').innerText = APP_VERSION;
    const editBtn = document.getElementById('editSettingsBtn');
    if (editBtn) editBtn.onclick = openModal;
    const closeBtn = document.querySelector('#settingsModal .close');
    if (closeBtn) closeBtn.onclick = closeModal;
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) saveBtn.onclick = () => { collectSettingsFromForm(); closeModal(); renderTable(); };
    const resetBtn = document.getElementById('resetSettingsBtn');
    if (resetBtn) resetBtn.onclick = () => { resetSettings(); closeModal(); renderTable(); };
    window.onclick = (event) => { if (event.target === document.getElementById('settingsModal')) closeModal(); };
    
    const advCheckbox = document.getElementById('advancedModeCheckbox');
    if (advCheckbox) {
        advCheckbox.addEventListener('change', (e) => {
            showAdvanced = e.target.checked;
            renderTable();
        });
    }
});

function initGameLevelListeners() {
    const radios = document.querySelectorAll('input[name="gameLevel"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                currentGameLevel = e.target.value;
                renderTable();
            }
        });
    });
}

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadRunesFromCSV(ev.target.result);
    reader.readAsText(file, "UTF-8");
});

document.getElementById('setFilter').addEventListener('change', (e) => {
    currentFilterSet = e.target.value;
    renderTable();
});

function loadRunesFromCSV(csvData) {
    Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            allRunes = results.data;
            allRunes = allRunes.filter(r => r.id && r.id !== "");
            updateSetFilter();
            renderTable();
        },
        error: function(err) {
            alert('Erreur de parsing CSV : ' + err.message);
        }
    });
}

function updateSetFilter() {
    const sets = new Set();
    for (let r of allRunes) if (r.set) sets.add(r.set);
    const select = document.getElementById('setFilter');
    select.innerHTML = '<option value="all">Tous</option>';
    for (let s of Array.from(sets).sort()) {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        select.appendChild(opt);
    }
}


function getSetIcon(setName) {
    if (!setName) return '';
    const fileName = setName.toLowerCase() + '_rune_icon.webp';
    return `<img class="set-icon" src="icons/${fileName}" alt="${setName}" style="width:24px; height:24px; margin-right:6px; vertical-align:middle;">`;
}
