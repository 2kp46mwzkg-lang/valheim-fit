import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { SaveState, Session, Character } from './types';
import { computePoints } from './points';
import { rollLoot } from './loot';
import { BUILDINGS, CRAFTS, QUESTS, lootMultiplierForComfort } from './recipes';

const KEY = 'valheim-fit-save-v1';

const initialState: SaveState = {
  version: 1,
  character: null,
  inventory: {},
  built: [],
  crafted: [],
  quests: {},
  buff: null,
  totalPoints: 0,
  sessions: [],
};

function loadLocal(): SaveState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...initialState, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...initialState };
}

export interface ApplyResult {
  points: number; base: number;
  buff: { mult: number; label: string } | null;
  loot: Record<string, number>;
  questResult: { name: string; done: boolean; perfect?: boolean; progress?: number; cost?: number; reward?: Record<string, number> } | null;
  perZoneMin: Record<string, number>;
  hasHr: boolean;
  fcmaxUp: boolean;
}

interface Store {
  state: SaveState;
  loaded: boolean;
  comfort: number;
  createCharacter: (c: Character) => void;
  canAfford: (cost: Record<string, number>) => boolean;
  canBuild: (id: string) => boolean;
  build: (id: string) => boolean;
  canCraft: (id: string) => boolean;
  craft: (id: string) => boolean;
  eatMeal: () => boolean;
  applySession: (session: Session, questId: string | null) => ApplyResult;
  exportSave: () => void;
  importSave: (file: File) => Promise<void>;
  resetSave: () => void;
}

