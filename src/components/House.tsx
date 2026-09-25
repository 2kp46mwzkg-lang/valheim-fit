import { useEffect, useRef, useState } from 'react';
import {
  Check, ChevronDown, Download, Hammer, Lock, Upload, Trash2,
  Flame, MapPin, UtensilsCrossed, ScrollText, Waves, Footprints,
} from 'lucide-react';
import { useGame, availableQuests } from '../game/store';
import { BUILDINGS, CRAFTS, MAP_ZONES, lootMultiplierForComfort } from '../game/recipes';
import { ITEMS } from '../game/loot';
import { sportLabel } from '../fit/parser';
import HouseScene from './HouseScene';
import Modal from './Modal';
import { CAMP_SPOTS, type CampLoc } from './camp';

function CostLine({ cost, inv }: { cost: Record<string, number>; inv: Record<string, number> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(cost).map(([k, v]) => {
        const have = inv[k] ?? 0;
        const ok = have >= v;
        return (
          <span key={k} className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${ok ? 'bg-[#7fbf7f]/15 text-[#7fbf7f]' : 'bg-[#e08a7a]/15 text-[#e08a7a]'}`}>
            <span>{ITEMS[k]?.icon}</span> {have}/{v}
          </span>
        );
      })}
    </div>
  );
}

function PanelHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">{icon}</span>
      <h2 className="font-display text-base font-bold text-[#f2d16b]">{title}</h2>
    </div>
  );
}

export default function House({
  onGoUpload, onGoQuests, arrivalToken,
}: { onGoUpload: () => void; onGoQuests: () => void; arrivalToken: number }) {
  const { state, comfort, build, craft, canBuild, eatMeal, exportSave, importSave, resetSave } = useGame();
  const [loc, setLoc] = useState<CampLoc>('rive');
  const [showSave, setShowSave] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [justBuilt, setJustBuilt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (arrivalToken > 0) setLoc('rive'); }, [arrivalToken]);

  const built = state.built;
  const isUnlocked = (s: (typeof CAMP_SPOTS)[number]) => (s.requires ?? []).every((r) => built.includes(r));
  const doBuild = (id: string) => {
    if (!build(id)) return;
    setJustBuilt(id);
    setTimeout(() => setJustBuilt(null), 2600);
    if (id === 'feu') setTimeout(() => setLoc('feu'), 500);
    if (id === 'abri' || id === 'toit') setTimeout(() => setLoc('maison'), 500);
  };

  const last = state.sessions[0];
  const quests = availableQuests(state);
  const revealed = MAP_ZONES.filter((z) => state.totalPoints >= z.at);
  const nextZone = MAP_ZONES.find((z) => z.at > state.totalPoints);
  const prevAt = revealed.length ? revealed[revealed.length - 1].at : 0;

  /* ======================== RIVAGE ======================== */
  const rivePanel = (
    <div className="space-y-3">
      <PanelHeader icon={<Waves className="text-[#7fa8c9]" size={22} />} title="Le Rivage" />
      <button onClick={onGoUpload} className="btn-wood flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold">
        <Flame size={17} /> Je reviens de l'effort
      </button>
      {last ? (
        <div className="card-viking p-3.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#7d8a80]">Derniere arrivee</div>
          <div className="mt-1 flex items-center justify-between">
            <b className="text-sm text-[#ece6d6]">{sportLabel(last.sport)}</b>
            <span className="rounded-full bg-[#f2d16b]/12 px-2.5 py-1 text-[11px] font-bold text-[#f2d16b]">{last.points} pts</span>
          </div>
          <div className="mt-1 text-[11px] text-[#a8b3a5]">
            {new Date(last.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {Math.round(last.durationSec / 60)} min
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(last.loot).slice(0, 8).map(([k, v]) => (
              <span key={k} className="rounded-lg bg-[#1a241f] px-2 py-1 text-[11px] font-semibold text-[#a8b3a5]">{ITEMS[k]?.icon}{v}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#3f5548] p-4 text-center text-[11px] leading-relaxed text-[#7d8a80]">
          <Footprints size={16} className="mx-auto mb-1 text-[#5a6a60]" />
          Le sable est vierge. Fais un premier effort puis reviens ici pour charger ta seance.
        </div>
      )}
    </div>
  );

  /* ======================== PIERRE ======================== */
  const runePanel = (
    <div className="space-y-3">
      <PanelHeader icon={<span className="font-display text-[#f2d16b]">{'\u16B1'}</span>} title="Pierre des sagas" />
      <div className="card-viking p-4">
        <div className="flex items-center justify-between">
          <b className="text-sm text-[#ece6d6]">Exploration</b>
          <span className="rounded-full bg-[#f2d16b]/12 px-2.5 py-1 text-xs font-bold text-[#f2d16b]">{state.totalPoints} pts</span>
        </div>
        <div className="mt-2.5 flex gap-1">
          {MAP_ZONES.map((z) => {
            const done = state.totalPoints >= z.at;
            return (
              <div key={z.name} className="flex-1 text-center" title={z.name}>
                <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${done ? 'bg-[#7fbf7f]/20' : 'bg-[#1a241f] opacity-40'}`}>
                  {done ? z.icon : <Lock size={11} className="text-[#5a6a60]" />}
                </div>
              </div>
            );
          })}
        </div>
        {nextZone ? (
          <>
            <div className="bar-track mt-3">
              <div className="bar-fill bg-gradient-to-r from-[#7fbf7f] to-[#f2d16b]" style={{ width: `${Math.min(100, ((state.totalPoints - prevAt) / (nextZone.at - prevAt)) * 100)}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-[#a8b3a5]">Prochaine terre : <b className="text-[#ece6d6]">{nextZone.icon} {nextZone.name}</b> ({nextZone.at - state.totalPoints} pts)</p>
          </>
        ) : (
          <p className="mt-3 text-[11px] font-bold text-[#7fbf7f]">Toute la prairie est revelee.</p>
        )}
      </div>
      {quests.map((q) => (
        <div key={q.id} className="card-viking p-3.5">
          <div className="flex items-center justify-between">
            <b className="flex items-center gap-2 text-sm text-[#ece6d6]">
              <span className="text-lg">{q.icon}</span> {q.name}
              {q.completed > 0 && <span className="rounded-full bg-[#7fbf7f]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#7fbf7f]">x{q.completed}</span>}
            </b>
            <span className="text-[11px] font-bold text-[#a8b3a5]">{q.progress}/{q.cost}</span>
          </div>
          <div className="bar-track mt-2">
            <div className="bar-fill bg-gradient-to-r from-[#c48a4a] to-[#f2d16b]" style={{ width: `${Math.min(100, (q.progress / q.cost) * 100)}%` }} />
          </div>
        </div>
      ))}
      <button onClick={onGoQuests} className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold">
        <ScrollText size={15} /> Ouvrir le livre des quetes
      </button>
    </div>
  );

  /* ======================== ETABLI ======================== */
  const etabliPanel = (
    <div className="space-y-3">
      <PanelHeader icon={<span>{'\u{1FA9A}'}</span>} title="L'atelier" />
      {!built.includes('abri') && (
        <div className="rounded-xl bg-[#e8955a]/10 px-3 py-2 text-[11px] text-[#e8955a]">
          Une simple souche. Construis l'<b>Abri</b> pour monter un vrai atelier.
        </div>
      )}
      {CRAFTS.map((cr) => {
        const done = cr.unique && state.crafted.includes(cr.id);
        const unlocked = cr.requires.every((r) => built.includes(r));
        const afford = Object.entries(cr.cost).every(([k, v]) => (state.inventory[k] ?? 0) >= v);
        const can = !done && unlocked && afford;
        return (
          <div key={cr.id} className={`card-viking p-4 ${done ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1a241f] text-2xl">
                {done ? <Check className="text-[#7fbf7f]" size={22} /> : !unlocked ? <Lock className="text-[#5a6a60]" size={20} /> : cr.icon}
              </div>
              <div className="min-w-0 flex-1">
                <b className="text-sm text-[#ece6d6]">{cr.name}</b>
                {cr.unique && <span className="ml-2 rounded-full bg-[#c48a4a]/20 px-2 py-0.5 text-[10px] font-bold text-[#c48a4a]">unique</span>}
                <p className="mt-0.5 text-xs leading-relaxed text-[#a8b3a5]">{cr.desc}</p>
                {!done && unlocked && <div className="mt-2"><CostLine cost={cr.cost} inv={state.inventory} /></div>}
                {!done && !unlocked && <p className="mt-1.5 text-[11px] text-[#5a6a60]">Requiert : {cr.requires.map((r) => BUILDINGS.find((x) => x.id === r)?.name).join(', ')}</p>}
              </div>
            </div>
            {!done && unlocked && (
              <button disabled={!can} onClick={() => craft(cr.id)}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${can ? 'btn-wood' : 'btn-ghost opacity-50'}`}>
                Fabriquer {Object.entries(cr.gives).map(([k]) => ITEMS[k]?.icon).join(' ')}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  /* ======================== MAISON ======================== */
  const nextBuild = BUILDINGS.find((b) => !built.includes(b.id) && b.requires.every((r) => built.includes(r)));
  const maisonPanel = (
    <div className="space-y-3">
      <PanelHeader icon={<span>{'\u{1F3E0}'}</span>} title="La Maison" />
      {nextBuild ? (
        <div className="card-viking flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f2d16b]/12 text-2xl">{nextBuild.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7fbf7f]">Prochain objectif</div>
            <div className="truncate text-sm font-bold text-[#ece6d6]">{nextBuild.name}</div>
            <div className="mt-1"><CostLine cost={nextBuild.cost} inv={state.inventory} /></div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#f2d16b]/40 bg-gradient-to-r from-[#f2d16b]/15 to-[#7fbf7f]/10 p-4">
          <div className="font-display text-sm font-bold text-[#f2d16b]">Skal ! Ta maison est achevee.</div>
        </div>
      )}
      {BUILDINGS.map((b) => {
        const done = built.includes(b.id);
        const unlocked = b.requires.every((r) => built.includes(r));
        const can = canBuild(b.id);
        return (
          <div key={b.id} className={`card-viking p-4 transition ${done ? 'opacity-60' : ''} ${justBuilt === b.id ? 'pop border-[#7fbf7f]' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1a241f] text-2xl">
                {done ? <Check className="text-[#7fbf7f]" size={22} /> : !unlocked ? <Lock className="text-[#5a6a60]" size={20} /> : b.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <b className="text-sm text-[#ece6d6]">{b.name}</b>
                  <span className="rounded-full bg-[#f2d16b]/12 px-2 py-0.5 text-[10px] font-bold text-[#f2d16b]">+{b.comfort} confort</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-[#a8b3a5]">{b.desc}</p>
                {!done && unlocked && <div className="mt-2"><CostLine cost={b.cost} inv={state.inventory} /></div>}
                {!done && !unlocked && <p className="mt-1.5 text-[11px] text-[#5a6a60]">Requiert : {b.requires.map((r) => BUILDINGS.find((x) => x.id === r)?.name).join(', ')}</p>}
              </div>
            </div>
            {!done && unlocked && (
              <button disabled={!can} onClick={() => doBuild(b.id)}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${can ? 'btn-gold' : 'btn-ghost opacity-50'}`}>
                <Hammer size={15} /> Batir
              </button>
            )}
            {justBuilt === b.id && (
              <div className="pop mt-2 rounded-xl bg-[#7fbf7f]/15 px-3 py-2 text-center text-xs font-bold text-[#7fbf7f]">
                {b.name} construit ! Confort +{b.comfort}
              </div>
            )}
          </div>
        );
      })}
      <div className="pt-1">
        <button onClick={() => setShowSave(!showSave)} className="flex w-full items-center justify-between px-1 py-2 text-xs font-semibold text-[#7d8a80]">
          <span>Sauvegarde</span> <ChevronDown size={14} className={`transition ${showSave ? 'rotate-180' : ''}`} />
        </button>
        {showSave && (
          <div className="card-viking space-y-2 p-4">
            <div className="flex gap-2">
              <button onClick={exportSave} className="btn-ghost flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold">
                <Download size={14} /> Exporter
              </button>
              <button onClick={() => fileRef.current?.click()} className="btn-ghost flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold">
                <Upload size={14} /> Importer
              </button>
              <input ref={fileRef} type="file" accept=".json" hidden onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) { try { await importSave(f); } catch { alert('Fichier invalide'); } }
                e.target.value = '';
              }} />
            </div>
            <p className="text-[11px] leading-relaxed text-[#7d8a80]">Exporte ta progression avant de changer d'appareil.</p>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)} className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold text-[#5a6a60]">
                <Trash2 size={12} /> Tout recommencer
              </button>
            ) : (
              <div className="rounded-xl bg-[#b33a3a]/10 p-3 text-center">
                <p className="text-xs font-bold text-[#e08a7a]">Tout effacer ?</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setConfirmReset(false)} className="btn-ghost flex-1 rounded-lg px-3 py-2 text-xs font-bold">Garder</button>
                  <button onClick={resetSave} className="flex-1 rounded-lg bg-[#b33a3a] px-3 py-2 text-xs font-bold text-white">Tout effacer</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  /* ======================== FEU ======================== */
  const feuBuilt = built.includes('feu');
  const feuPanel = (
    <div className="space-y-3">
      <PanelHeader icon={<Flame className="text-[#e8955a]" size={22} />} title="Feu de camp" />
      {!feuBuilt ? (
        <div className="card-viking space-y-3 p-4">
          <p className="text-xs leading-relaxed text-[#a8b3a5]">Quelques pierres froides. Le feu est ta premiere construction.</p>
          <CostLine cost={BUILDINGS[0].cost} inv={state.inventory} />
          <button disabled={!canBuild('feu')} onClick={() => doBuild('feu')}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${canBuild('feu') ? 'btn-gold' : 'btn-ghost opacity-50'}`}>
            <Flame size={15} /> Allumer le feu
          </button>
        </div>
      ) : (
        <>
          <div className="card-viking space-y-3 p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{'\u{1F372}'}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-[#ece6d6]">Repas du chasseur</div>
                <div className="text-[11px] text-[#a8b3a5]">x1.2 sur les points. Fabrique a l'atelier (3 baies + 1 viande).</div>
              </div>
              <span className="rounded-full bg-[#1a241f] px-2.5 py-1 text-sm font-bold text-[#ece6d6]">{'\u{1F372}'} x{state.inventory.repas ?? 0}</span>
            </div>
            {state.buff ? (
              <div className="pop rounded-xl border border-[#f2d16b]/40 bg-[#f2d16b]/10 px-3 py-2.5 text-center text-xs font-bold text-[#f2d16b]">
                Deja actif : x{state.buff.mult}
              </div>
            ) : (
              <button disabled={(state.inventory.repas ?? 0) < 1} onClick={() => eatMeal()}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold ${(state.inventory.repas ?? 0) > 0 ? 'btn-gold' : 'btn-ghost opacity-50'}`}>
                <UtensilsCrossed size={15} /> Manger un repas
              </button>
            )}
          </div>
          <div className="card-viking grid grid-cols-2 divide-x divide-[#3f5548] p-4 text-center">
            <div>
              <div className="font-display text-xl font-bold text-[#f2d16b]">x{lootMultiplierForComfort(comfort).toFixed(2)}</div>
              <div className="text-[10px] uppercase tracking-wider text-[#a8b3a5]">butin (confort {comfort}/5)</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-[#ece6d6]">{state.sessions.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-[#a8b3a5]">seances totales</div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const panels: Record<CampLoc, React.ReactNode> = {
    rive: rivePanel, rune: runePanel, etabli: etabliPanel, maison: maisonPanel, feu: feuPanel,
  };

  return (
    <div className="space-y-4">
      <div className="rise">
        <HouseScene loc={loc} onSelect={setLoc} />
      </div>
      <div className="-mx-4 px-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {CAMP_SPOTS.map((s) => {
            const unlocked = isUnlocked(s);
            const active = s.id === loc;
            return (
              <button key={s.id} onClick={() => setLoc(s.id)}
                className={`chip-loc flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold ${
                  active ? 'border-[#f2d16b] bg-[#f2d16b] text-[#221806] shadow-[0_6px_18px_-6px_rgba(242,209,107,.6)]'
                    : unlocked ? 'border-[#3f5548] bg-[#24332b] text-[#ece6d6]'
                    : 'border-[#3f5548]/60 bg-[#1c2620] text-[#5a6a60]'
                }`}>
                <MapPin size={11} className={active ? '' : 'hidden'} />
                <span>{unlocked ? s.icon : '\u{1F512}'}</span>
                {s.short}
              </button>
            );
          })}
        </div>
      </div>
      <div key={loc} className="rise card-viking p-4">
        {panels[loc]}
      </div>
      {justBuilt && (
        <Modal onClose={() => setJustBuilt(null)}>
          <div className="text-center">
            <div className="text-5xl">{'\u{1F389}'}</div>
            <h3 className="font-display mt-2 text-lg font-bold text-[#f2d16b]">
              {BUILDINGS.find((b) => b.id === justBuilt)?.name} !
            </h3>
            <p className="mt-1 text-sm text-[#a8b3a5]">Ton viking s'approche pour admirer l'ouvrage.</p>
            <button onClick={() => setJustBuilt(null)} className="btn-gold mt-4 w-full rounded-xl px-4 py-3 font-bold">Skal !</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
