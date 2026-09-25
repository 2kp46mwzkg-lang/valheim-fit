// ---- Types partagés ----

export interface HrPoint { t: number; bpm: number }

export interface Session {
  source: 'fit' | 'manuel' | 'dev';
  date: string;
  sport: string;
  subSport?: string;
  durationSec: number;
  calories?: number | null;
  avgHr?: number | null;
  maxHr?: number | null;
  intensity?: number; // 1..5 pour saisie manuelle
  hr: HrPoint[];
}

export interface Character {
  name: string;
  age: number;
  fcmax: number;
  hair: string;
  tunic: string;
}

export interface QuestState { progress: number; completed: number }

export interface SessionLog {
  date: string;
  sport: string;
  durationSec: number;
  calories?: number | null;
  avgHr?: number | null;
  points: number;
  base: number;
  buff?: string | null;
  hasHr: boolean;
  perZoneMin: Record<string, number>;
  loot: Record<string, number>;
  quest?: { name: string; done: boolean; perfect?: boolean; progress?: number; cost?: number; reward?: Record<string, number> } | null;
}

export interface SaveState {
  version: number;
  character: Character | null;
  inventory: Record<string, number>;
  built: string[];
  crafted: string[];
  quests: Record<string, QuestState>;
  buff: { mult: number; label: string } | null;
  totalPoints: number;
  sessions: SessionLog[];
  skillPoints: number;
  skills: Record<string, number>;
}
