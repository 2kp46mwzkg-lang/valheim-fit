import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { SaveState, Session, Character } from './types';
import { computePoints } from './points';
import { rollLoot } from './loot';
import { BUILDINGS, CRAFTS, QUESTS, lootMultiplierForComfort } from './recipes';
import { SKILLS, totalSkillEffect, type SkillEffect } from './skills';

const KEY = 'valheim-fit-save-v2';

const initialState: SaveState = {
  version: 2,
  character: null,
  inventory: {},
  built: [],
  crafted: [],
  quests: {},
  buff: null,
  totalPoints: 0,
  sessions: [],
  skillPoints: 0,
  skills: {},
};

// ---- sauvegarde explicite ----
function saveLocal(s: SaveState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* quota plein */ }
}

function loadLocal(): SaveState {
  try {
    // nouvelle cle d'abord
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) };
    // migration depuis ancienne cle
    const old = localStorage.getItem('valheim-fit-save-v1');
    if (old) {
      const parsed = JSON.parse(old);
      const migrated = { ...initialState, ...parsed, skillPoints: 0, skills: {} };
      saveLocal(migrated);
      return migrated;
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
  skillPointsEarned: number;
}

interface Store {
  state: SaveState;
  loaded: boolean;
  comfort: number;
  skillEffect: SkillEffect;
  createCharacter: (c: Character) => void;
  canAfford: (cost: Record<string, number>) => boolean;
  canBuild: (id: string) => boolean;
  build: (id: string) => boolean;
  canCraft: (id: string) => boolean;
  craft: (id: string) => boolean;
  eatMeal: () => boolean;
  applySession: (session: Session, questId: string | null) => ApplyResult;
  upgradeSkill: (skillId: string) => boolean;
  exportSave: () => void;
  importSave: (file: File) => Promise<void>;
  resetSave: () => void;
}

