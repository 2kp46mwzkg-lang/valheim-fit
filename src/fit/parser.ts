import type { Session } from '../game/types';

/** Prend un File (.fit ou .zip) et renvoie une séance normalisée. */
export async function parseActivityFile(file: File): Promise<Session> {
  let buf = await file.arrayBuffer();
  if (file.name.toLowerCase().endsWith('.zip')) buf = await extractFitFromZip(buf);
  return parseFitBuffer(buf);
}

async function extractFitFromZip(buf: ArrayBuffer): Promise<ArrayBuffer> {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(buf);
  const name = Object.keys(zip.files).find((n) => n.toLowerCase().endsWith('.fit'));
  if (!name) throw new Error('Aucun fichier .fit dans le zip');
  return zip.file(name)!.async('arraybuffer');
}

export async function parseFitBuffer(buf: ArrayBuffer): Promise<Session> {
  const mod = await import('@garmin/fitsdk');
  const { Decoder, Stream } = mod as unknown as {
    Decoder: new (s: unknown) => { read: () => { messages: Record<string, unknown[]>; errors: unknown[] } } & { isFIT: (s: unknown) => boolean };
    Stream: { fromArrayBuffer: (b: ArrayBuffer) => unknown };
  };
  const stream = Stream.fromArrayBuffer(buf);
  const isFit = (Decoder as unknown as { isFIT: (s: unknown) => boolean }).isFIT(stream);
  if (!isFit) throw new Error("Ce fichier n'est pas un FIT valide");
  const { messages, errors } = new Decoder(stream).read() as {
    messages: Record<string, Array<Record<string, unknown>>>;
    errors: unknown[];
  };
  if (errors?.length) console.warn('Erreurs FIT (non bloquantes) :', errors);

  const s = (messages.sessionMesgs?.[0] ?? {}) as Record<string, unknown>;
  const records = (messages.recordMesgs ?? []) as Array<Record<string, unknown>>;
  const hr: { t: number; bpm: number }[] = [];
  for (const r of records) {
    if (typeof r.heartRate === 'number' && r.timestamp) {
      hr.push({ t: new Date(r.timestamp as string | number | Date).getTime() / 1000, bpm: r.heartRate });
    }
  }
  const totalTimer = s.totalTimerTime as number | undefined;
  const totalElapsed = s.totalElapsedTime as number | undefined;
  const durationSec =
    totalTimer ?? totalElapsed ?? (hr.length > 1 ? hr[hr.length - 1].t - hr[0].t : 0);

  const maxFromRecords = hr.length ? Math.max(...hr.map((h) => h.bpm)) : null;

  return {
    source: 'fit',
    date: s.startTime ? new Date(s.startTime as string | number | Date).toISOString() : new Date().toISOString(),
    sport: String(s.sport ?? 'inconnu'),
    subSport: String(s.subSport ?? ''),
    durationSec: Math.round(durationSec || 0),
    calories: (s.totalCalories as number) ?? null,
    avgHr: (s.avgHeartRate as number) ?? null,
    maxHr: (s.maxHeartRate as number) ?? maxFromRecords,
    hr,
  };
}

/** Fausse séance réaliste pour tester sans montre. */
export function fakeSession(minutes = 60, fcmax = 190): Session {
  const hr: { t: number; bpm: number }[] = [];
  let bpm = 90;
  const t0 = Date.now() / 1000;
  for (let i = 0; i < minutes * 60; i += 5) {
    const wave = Math.sin(i / 300) ** 2;
    const target = 0.55 * fcmax + 0.3 * fcmax * wave + (Math.random() - 0.5) * 10;
    bpm += (target - bpm) * 0.15;
    hr.push({ t: t0 + i, bpm: Math.round(bpm) });
  }
  const avg = Math.round(hr.reduce((a, b) => a + b.bpm, 0) / hr.length);
  return {
    source: 'dev',
    date: new Date().toISOString(),
    sport: 'course',
    subSport: '',
    durationSec: minutes * 60,
    calories: Math.round(minutes * 9),
    avgHr: avg,
    maxHr: Math.max(...hr.map((h) => h.bpm)),
    hr,
  };
}

export const SPORT_LABELS: Record<string, string> = {
  running: 'Course', cycling: 'Vélo', swimming: 'Natation', hiking: 'Rando',
  walking: 'Marche', strength_training: 'Muscu', cardio: 'Cardio', yoga: 'Yoga',
  crossfit: 'CrossFit', rowing: 'Rameur', skiing: 'Ski', snowboarding: 'Snow',
  generic: 'Sport', test: 'Test', course: 'Course', inconnu: 'Sport',
};

export function sportLabel(sport: string): string {
  const k = (sport || '').toLowerCase();
  if (SPORT_LABELS[k]) return SPORT_LABELS[k];
  // prettify camelCase / snake
  return sport.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, (c) => c.toUpperCase()) || 'Sport';
}
