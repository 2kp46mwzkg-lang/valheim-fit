// ---- ARBRE DE COMPETENCES ----
// 1 point de competence par session completee
// 2 points si chasse parfaite (quete bouclee en une seule sortie)

export interface Skill {
  id: string;
  name: string;
  icon: string;
  desc: string;
  maxLevel: number;
  costPerLevel: number; // points de competence requis par niveau
  branch: 'chasse' | 'recolte' | 'corps' | 'esprit';
  effect: (level: number) => SkillEffect;
}

export interface SkillEffect {
  /** Multiplicateur sur les points d'effort */
  pointsMult?: number;
  /** Multiplicateur sur un objet specifique (cle = id de l'objet) */
  lootMult?: Record<string, number>;
  /** Bonus de confort */
  comfortBonus?: number;
  /** Chance de double loot (0-1) */
  doubleLootChance?: number;
  /** Multiplicateur sur les quetes */
  questMult?: number;
  /** Bonus de points par zone cardiaque */
  zoneBonus?: Record<string, number>;
}

export const SKILLS: Skill[] = [
  // === BRANCHE CHASSE ===
  {
    id: 'chasse_rapide', name: 'Chasse rapide', icon: '\u{1F3AF}',
    desc: 'Tes seances de course rapportent plus de butin.',
    maxLevel: 5, costPerLevel: 2, branch: 'chasse',
    effect: (lvl) => ({ lootMult: { viande: 1 + lvl * 0.2, peau_cerf: 1 + lvl * 0.15 } }),
  },
  {
    id: 'oeil_de_faucon', name: 'Oeil de faucon', icon: '\u{1F985}',
    desc: 'Meilleure precision = plus de points d\'effort.',
    maxLevel: 5, costPerLevel: 2, branch: 'chasse',
    effect: (lvl) => ({ pointsMult: 1 + lvl * 0.05 }),
  },
  {
    id: 'peau_epaisse', name: 'Peau epaisse', icon: '\u{1F9A5}',
    desc: 'Resiste mieux, endure plus longtemps.',
    maxLevel: 3, costPerLevel: 3, branch: 'chasse',
    effect: (lvl) => ({ zoneBonus: { Z4: lvl * 0.3, Z5: lvl * 0.5 } }),
  },
  // === BRANCHE RECOLTE ===
  {
    id: 'bucheron', name: 'Bucheron', icon: '\u{1FAB5}',
    desc: 'Chaque seance rapporte plus de bois.',
    maxLevel: 5, costPerLevel: 2, branch: 'recolte',
    effect: (lvl) => ({ lootMult: { bois: 1 + lvl * 0.25, fibres: 1 + lvl * 0.15 } }),
  },
  {
    id: 'tailleur_de_pierre', name: 'Tailleur de pierre', icon: '\u{1FAA8}',
    desc: 'Extrait plus de pierre et de silex.',
    maxLevel: 5, costPerLevel: 2, branch: 'recolte',
    effect: (lvl) => ({ lootMult: { pierre: 1 + lvl * 0.25, silex: 1 + lvl * 0.2 } }),
  },
  {
    id: 'cueilleur', name: 'Cueilleur', icon: '\u{1F33F}',
    desc: 'Trouve plus de baies et champignons.',
    maxLevel: 5, costPerLevel: 2, branch: 'recolte',
    effect: (lvl) => ({ lootMult: { baies: 1 + lvl * 0.25, champignons: 1 + lvl * 0.3 } }),
  },
  // === BRANCHE CORPS ===
  {
    id: 'endurance', name: 'Endurance', icon: '\u{2764}\u{FE0F}',
    desc: 'Seuil cardiaque plus haut = plus de temps en zone forte.',
    maxLevel: 5, costPerLevel: 2, branch: 'corps',
    effect: (lvl) => ({ pointsMult: 1 + lvl * 0.06 }),
  },
  {
    id: 'force_viking', name: 'Force viking', icon: '\u{1F4AA}',
    desc: 'L\'effort intense rapporte beaucoup plus.',
    maxLevel: 5, costPerLevel: 2, branch: 'corps',
    effect: (lvl) => ({ zoneBonus: { Z3: lvl * 0.2, Z4: lvl * 0.3, Z5: lvl * 0.4 } }),
  },
  {
    id: 'recuperation', name: 'Recuperation', icon: '\u{1F331}',
    desc: 'Bonus de confort pour chaque niveau.',
    maxLevel: 3, costPerLevel: 3, branch: 'corps',
    effect: (lvl) => ({ comfortBonus: lvl }),
  },
  // === BRANCHE ESPRIT ===
  {
    id: 'sagacite', name: 'Sagacite', icon: '\u{1F52E}',
    desc: 'Les quetes avancent plus vite.',
    maxLevel: 5, costPerLevel: 2, branch: 'esprit',
    effect: (lvl) => ({ questMult: 1 + lvl * 0.15 }),
  },
  {
    id: 'chance', name: 'Chance du viking', icon: '\u{1F340}',
    desc: 'Chance de doubler le butin d\'une seance.',
    maxLevel: 5, costPerLevel: 2, branch: 'esprit',
    effect: (lvl) => ({ doubleLootChance: lvl * 0.08 }),
  },
  {
    id: 'sagesse', name: 'Sagesse nordique', icon: '\u{1F4D6}',
    desc: 'Deux points de competence par seance au lieu d\'un.',
    maxLevel: 1, costPerLevel: 5, branch: 'esprit',
    effect: (_lvl) => ({}),
  },
];

export const BRANCHES = [
  { id: 'chasse' as const, name: 'Chasse', icon: '\u{1F3AF}', color: '#e05a5a', desc: 'Precision et gibier' },
  { id: 'recolte' as const, name: 'Recolte', icon: '\u{1F33E}', color: '#7fbf7f', desc: 'Ressources de la prairie' },
  { id: 'corps' as const, name: 'Corps', icon: '\u{1F4AA}', color: '#e8955a', desc: 'Endurance et force' },
  { id: 'esprit' as const, name: 'Esprit', icon: '\u{1F52E}', color: '#c48a4a', desc: 'Chance et sagesse' },
];

/** Calcule l'effet total combine de tous les skills actifs */
export function totalSkillEffect(skills: Record<string, number>): SkillEffect {
  const effect: SkillEffect = { pointsMult: 1, lootMult: {}, zoneBonus: {}, comfortBonus: 0, doubleLootChance: 0, questMult: 1 };
  for (const skill of SKILLS) {
    const lvl = skills[skill.id] ?? 0;
    if (lvl <= 0) continue;
    const e = skill.effect(lvl);
    if (e.pointsMult) effect.pointsMult! *= e.pointsMult;
    if (e.questMult) effect.questMult! *= e.questMult;
    if (e.comfortBonus) effect.comfortBonus! += e.comfortBonus;
    if (e.doubleLootChance) effect.doubleLootChance! += e.doubleLootChance;
    if (e.lootMult) for (const [k, v] of Object.entries(e.lootMult)) effect.lootMult![k] = (effect.lootMult![k] ?? 1) * v;
    if (e.zoneBonus) for (const [k, v] of Object.entries(e.zoneBonus)) effect.zoneBonus![k] = (effect.zoneBonus![k] ?? 0) + v;
  }
  return effect;
}

/** Total des points de skill investis */
export function totalSkillPointsSpent(skills: Record<string, number>): number {
  let total = 0;
  for (const skill of SKILLS) total += (skills[skill.id] ?? 0) * skill.costPerLevel;
  return total;
}