const Ctx = createContext<Store | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SaveState>(initialState);
  const [loaded, setLoaded] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // chargement
  useEffect(() => {
    const local = loadLocal();
    if (local.character) {
      setState(local);
      setLoaded(true);
      return;
    }
    // fallback idb-keyval (anciens utilisateurs)
    import('idb-keyval').then(async ({ get }) => {
      try {
        const saved = await get('valheim-fit-save');
        if (saved) {
          const merged = { ...initialState, ...saved, skillPoints: saved.skillPoints ?? 0, skills: saved.skills ?? {} };
          saveLocal(merged);
          setState(merged);
        }
      } catch { /* ignore */ }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  // sauvegarde a chaque changement d'etat
  useEffect(() => {
    if (loaded) saveLocal(state);
  }, [state, loaded]);

  const comfort = useMemo(
    () => state.built.reduce((s, id) => s + (BUILDINGS.find((b) => b.id === id)?.comfort ?? 0), 0),
    [state.built]
  );

  const skillEffect = useMemo(() => totalSkillEffect(state.skills), [state.skills]);

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
    const s = stateRef.current;
    const inv = { ...s.inventory };
    for (const [k, v] of Object.entries(b.cost)) inv[k] = (inv[k] ?? 0) - v;
    const next = { ...s, inventory: inv, built: [...s.built, id] };
    setState(next);
    saveLocal(next);
    return true;
  }, []);

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
    const s = stateRef.current;
    const inv = { ...s.inventory };
    for (const [k, v] of Object.entries(c.cost)) inv[k] = (inv[k] ?? 0) - v;
    for (const [k, v] of Object.entries(c.gives)) inv[k] = (inv[k] ?? 0) + v;
    const next = { ...s, inventory: inv, crafted: c.unique ? [...s.crafted, id] : s.crafted };
    setState(next);
    saveLocal(next);
    return true;
  }, []);

  const eatMeal = useCallback(() => {
    const s = stateRef.current;
    if ((s.inventory.repas ?? 0) < 1 || s.buff) return false;
    const next = {
      ...s,
      inventory: { ...s.inventory, repas: (s.inventory.repas ?? 0) - 1 },
      buff: { mult: 1.2, label: 'Repas du chasseur' },
    };
    setState(next);
    saveLocal(next);
    return true;
  }, []);

  const createCharacter = useCallback((c: Character) => {
    const next = { ...stateRef.current, character: c };
    setState(next);
    saveLocal(next);
  }, []);

  const upgradeSkill = useCallback((skillId: string) => {
    const s = stateRef.current;
    const skill = SKILLS.find((sk) => sk.id === skillId);
    if (!skill) return false;
    const currentLvl = s.skills[skillId] ?? 0;
    if (currentLvl >= skill.maxLevel) return false;
    const cost = skill.costPerLevel;
    if (s.skillPoints < cost) return false;
    const next = {
      ...s,
      skillPoints: s.skillPoints - cost,
      skills: { ...s.skills, [skillId]: currentLvl + 1 },
    };
    setState(next);
    saveLocal(next);
    return true;
  }, []);

  const applySession = useCallback((session: Session, questId: string | null): ApplyResult => {
    const s = stateRef.current;
    const next: SaveState = JSON.parse(JSON.stringify(s));

    // FCmax auto-correction
    const fcmaxBefore = next.character!.fcmax;
    if (session.maxHr && session.maxHr > next.character!.fcmax) {
      next.character!.fcmax = session.maxHr;
    }
    const fcmaxUp = next.character!.fcmax !== fcmaxBefore;

    // calcul des points avec bonus de skills
    const { points: rawPts, perZoneMin, hasHr } = computePoints(session, next.character!.fcmax);
    const eff = totalSkillEffect(next.skills);
    const pointsWithSkills = Math.round(rawPts * (eff.pointsMult ?? 1));

    // appliquer buff repas
    const buff = next.buff;
    next.buff = null;
    const points = Math.round(pointsWithSkills * (buff?.mult ?? 1));

    // loot avec bonus de skills + confort
    const c = next.built.reduce((sum, id) => sum + (BUILDINGS.find((b) => b.id === id)?.comfort ?? 0), 0);
    const totalComfort = c + (eff.comfortBonus ?? 0);
    let loot = rollLoot(points, lootMultiplierForComfort(totalComfort));

    // appliquer multiplicateurs de loot par skill
    if (eff.lootMult) {
      for (const [k, v] of Object.entries(loot)) {
        const mult = eff.lootMult[k] ?? 1;
        if (mult > 1) loot[k] = Math.round(v * mult);
      }
    }

    // chance de double loot
    if (eff.doubleLootChance && eff.doubleLootChance > 0 && Math.random() < eff.doubleLootChance) {
      for (const [k, v] of Object.entries(loot)) loot[k] = v * 2;
      loot = { ...loot, _double: 1 } as Record<string, number>; // flag pour l'UI
    }

    // ajouter butin a l'inventaire
    for (const [k, v] of Object.entries(loot)) {
      if (k === '_double') continue;
      next.inventory[k] = (next.inventory[k] ?? 0) + v;
    }
    next.totalPoints += points;

    // points de competence : 1 par session, 2 si sagesse nordique, +1 si chasse parfaite
    const sagesseLvl = next.skills['sagesse'] ?? 0;
    let skillPtsEarned = sagesseLvl > 0 ? 2 : 1;

    // quete
    let questResult: ApplyResult['questResult'] = null;
    if (questId) {
      const q = QUESTS.find((x) => x.id === questId)!;
      const st = (next.quests[questId] ??= { progress: 0, completed: 0 });
      const before = st.progress;
      const questPoints = Math.round(points * (eff.questMult ?? 1));
      st.progress += questPoints;
      if (st.progress >= q.cost) {
        const perfect = before === 0 && questPoints >= q.cost;
        const reward = { ...q.reward };
        if (perfect) {
          for (const [k, v] of Object.entries(q.perfectBonus)) reward[k] = (reward[k] ?? 0) + v;
          skillPtsEarned += 1; // bonus chasse parfaite
        }
        for (const [k, v] of Object.entries(reward)) next.inventory[k] = (next.inventory[k] ?? 0) + v;
        st.completed++;
        st.progress = q.repeatable ? st.progress - q.cost : q.cost;
        questResult = { name: q.name, done: true, perfect, reward };
      } else {
        questResult = { name: q.name, done: false, progress: st.progress, cost: q.cost };
      }
    }

    next.skillPoints += skillPtsEarned;

    // journal
    next.sessions.unshift({
      date: session.date, sport: session.sport, durationSec: session.durationSec,
      calories: session.calories ?? null, avgHr: session.avgHr ?? null,
      points, base: rawPts, buff: buff?.label ?? null, hasHr, perZoneMin, loot, quest: questResult,
    });

    setState(next);
    saveLocal(next);

    return { points, base: rawPts, buff, loot, questResult, perZoneMin, hasHr, fcmaxUp, skillPointsEarned: skillPtsEarned };
  }, []);

  const exportSave = useCallback(() => {
    const blob = new Blob([JSON.stringify(stateRef.current, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `valheim-fit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, []);

  const importSave = useCallback(async (file: File) => {
    const parsed = JSON.parse(await file.text());
    const merged = { ...initialState, ...parsed, skillPoints: parsed.skillPoints ?? 0, skills: parsed.skills ?? {} };
    setState(merged);
    saveLocal(merged);
  }, []);

  const resetSave = useCallback(() => {
    localStorage.removeItem(KEY);
    localStorage.removeItem('valheim-fit-save-v1');
    const fresh = { ...initialState };
    setState(fresh);
    saveLocal(fresh);
  }, []);

  const value = useMemo<Store>(() => ({
    state, loaded, comfort, skillEffect, createCharacter, canAfford, canBuild, build,
    canCraft, craft, eatMeal, applySession, upgradeSkill, exportSave, importSave, resetSave,
  }), [state, loaded, comfort, skillEffect, createCharacter, canAfford, canBuild, build, canCraft, craft, eatMeal, applySession, upgradeSkill, exportSave, importSave, resetSave]);

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
