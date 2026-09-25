import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, FileUp, Flame, HeartPulse, Timer, Zap, FlaskConical, ChevronRight, RotateCcw, PartyPopper } from 'lucide-react';
import { useGame, availableQuests, type ApplyResult } from '../game/store';
import { parseActivityFile, fakeSession, sportLabel } from '../fit/parser';
import { computePoints, ZONES, RPE_LABELS } from '../game/points';
import { ITEMS } from '../game/loot';
import type { Session } from '../game/types';

const DEV = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').has('dev');

export default function Upload({ onDone }: { onDone: () => void }) {
  const { state, applySession } = useGame();
  const [pending, setPending] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questId, setQuestId] = useState('');
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // manuel
  const [sport, setSport] = useState('');
  const [dur, setDur] = useState(60);
  const [rpe, setRpe] = useState(2);

  const est = useMemo(() => (pending ? computePoints(pending, state.character!.fcmax) : null), [pending, state.character]);
  const quests = useMemo(() => availableQuests(state), [state]);

  const handleFile = async (f: File | undefined) => {
    if (!f) return;
    setError('');
    setLoading(true);
    try {
      const s = await parseActivityFile(f);
      setPending(s);
      setQuestId('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fichier illisible');
    } finally {
      setLoading(false);
    }
  };

  const handleManual = () => {
    if (!dur || dur <= 0) { setError('Indique une durée valide.'); return; }
    setError('');
    setPending({
      source: 'manuel', date: new Date().toISOString(),
      sport: sport.trim() || 'sport', durationSec: Math.round(dur * 60),
      intensity: rpe, hr: [],
    });
    setQuestId('');
  };

  const handleDev = () => {
    setError('');
    setPending(fakeSession(45 + Math.floor(Math.random() * 60), state.character!.fcmax));
    setQuestId('');
  };

  const harvest = () => {
    if (!pending) return;
    const res = applySession(pending, questId || null);
    setPending(null);
    setResult(res);
  };

  const totalZoneMin = est ? Object.values(est.perZoneMin).reduce((a, b) => a + b, 0) : 0;

  /* ============ RÉSULTAT ============ */
  if (result) {
    const q = result.questResult;
    return (
      <div className="space-y-4">
        <div className="rise card-viking overflow-hidden p-0 text-center">
          <div className="bg-gradient-to-b from-[#f2d16b]/20 to-transparent px-6 pb-4 pt-8">
            <div className="pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#f2d16b] to-[#d9a93c] shadow-[0_10px_30px_-6px_rgba(242,209,107,.7)]">
              <PartyPopper className="text-[#221806]" size={28} />
            </div>
            <h2 className="font-display mt-3 text-xl font-bold text-[#f2d16b]">Butin de la sortie</h2>
            <div className="font-display mt-1 text-4xl font-bold text-[#ece6d6]">
              {result.points} <span className="text-base font-normal text-[#a8b3a5]">pts</span>
            </div>
            {result.buff && (
              <p className="mt-1 text-xs text-[#f2d16b]">🍲 {result.base} × {result.buff.mult} ({result.buff.label})</p>
            )}
            {result.fcmaxUp && (
              <p className="pop mt-2 inline-block rounded-full bg-[#e08a7a]/15 px-3 py-1 text-[11px] font-bold text-[#e08a7a]">
                ❤️‍🔥 Nouvelle FC max : {state.character!.fcmax} bpm !
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            {Object.entries(result.loot).map(([k, v], i) => (
              <div key={k} className="loot-drop flex items-center gap-2.5 rounded-xl border border-[#3f5548] bg-[#1a241f] p-3 text-left" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="text-3xl">{ITEMS[k]?.icon}</span>
                <div>
                  <div className="font-display text-lg font-bold leading-none text-[#ece6d6]">+{v}</div>
                  <div className="text-[11px] text-[#a8b3a5]">{ITEMS[k]?.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {q && (
          <div className={`rise rise-1 card-viking p-4 ${q.done ? 'border-[#7fbf7f]/50' : ''}`}>
            {q.done ? (
              <>
                <div className="text-center">
                  <div className="text-4xl">{q.perfect ? '🏆' : '✅'}</div>
                  <h3 className="font-display mt-1 text-base font-bold text-[#7fbf7f]">
                    {q.name} accomplie{q.perfect ? ' — chasse parfaite !' : ' !'}
                  </h3>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(q.reward ?? {}).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 rounded-xl bg-[#7fbf7f]/10 p-3">
                      <span className="text-2xl">{ITEMS[k]?.icon}</span>
                      <div>
                        <div className="font-display font-bold text-[#ece6d6]">+{v}</div>
                        <div className="text-[10px] text-[#a8b3a5]">{ITEMS[k]?.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-[#ece6d6]">📜 {q.name}</h3>
                <div className="bar-track mt-2">
                  <div className="bar-fill bg-gradient-to-r from-[#c48a4a] to-[#f2d16b]" style={{ width: `${((q.progress ?? 0) / (q.cost ?? 1)) * 100}%` }} />
                </div>
                <p className="mt-1.5 text-[11px] text-[#a8b3a5]">{q.progress}/{q.cost} pts — continue à la prochaine sortie.</p>
              </>
            )}
          </div>
        )}

        <button onClick={() => { setResult(null); onDone(); }} className="btn-gold flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold">
          Voir ma maison <ChevronRight size={17} />
        </button>
      </div>
    );
  }

  /* ============ VALIDATION SÉANCE ============ */
  if (pending && est) {
    return (
      <div className="space-y-4">
        <div className="rise flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-[#f2d16b]">Séance détectée</h1>
          <button onClick={() => setPending(null)} className="btn-ghost flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold">
            <RotateCcw size={13} /> Recommencer
          </button>
        </div>

        <div className="rise rise-1 card-viking overflow-hidden p-0">
          <div className="flex items-center justify-between bg-gradient-to-r from-[#e8955a]/20 to-transparent px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8955a]/20 text-2xl">🔥</div>
              <div>
                <div className="text-sm font-bold text-[#ece6d6]">{sportLabel(pending.sport)}</div>
                <div className="text-[11px] text-[#a8b3a5]">
                  {new Date(pending.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {' · '}source {pending.source === 'fit' ? 'montre ⌚' : pending.source === 'dev' ? 'test 🧪' : 'manuelle ✍️'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-[#f2d16b]">≈{est.points}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#a8b3a5]">points</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-4">
            <div className="rounded-xl bg-[#1a241f] p-3 text-center">
              <Timer size={15} className="mx-auto text-[#7fbf7f]" />
              <div className="mt-1 font-display text-base font-bold text-[#ece6d6]">{Math.round(pending.durationSec / 60)}′</div>
              <div className="text-[10px] text-[#a8b3a5]">durée</div>
            </div>
            <div className="rounded-xl bg-[#1a241f] p-3 text-center">
              <HeartPulse size={15} className="mx-auto text-[#e08a7a]" />
              <div className="mt-1 font-display text-base font-bold text-[#ece6d6]">
                {pending.avgHr ? `${pending.avgHr}` : '—'}
              </div>
              <div className="text-[10px] text-[#a8b3a5]">FC moy{pending.maxHr ? ` · max ${pending.maxHr}` : ''}</div>
            </div>
            <div className="rounded-xl bg-[#1a241f] p-3 text-center">
              <Zap size={15} className="mx-auto text-[#f2d16b]" />
              <div className="mt-1 font-display text-base font-bold text-[#ece6d6]">{pending.calories ?? '—'}</div>
              <div className="text-[10px] text-[#a8b3a5]">kcal</div>
            </div>
          </div>

          {est.hasHr && totalZoneMin > 0 && (
            <div className="px-4 pb-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#a8b3a5]">Zones cardiaques</div>
              <div className="mt-1.5 flex h-3 overflow-hidden rounded-full">
                {ZONES.map((z) => {
                  const w = (est.perZoneMin[z.name] / totalZoneMin) * 100;
                  if (w <= 0) return null;
                  return <div key={z.name} style={{ width: `${w}%`, background: z.color }} title={`${z.name} ${Math.round(est.perZoneMin[z.name])}′`} />;
                })}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {ZONES.map((z) => (
                  <span key={z.name} className="flex items-center gap-1 text-[10px] text-[#a8b3a5]">
                    <span className="h-2 w-2 rounded-full" style={{ background: z.color }} />
                    {z.name} {Math.round(est.perZoneMin[z.name])}′
                  </span>
                ))}
              </div>
            </div>
          )}
          {!est.hasHr && (
            <p className="px-4 pb-4 text-[11px] text-[#a8b3a5]">
              Sans FC : points calculés via l’intensité ressentie ({RPE_LABELS[(pending.intensity ?? 2) - 1]}).
            </p>
          )}
          {state.buff && (
            <p className="mx-4 mb-4 rounded-xl bg-[#f2d16b]/10 px-3 py-2 text-center text-xs font-bold text-[#f2d16b]">
              🍲 {state.buff.label} actif : ×{state.buff.mult} → ≈{Math.round(est.points * state.buff.mult)} pts
            </p>
          )}
        </div>

        <div className="rise rise-2 card-viking p-4">
          <label className="text-xs font-bold uppercase tracking-wider text-[#a8b3a5]">Affecter à une quête</label>
          <div className="mt-2 space-y-2">
            <button
              onClick={() => setQuestId('')}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${questId === '' ? 'border-[#f2d16b] bg-[#f2d16b]/10' : 'border-transparent bg-[#1a241f]'}`}
            >
              <span className="text-2xl">🧭</span>
              <span>
                <span className="block text-sm font-bold text-[#ece6d6]">Exploration libre</span>
                <span className="block text-[11px] text-[#a8b3a5]">Butin seulement, sans quête</span>
              </span>
            </button>
            {quests.map((q) => (
              <button
                key={q.id}
                onClick={() => setQuestId(q.id)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${questId === q.id ? 'border-[#f2d16b] bg-[#f2d16b]/10' : 'border-transparent bg-[#1a241f]'}`}
              >
                <span className="text-2xl">{q.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-[#ece6d6]">{q.name}</span>
                  <span className="block text-[11px] text-[#a8b3a5]">{q.progress}/{q.cost} pts · 🎁 {Object.entries(q.reward).map(([k, v]) => `${ITEMS[k]?.icon}×${v}`).join(' ')}</span>
                </span>
              </button>
            ))}
          </div>
          <button onClick={harvest} className="btn-gold mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold">
            <Flame size={17} /> Récolter {questId ? 'et avancer la quête' : 'le butin'}
          </button>
        </div>
      </div>
    );
  }

  /* ============ ACCUEIL RETOUR ============ */
  return (
    <div className="space-y-4">
      <div className="rise">
        <h1 className="font-display text-xl font-bold text-[#f2d16b]">🔥 Retour au campement</h1>
        <p className="text-xs text-[#a8b3a5]">Charge ta séance ou saisis-la à la main pour récolter ton butin.</p>
      </div>

      {state.buff && (
        <div className="rise rise-1 rounded-2xl border border-[#f2d16b]/40 bg-[#f2d16b]/10 px-4 py-2.5 text-center text-xs font-bold text-[#f2d16b]">
          🍲 {state.buff.label} actif : ×{state.buff.mult} sur cette séance
        </div>
      )}

      {/* fichier */}
      <div
        className={`rise rise-1 card-viking cursor-pointer border-dashed p-6 text-center transition ${
          dragOver ? 'border-[#f2d16b] bg-[#f2d16b]/5' : ''
        } ${loading ? 'opacity-60' : ''}`}
        onClick={() => !loading && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
      >
        <input
          ref={fileRef} type="file" accept=".fit,.zip" hidden
          onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
        />
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8955a]/15">
          {loading ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e8955a] border-t-transparent" /> : <FileUp className="text-[#e8955a]" size={26} />}
        </div>
        <p className="mt-3 text-sm font-bold text-[#ece6d6]">
          {loading ? 'Lecture du fichier…' : '📂 Choisir un fichier FIT / ZIP'}
        </p>
        <p className="mx-auto mt-1 max-w-[300px] text-[11px] leading-relaxed text-[#a8b3a5]">
          Garmin Connect (web) → activité → ⚙️ → Exporter l’original (.zip). L’appli lit le zip directement. Strava : exporter le GPX/TCX converti si besoin.
        </p>
      </div>

      {error && (
        <div className="pop flex items-start gap-2 rounded-2xl border border-[#e08a7a]/40 bg-[#e08a7a]/10 p-3 text-xs text-[#e08a7a]">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* manuel */}
      <div className="rise rise-2 card-viking p-4">
        <h2 className="text-sm font-bold text-[#ece6d6]">✍️ Saisie manuelle</h2>
        <label className="mt-3 block text-[11px] font-bold uppercase tracking-wider text-[#a8b3a5]">Sport</label>
        <input
          className="input-viking mt-1"
          placeholder="Badminton, muscu, marche…"
          value={sport} onChange={(e) => setSport(e.target.value)}
        />
        <label className="mt-3 block text-[11px] font-bold uppercase tracking-wider text-[#a8b3a5]">Durée (minutes)</label>
        <div className="mt-1 flex items-center gap-2">
          {[30, 45, 60, 90].map((m) => (
            <button
              key={m}
              onClick={() => setDur(m)}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition ${dur === m ? 'bg-[#f2d16b] text-[#221806]' : 'bg-[#1a241f] text-[#a8b3a5]'}`}
            >
              {m}′
            </button>
          ))}
          <input
            className="input-viking !w-20 text-center" type="number" min={1} max={900}
            value={dur} onChange={(e) => setDur(+e.target.value)}
          />
        </div>
        <label className="mt-3 block text-[11px] font-bold uppercase tracking-wider text-[#a8b3a5]">
          Intensité ressentie — <span className="text-[#f2d16b]">{RPE_LABELS[rpe - 1]}</span>
        </label>
        <div className="mt-1.5 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setRpe(i)}
              className={`h-10 flex-1 rounded-lg font-display text-base font-bold transition ${
                i <= rpe
                  ? i <= 2 ? 'bg-[#7fbf7f] text-[#0d1512]' : i <= 3 ? 'bg-[#f2d16b] text-[#221806]' : i <= 4 ? 'bg-[#e8955a] text-[#221806]' : 'bg-[#e05a5a] text-white'
                  : 'bg-[#1a241f] text-[#5a6a60]'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="mt-2 text-center text-[11px] text-[#a8b3a5]">
          ≈ <b className="text-[#ece6d6]">{Math.round(dur * [0.5, 1, 1.5, 2, 2.5][rpe - 1])} pts</b> estimés
        </div>
        <button onClick={handleManual} className="btn-ghost mt-3 w-full rounded-xl px-4 py-3 font-bold">
          Valider cette séance
        </button>
      </div>

      {/* dev */}
      <div className="rise rise-3">
        {DEV ? (
          <button onClick={handleDev} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#7fbf7f]/50 bg-[#7fbf7f]/5 px-4 py-3 text-sm font-bold text-[#7fbf7f]">
            <FlaskConical size={15} /> Générer une fausse séance (dev)
          </button>
        ) : (
          <details className="rounded-2xl border border-[#3f5548]/60 px-4 py-3">
            <summary className="cursor-pointer text-xs font-semibold text-[#7d8a80]">Pas de montre sous la main ? (mode test)</summary>
            <p className="mt-2 text-[11px] leading-relaxed text-[#7d8a80]">
              Ajoute <code className="rounded bg-[#1a241f] px-1.5 py-0.5 text-[#f2d16b]">?dev</code> à l’URL
              pour débloquer le générateur de fausse séance, ou utilise la saisie manuelle ci-dessus.
            </p>
            <button onClick={handleDev} className="btn-ghost mt-2 w-full rounded-xl px-4 py-2.5 text-xs font-bold">
              <span className="flex items-center justify-center gap-2"><FlaskConical size={14} /> Générer quand même une séance test</span>
            </button>
          </details>
        )}
      </div>

    </div>
  );
}
