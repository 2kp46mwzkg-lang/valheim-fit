// ---- ÉQUILIBRAGE : CONSTRUCTIONS, ARTISANAT, QUÊTES ----

export interface Building {
  id: string; name: string; comfort: number;
  cost: Record<string, number>; requires: string[];
  desc: string; icon: string;
}

export const BUILDINGS: Building[] = [
  { id: 'feu', name: 'Feu de camp', comfort: 1, cost: { pierre: 5, bois: 10 }, requires: [],
    desc: 'Réchauffe le campement et permet de cuisiner.', icon: '🔥' },
  { id: 'abri', name: 'Abri et lit de paille', comfort: 1, cost: { bois: 30, fibres: 15 }, requires: ['feu'],
    desc: 'Quatre murs et un lit. Le début de la maison.', icon: '🛖' },
  { id: 'tapis', name: 'Tapis en peau de cerf', comfort: 1, cost: { peau_cerf: 2 }, requires: ['abri'],
    desc: 'Le sol devient doux. Nécessite la quête Peau de cerf.', icon: '🟫' },
  { id: 'table', name: 'Table et tabouret', comfort: 1, cost: { bois: 25, silex: 3 }, requires: ['abri'],
    desc: 'Pour manger assis comme un viking civilisé.', icon: '🪑' },
  { id: 'toit', name: 'Toit renforcé et bannière', comfort: 1, cost: { bois: 40, plumes: 10 }, requires: ['table', 'tapis'],
    desc: 'Le confort 5. Ta maison est achevée.', icon: '🚩' },
];

export interface Craft {
  id: string; name: string;
  cost: Record<string, number>; requires: string[];
  gives: Record<string, number>; unique?: boolean;
  desc: string; icon: string;
}

export const CRAFTS: Craft[] = [
  { id: 'repas', name: 'Repas du chasseur', cost: { baies: 3, viande: 1 }, requires: ['feu'],
    gives: { repas: 1 }, desc: 'Mange-le avant une sortie : ×1.2 sur les points.', icon: '🍲' },
  { id: 'tenue', name: 'Tenue en cuir', cost: { peau_cerf: 3, fibres: 10 }, requires: ['toit'],
    gives: {}, unique: true, desc: 'Ouvre la route vers la Forêt Noire (biome 2, à venir).', icon: '🥋' },
];

// Bonus de confort → multiplicateur de butin
export function lootMultiplierForComfort(c: number) { return 1 + c * 0.06; } // confort 5 → ×1.30

export interface Quest {
  id: string; name: string; cost: number;
  reward: Record<string, number>; perfectBonus: Record<string, number>;
  unlockAt: number; repeatable: boolean; desc: string; icon: string;
}

export const QUESTS: Quest[] = [
  { id: 'peau_cerf', name: 'Chasse au cerf', cost: 180, reward: { peau_cerf: 3 }, perfectBonus: { peau_cerf: 1 },
    unlockAt: 0, repeatable: true, icon: '🦌',
    desc: 'Traque un cerf dans les hautes herbes. Rapporte 3 peaux (4 si bouclée en une seule sortie).' },
  { id: 'carriere', name: 'La vieille carrière', cost: 90, reward: { pierre: 20, silex: 5 }, perfectBonus: { silex: 3 },
    unlockAt: 100, repeatable: true, icon: '⛏️',
    desc: 'Un filon de pierre et de silex au bord de la prairie.' },
  { id: 'plumes', name: 'Le nid des corbeaux', cost: 120, reward: { plumes: 10 }, perfectBonus: { plumes: 4 },
    unlockAt: 200, repeatable: true, icon: '🐦‍⬛',
    desc: 'Se révèle après 200 pts d’exploration cumulés. Rapporte 10 plumes.' },
];

// Zones de la carte révélées par le cumul de points
export const MAP_ZONES = [
  { at: 0, name: 'Le rivage', icon: '🌊' },
  { at: 100, name: 'La vieille carrière', icon: '⛏️' },
  { at: 200, name: 'Le bosquet aux corbeaux', icon: '🌳' },
  { at: 500, name: 'Les hautes collines', icon: '⛰️' },
  { at: 1000, name: 'La lisière de la Forêt Noire', icon: '🌲' },
];
