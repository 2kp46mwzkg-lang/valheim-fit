import { Lock, Map as MapIcon, Repeat } from 'lucide-react';
import { useGame, availableQuests } from '../game/store';
import { QUESTS, MAP_ZONES } from '../game/recipes';
import { ITEMS } from '../game/loot';

export default function Quests({ onGoUpload }: { onGoUpload: () => void }) {
  const { state } = useGame();
  const avail = availableQuests(state);
  const locked = QUESTS.filter((q) => state.totalPoints < q.unlockAt);
  const revealed = MAP_ZONES.filter((z) => z.at <= state.totalPoints);
  const next = MAP_ZONES.find((z) => z.at > state.totalPoints);
  const prevAt = revealed.length ? revealed[revealed.length - 1].at : 0;

  return (
    <div className="space-y-4">
      <div className="rise">
        <h1 className="font-display text-xl font-bold text-[#f2d16b]">📜 Quêtes</h1>
        <p className="text-xs text-[#a8b3a5]">Affecte tes séances à une quête depuis l’onglet Retour.</p>
      </div>

      {/* carte */}
      <div className="rise rise-1 card-viking overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#ece6d6]">
            <MapIcon size={16} className="text-[#7fbf7f]" /> Exploration
          </div>
          <span className="rounded-full bg-[#f2d16b]/12 px-2.5 py-1 text-xs font-bold text-[#f2d16b]">
            {state.totalPoints} pts
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-2">
          {MAP_ZONES.map((z) => {
            const done = state.totalPoints >= z.at;
            return (
              <div
                key={z.name}
                className={`flex min-w-[104px] flex-1 flex-col items-center rounded-xl border px-2 py-2.5 text-center ${
                  done ? 'border-[#7fbf7f]/40 bg-[#7fbf7f]/10' : 'border-[#3f5548] bg-[#1a241f] opacity-50'
                }`}
              >
                <span className="text-xl">{done ? z.icon : <Lock size={16} className="text-[#5a6a60]" />}</span>
                <span className={`mt-1 text-[10px] font-bold leading-tight ${done ? 'text-[#ece6d6]' : 'text-[#5a6a60]'}`}>{z.name}</span>
                <span className="text-[9px] text-[#7d8a80]">{z.at} pts</span>
              </div>
            );
          })}
        </div>
        <div className="px-4 pb-4">
          {next ? (
            <>
              <div className="bar-track">
                <div
                  className="bar-fill bg-gradient-to-r from-[#7fbf7f] to-[#f2d16b]"
                  style={{ width: `${Math.min(100, ((state.totalPoints - prevAt) / (next.at - prevAt)) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#a8b3a5]">
                Prochaine zone : <b className="text-[#ece6d6]">{next.icon} {next.name}</b> à {next.at} pts
                ({next.at - state.totalPoints} restants)
              </p>
            </>
          ) : (
            <p className="text-[11px] font-bold text-[#7fbf7f]">🗺️ Toute la prairie est révélée. La Forêt Noire approche…</p>
          )}
        </div>
      </div>

      {/* quêtes dispo */}
      <div className="space-y-2.5">
        {avail.map((q, i) => {
          const pct = Math.min(100, (q.progress / q.cost) * 100);
          return (
            <div key={q.id} className={`rise card-viking p-4 ${i === 1 ? 'rise-2' : i === 2 ? 'rise-3' : 'rise-1'}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1a241f] text-2xl">{q.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <b className="text-sm text-[#ece6d6]">{q.name}</b>
                    {q.completed > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-[#7fbf7f]/15 px-2 py-0.5 text-[10px] font-bold text-[#7fbf7f]">
                        <Repeat size={10} /> ×{q.completed}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#a8b3a5]">{q.desc}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="bar-track">
                  <div className="bar-fill bg-gradient-to-r from-[#c48a4a] to-[#f2d16b]" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#a8b3a5]">{q.progress}/{q.cost} pts</span>
                  <span className="text-[#a8b3a5]">
                    🎁 {Object.entries(q.reward).map(([k, v]) => `${ITEMS[k]?.icon}×${v}`).join('  ')}
                    <span className="text-[#f2d16b]"> · parfait: +{Object.entries(q.perfectBonus).map(([k, v]) => `${ITEMS[k]?.icon}×${v}`).join(' ')}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {locked.map((q) => (
        <div key={q.id} className="card-viking flex items-center gap-3 p-4 opacity-50">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a241f]">
            <Lock size={18} className="text-[#5a6a60]" />
          </div>
          <div>
            <b className="text-sm text-[#7d8a80]">??? Quête inconnue</b>
            <p className="text-[11px] text-[#5a6a60]">Se révèle à {q.unlockAt} pts d’exploration.</p>
          </div>
        </div>
      ))}

      <button onClick={onGoUpload} className="btn-wood w-full rounded-2xl px-4 py-3.5 font-bold">
        🔥 Faire progresser une quête
      </button>

      <div className="rounded-2xl border border-dashed border-[#3f5548] p-4 text-[11px] leading-relaxed text-[#7d8a80]">
        💡 <b className="text-[#a8b3a5]">Chasse parfaite :</b> boucle une quête en une seule sortie pour rafler le bonus.
        Les quêtes sont répétables : reviens farmer peaux, plumes et silex.
      </div>
    </div>
  );
}
