// ---- ÉQUILIBRAGE : OBJETS ET TAUX DE DROP (biome 1 : Prairie) ----
export const ITEMS: Record<string, { name: string; icon: string; desc?: string }> = {
  bois: { name: 'Bois', icon: '🪵', desc: 'Branches et troncs de la prairie.' },
  fibres: { name: 'Fibres', icon: '🌿', desc: 'Herbes tressées pour cordes et tissus.' },
  pierre: { name: 'Pierre', icon: '🪨', desc: 'Solide, pour les fondations et le feu.' },
  silex: { name: 'Silex', icon: '🔪', desc: 'Tranchant, pour outils et finitions.' },
  baies: { name: 'Baies', icon: '🫐', desc: 'Sucrées, parfaites pour cuisiner.' },
  champignons: { name: 'Champignons', icon: '🍄', desc: 'Ramassés à l’ombre des chênes.' },
  viande: { name: 'Viande', icon: '🍖', desc: 'Gibier de la prairie.' },
  peau_cerf: { name: 'Peau de cerf', icon: '🦌', desc: 'Trophée de chasse, douce et chaude.' },
  plumes: { name: 'Plumes', icon: '🪶', desc: 'Plumes de corbeau, légères.' },
  repas: { name: 'Repas du chasseur', icon: '🍲', desc: '×1.2 sur les points de la prochaine sortie.' },
};

// quantité attendue pour 10 points d'effort
export const LOOT_TABLE: Record<string, number> = {
  bois: 1.2,
  fibres: 0.8,
  pierre: 0.6,
  baies: 0.5,
  champignons: 0.3,
  viande: 0.3,
  silex: 0.2,
};

/** Tire le butin d'exploration : proportionnel aux points, jamais nul si points > 0. */
export function rollLoot(points: number, mult = 1): Record<string, number> {
  const loot: Record<string, number> = {};
  for (const [id, per10] of Object.entries(LOOT_TABLE)) {
    const expected = (points / 10) * per10 * mult * (0.75 + Math.random() * 0.5); // ±25 %
    const qty = Math.floor(expected + Math.random()); // arrondi stochastique
    if (qty > 0) loot[id] = qty;
  }
  if (points > 0 && Object.keys(loot).length === 0) loot.bois = 1;
  return loot;
}