const Ctx = createContext<Store | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SaveState>(initialState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // localStorage d'abord, puis idb-keyval en fallback (compat ancien script)
    const local = loadLocal();
    if (local.character) {
      setState(local);
      setLoaded(true);
      return;
    }
    import('idb-keyval').then(async ({ get }) => {
      try {
        const saved = await get('valheim-fit-save');
        if (saved) {
          const merged = { ...initialState, ...saved };
          setState(merged);
          localStorage.setItem(KEY, JSON.stringify(merged));
        }
      } catch { /* ignore */ }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, loaded]);

  const comfort = useMemo(
    () => state.built.reduce((s, id) => s + (BUILDINGS.find((b) => b.id === id)?.comfort ?? 0), 0),
    [state.built]
  );

  const canAfford = useCallback(
    (cost: Record<string, number>) =>
      Object.entries(cost).every(([k, v]) => (state.inventory[k] ?? 0) >= v),
    [state.inventory]
  );

  const canBuild = useCallback((id: string) => {
    const b = BUILDINGS.find((x) => x.id === id);
    if (!b || state.built.includes(id)) return false;
    return b.requires.every((r) => state.built.includes(r)) && canAfford(b.cost);
  }, [state.built, canAfford]);

  const build = useCallback((id: string) => {
    const b = BUILDINGS.find((x) => x.id === id);
    if (!b || state.built.includes(id)) return false;
    if (!b.requires.every((r) => state.built.includes(r))) return false;
    if (!Object.entries(b.cost).every(([k, v]) => (state.inventory[k] ?? 0) >= v)) return false;
    setState((s) => {
      const inv = { ...s.inventory };
      for (const [k, v] of Object.entries(b.cost)) inv[k] = (inv[k] ?? 0) - v;
      return { ...s, inventory: inv, built: [...s.built, id] };
    });
    return true;
  }, [state.built, state.inventory]);

  const canCraft = useCallback((id: string) => {
    const c = CRAFTS.find((x) => x.id === id);
    if (!c) return false;
    if (c.unique && state.crafted.includes(id)) return false;
    return c.requires.every((r) => state.built.includes(r)) && canAfford(c.cost);
  }, [state.built, state.crafted, canAfford]);

  const craft = useCallback((id: string) => {
    const c = CRAFTS.find((x) => x.id === id);
    if (!c) return false;
    if (c.unique && state.crafted.includes(id)) return false;
    if (!c.requires.every((r) => state.built.includes(r))) return false;
    if (!Object.entries(c.cost).every(([k, v]) => (state.inventory[k] ?? 0) >= v)) return false;
    setState((s) => {
      const inv = { ...s.inventory };
      for (const [k, v] of Object.entries(c.cost)) inv[k] = (inv[k] ?? 0) - v;
      for (const [k, v] of Object.entries(c.gives)) inv[k] = (inv[k] ?? 0) + v;
      return {
        ...s, inventory: inv,
        crafted: c.unique ? [...s.crafted, id] : s.crafted,
      };
    });
    return true;
  }, [state.built, state.crafted, state.inventory]);

  const eatMeal = useCallback(() => {
    if ((state.inventory.repas ?? 0) < 1 || state.buff) return false;
    setState((s) => ({
      ...s,
      inventory: { ...s.inventory, repas: (s.inventory.repas ?? 0) - 1 },
      buff: { mult: 1.2, label: 'Repas du chasseur' },
    }));
    return true;
  }, [state.inventory.repas, state.buff]);

  const createCharacter = useCallback((c: Character) => {
    setState((s) => ({ ...s, character: c }));
  }, []);

  const stateRef = React.useRef(state);
  stateRef.current = state;

  const applySession = useCallback((session: Session, questId: string | null): ApplyResult => {
    const s = stateRef.current;
    const next: SaveState = JSON.parse(JSON.stringify(s));
    const fcmaxBefore = next.character!.fcmax;
    if (session.maxHr && session.maxHr > next.character!.fcmax) {
      next.character!.fcmax = session.maxHr;
    }
    const fcmaxUp = next.character!.fcmax !== fcmaxBefore;
    const { points: base, perZoneMin, hasHr } = computePoints(session, next.character!.fcmax);
    const buff = next.buff;
    next.buff = null;
    const points = Math.round(base * (buff?.mult ?? 1));
    const c = next.built.reduce((sum, id) => sum + (BUILDINGS.find((b) => b.id === id)?.comfort ?? 0), 0);
    const loot = rollLoot(points, lootMultiplierForComfort(c));
    for (const [k, v] of Object.entries(loot)) next.inventory[k] = (next.inventory[k] ?? 0) + v;
    next.totalPoints += points;

    let questResult: ApplyResult['questResult'] = null;
    if (questId) {
      const q = QUESTS.find((x) => x.id === questId)!;
      const st = (next.quests[questId] ??= { progress: 0, completed: 0 });
      const before = st.progress;
      st.progress += points;
      if (st.progress >= q.cost) {
        const perfect = before === 0 && points >= q.cost;
        const reward = { ...q.reward };
        if (perfect) for (const [k, v] of Object.entries(q.perfectBonus)) reward[k] = (reward[k] ?? 0) + v;
        for (const [k, v] of Object.entries(reward)) next.inventory[k] = (next.inventory[k] ?? 0) + v;
        st.completed++;
        st.progress = q.repeatable ? st.progress - q.cost : q.cost;
        questResult = { name: q.name, done: true, perfect, reward };
      } else {
        questResult = { name: q.name, done: false, progress: st.progress, cost: q.cost };
      }
    }

    next.sessions.unshift({
      date: session.date, sport: session.sport, durationSec: session.durationSec,
      calories: session.calories ?? null, avgHr: session.avgHr ?? null,
      points, base, buff: buff?.label ?? null, hasHr, perZoneMin, loot, quest: questResult,
    });

    setState(next);
    return { points, base, buff, loot, questResult, perZoneMin, hasHr, fcmaxUp };
  }, []);

  const exportSave = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `valheim-fit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, [state]);

  const importSave = useCallback(async (file: File) => {
    const parsed = JSON.parse(await file.text());
    setState({ ...initialState, ...parsed });
  }, []);

  const resetSave = useCallback(() => {
    localStorage.removeItem(KEY);
    setState({ ...initialState });
  }, []);

  const value = useMemo<Store>(() => ({
    state, loaded, comfort, createCharacter, canAfford, canBuild, build,
    canCraft, craft, eatMeal, applySession, exportSave, importSave, resetSave,
  }), [state, loaded, comfort, createCharacter, canAfford, canBuild, build, canCraft, craft, eatMeal, applySession, exportSave, importSave, resetSave]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGame hors provider');
  return v;
}

export function availableQuests(state: SaveState) {
  return QUESTS
    .filter((q) => state.totalPoints >= q.unlockAt)
    .map((q) => ({ ...q, ...(state.quests[q.id] ?? { progress: 0, completed: 0 }) }));
}
