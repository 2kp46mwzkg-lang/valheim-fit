import type { Session } from './types';

// ---- ÉQUILIBRAGE : ZONES ET MULTIPLICATEURS ----
export const ZONES = [
  { name: 'Z1', min: 0.0, mult: 0.5, color: '#7fa8c9', label: 'Récup' },
  { name: 'Z2', min: 0.6, mult: 1.0, color: '#7fbf7f', label: 'Endurance' },
  { name: 'Z3', min: 0.7, mult: 1.5, color: '#f2d16b', label: 'Tempo' },
  { name: 'Z4', min: 0.8, mult: 2.0, color: '#e8955a', label: 'Seuil' },
  { name: 'Z5', min: 0.9, mult: 2.5, color: '#e05a5a', label: 'Max' },
];

// Intensité ressentie (saisie manuelle) 1..5 → multiplicateur
export const RPE_MULT = [0.5, 1, 1.5, 2, 2.5];
export const RPE_LABELS = ['Balade tranquille', 'Effort léger', 'Effort modéré', 'Effort intense', 'À fond'];

export function zoneFor(bpm: number, fcmax: number) {
  const r = bpm / fcmax;
  let z = ZONES[0];
  for (const c of ZONES) if (r >= c.min) z = c;
  return z;
}

/** 1 point = 1 minute en Z2. Retourne {points, perZoneMin, hasHr}. */
export function computePoints(session: Session, fcmax: number) {
  const perZoneMin: Record<string, number> = Object.fromEntries(ZONES.map((z) => [z.name, 0]));
  const hr = session.hr ?? [];
  if (hr.length > 1) {
    let pts = 0;
    for (let i = 0; i < hr.length - 1; i++) {
      const dt = Math.min(Math.max(hr[i + 1].t - hr[i].t, 0), 30); // trous > 30s ignorés
      const z = zoneFor(hr[i].bpm, fcmax);
      perZoneMin[z.name] += dt / 60;
      pts += (dt / 60) * z.mult;
    }
    return { points: Math.round(pts), perZoneMin, hasHr: true };
  }
  const mult = RPE_MULT[(session.intensity ?? 2) - 1] ?? 1;
  return { points: Math.round((session.durationSec / 60) * mult), perZoneMin, hasHr: false };
}
