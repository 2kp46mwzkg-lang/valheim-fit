// ---- Lieux du camp (coordonnées dans le SVG 400×250) ----
export type CampLoc = 'rive' | 'rune' | 'etabli' | 'maison' | 'feu';

export interface CampSpot {
  id: CampLoc;
  label: string;
  short: string;
  icon: string;
  x: number;       // position du personnage
  markerY: number; // position du marqueur cliquable
  requires?: string[];
  desc: string;
}

export const CAMP_SPOTS: CampSpot[] = [
  {
    id: 'rive', label: 'Le Rivage', short: 'Rivage', icon: '🌊', x: 52, markerY: 184,
    desc: 'Tu t’es échoué ici. C’est aussi par là que tu reviens, butin sur le dos, après chaque effort.',
  },
  {
    id: 'rune', label: 'Pierre des sagas', short: 'Pierre', icon: 'ᚱ', x: 112, markerY: 146,
    desc: 'La pierre runique garde la carte des terres révélées et suit tes quêtes.',
  },
  {
    id: 'etabli', label: 'L’Établi', short: 'Établi', icon: '🪚', x: 162, markerY: 182,
    requires: ['abri'],
    desc: 'Outils et artisanat : cuisine tes récoltes et prépare tes équipements.',
  },
  {
    id: 'maison', label: 'La Maison', short: 'Maison', icon: '🏠', x: 247, markerY: 136,
    requires: ['abri'],
    desc: 'Construis et aménage ton foyer. Chaque niveau de confort augmente ton butin.',
  },
  {
    id: 'feu', label: 'Feu de camp', short: 'Feu', icon: '🔥', x: 325, markerY: 182,
    requires: ['feu'],
    desc: 'Mange, réchauffe-toi et profite de tes bonus avant la prochaine sortie.',
  },
];

export const WALK_MS = 1250;
