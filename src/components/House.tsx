import { useRef, useState } from 'react';
import { Check, ChevronDown, Download, Hammer, Lock, Upload, FlaskConical, Trash2 } from 'lucide-react';
import { useGame } from '../game/store';
import { BUILDINGS, CRAFTS, lootMultiplierForComfort } from '../game/recipes';
import { ITEMS } from '../game/loot';
import HouseScene from './HouseScene';
import Modal from './Modal';

function CostLine({ cost, inv }: { cost: Record<string, number>; inv: Record<string, number> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(cost).map(([k, v]) => {
        const have = inv[k] ?? 0;
        const ok = have >= v;
        return (
          <span
            key={k}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
              ok ? 'bg-[#7fbf7f]/15 text-[#7fbf7f]' : 'bg-[#e08a7a]/15 text-[#e08a7a]'
            }`}
          >
            <span>{ITEMS[k]?.icon}</span> {have}/{v}
          </span>
        );
      })}
    </div>
  );
}

export default function House({ onGoUpload }: { onGoUpload: () => void }) {
  const { state, comfort, build, craft, exportSave, importSave, resetSave } = useGame();
  const [showSave, setShowSave] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [justBuilt, setJustBuilt] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const nextBuild = BUILDINGS.find((b) => !state.built.includes(b.id) && b.requires.every((r) => state.built.includes(r)));

  const doBuild = (id: string) => {
    if (build(id)) {
      setJustBuilt(id);
      setTimeout(() => setJustBuilt(null), 2500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rise">
        <HouseScene />
      </div>

      {/* prochain objectif */}
      {nextBuild ? (
        <div className="rise rise-1 card-viking flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f2d16b]/12 text-2xl">
            {nextBuild.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7fbf7f]">Prochain objectif</div>
            <div className="truncate text-sm font-bold text-[#ece6d6]">{nextBuild.name}</div>
            <div className="mt-1"><CostLine cost={nextBuild.cost} inv={state.inventory} /></div>
          </div>
        </div>
      ) : (
        <div className="rise rise-1 overflow-hidden rounded-2xl border border-[#f2d16b]/40 bg-gradient-to-r from-[#f2d16b]/15 to-[#7fbf7f]/10 p-4">
          <div className="font-display text-sm font-bold text-[#f2d16b]">⚔️ Skål ! Ta maison est achevée.</div>
          <p className="mt-1 text-xs text-[#a8b3a5]">Fabrique la Tenue en cuir pour ouvrir la route vers la Forêt Noire.</p>
        </div>
      )}

      {/* CTA sport */}
      <button onClick={onGoUpload} className="btn-wood rise rise-1 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold">
        <FlaskConical size={0} className="hidden" />🔥 Je reviens de l’effort — récolter
      </button>

      {/* constructions */}
      <section className="rise rise-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-[#f2d16b]">🛠️ Construire</h2>
          <span className="text-[11px] text-[#a8b3a5]">Butin ×{lootMultiplierForComfort(comfort).toFixed(2)}</span>
        </div>
        <div className="space-y-2.5">
          {BUILDINGS.map((b) => {
            const done = state.built.includes(b.id);
            const unlocked = b.requires.every((r) => state.built.includes(r));
            const afford = Object.entries(b.cost).every(([k, v]) => (state.inventory[k] ?? 0) >= v);
            const can = !done && unlocked && afford;
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
                    {!done && !unlocked && (
                      <p className="mt-1.5 text-[11px] text-[#5a6a60]">
                        Requiert : {b.requires.map((r) => BUILDINGS.find((x) => x.id === r)?.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                {!done && unlocked && (
                  <button
                    disabled={!can}
                    onClick={() => doBuild(b.id)}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${can ? 'btn-gold' : 'btn-ghost opacity-50'}`}
                  >
                    <Hammer size={15} /> Bâtir
                  </button>
                )}
                {justBuilt === b.id && (
                  <div className="pop mt-2 rounded-xl bg-[#7fbf7f]/15 px-3 py-2 text-center text-xs font-bold text-[#7fbf7f]">
                    🎉 {b.name} construit ! Confort +{b.comfort}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* artisanat */}
      <section className="rise rise-3">
        <h2 className="font-display mb-2 text-base font-bold text-[#f2d16b]">⚒️ Artisanat</h2>
        <div className="space-y-2.5">
          {CRAFTS.map((cr) => {
            const done = cr.unique && state.crafted.includes(cr.id);
            const unlocked = cr.requires.every((r) => state.built.includes(r));
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
                    {!done && !unlocked && (
                      <p className="mt-1.5 text-[11px] text-[#5a6a60]">
                        Requiert : {cr.requires.map((r) => BUILDINGS.find((x) => x.id === r)?.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                {!done && unlocked && (
                  <button
                    disabled={!can}
                    onClick={() => craft(cr.id)}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${can ? 'btn-wood' : 'btn-ghost opacity-50'}`}
                  >
                    Fabriquer {Object.entries(cr.gives).map(([k]) => ITEMS[k]?.icon).join(' ')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* sauvegarde */}
      <section className="rise rise-4 pb-2">
        <button onClick={() => setShowSave(!showSave)} className="flex w-full items-center justify-between px-1 py-2 text-xs font-semibold text-[#7d8a80]">
          <span>Sauvegarde & données</span> <ChevronDown size={14} className={`transition ${showSave ? 'rotate-180' : ''}`} />
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
              <input
                ref={fileRef} type="file" accept=".json" hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) { try { await importSave(f); } catch { alert('Fichier invalide'); } }
                  e.target.value = '';
                }}
              />
            </div>
            <p className="text-[11px] leading-relaxed text-[#7d8a80]">
              Ta progression est sauvegardée dans ce navigateur. Exporte-la avant de changer d’appareil — et pense à l’ajouter à ton écran d’accueil sur iPhone.
            </p>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)} className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold text-[#5a6a60]">
                <Trash2 size={12} /> Tout recommencer
              </button>
            ) : (
              <div className="rounded-xl bg-[#b33a3a]/10 p-3 text-center">
                <p className="text-xs font-bold text-[#e08a7a]">Abandonner ta maison et tout effacer ?</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setConfirmReset(false)} className="btn-ghost flex-1 rounded-lg px-3 py-2 text-xs font-bold">Garder</button>
                  <button onClick={resetSave} className="flex-1 rounded-lg bg-[#b33a3a] px-3 py-2 text-xs font-bold text-white">Tout effacer</button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {justBuilt && (
        <Modal onClose={() => setJustBuilt(null)}>
          <div className="text-center">
            <div className="text-5xl">🎉</div>
            <h3 className="font-display mt-2 text-lg font-bold text-[#f2d16b]">
              {BUILDINGS.find((b) => b.id === justBuilt)?.name} !
            </h3>
            <p className="mt-1 text-sm text-[#a8b3a5]">Ta maison grandit. Les dieux te regardent.</p>
            <button onClick={() => setJustBuilt(null)} className="btn-gold mt-4 w-full rounded-xl px-4 py-3 font-bold">Skål !</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
