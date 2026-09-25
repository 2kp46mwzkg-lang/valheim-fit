import { BookOpen, Flame, HeartPulse, Timer } from 'lucide-react';
import { useGame } from '../game/store';
import { ITEMS } from '../game/loot';
import { sportLabel } from '../fit/parser';
import { ZONES } from '../game/points';

export default function Journal() {
  const { state } = useGame();
  const totalMin = state.sessions.reduce((s, x) => s + x.durationSec / 60, 0);

  return (
    <div className="space-y-4">
      <div className="rise flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-[#f2d16b]">📖 Journal</h1>
          <p className="text-xs text-[#a8b3a5]">La saga de tes exploits</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3f5548] bg-[#24332b]">
          <BookOpen className="text-[#c48a4a]" size={22} />
        </div>
      </div>

      <div className="rise rise-1 grid grid-cols-3 gap-2">
        <div className="card-viking p-3 text-center">
          <Flame size={15} className="mx-auto text-[#e8955a]" />
          <div className="font-display mt-1 text-lg font-bold text-[#ece6d6]">{state.totalPoints}</div>
          <div className="text-[10px] text-[#a8b3a5]">points</div>
        </div>
        <div className="card-viking p-3 text-center">
          <Timer size={15} className="mx-auto text-[#7fbf7f]" />
          <div className="font-display mt-1 text-lg font-bold text-[#ece6d6]">{Math.round(totalMin)}′</div>
          <div className="text-[10px] text-[#a8b3a5]">d’effort</div>
        </div>
        <div className="card-viking p-3 text-center">
          <HeartPulse size={15} className="mx-auto text-[#e08a7a]" />
          <div className="font-display mt-1 text-lg font-bold text-[#ece6d6]">{state.character!.fcmax}</div>
          <div className="text-[10px] text-[#a8b3a5]">FC max</div>
        </div>
      </div>

      {state.sessions.length ? (
        <div className="space-y-2.5">
          {state.sessions.map((s, i) => {
            const total = Object.values(s.perZoneMin).reduce((a, b) => a + b, 0);
            return (
              <div key={i} className={`rise card-viking p-4 ${i < 3 ? `rise-${i + 1}` : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <b className="truncate text-sm text-[#ece6d6]">{sportLabel(s.sport)}</b>
                  <span className="shrink-0 rounded-full bg-[#f2d16b]/12 px-2.5 py-1 text-[11px] font-bold text-[#f2d16b]">
                    {s.points} pts
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[#a8b3a5]">
                  {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {' · '}{Math.round(s.durationSec / 60)} min
                  {s.avgHr ? ` · FC ${s.avgHr}` : ''}
                  {s.calories ? ` · ${s.calories} kcal` : ''}
                  {s.buff ? ' · 🍲' : ''}
                </div>
                {s.hasHr && total > 0 && (
                  <div className="mt-2 flex h-2 overflow-hidden rounded-full">
                    {ZONES.map((z) => {
                      const w = ((s.perZoneMin[z.name] ?? 0) / total) * 100;
                      if (w <= 0) return null;
                      return <div key={z.name} style={{ width: `${w}%`, background: z.color }} />;
                    })}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(s.loot).map(([k, v]) => (
                    <span key={k} className="rounded-lg bg-[#1a241f] px-2 py-1 text-[11px] font-semibold text-[#a8b3a5]">
                      {ITEMS[k]?.icon}{v}
                    </span>
                  ))}
                  {s.quest?.done && (
                    <span className="rounded-lg bg-[#7fbf7f]/15 px-2 py-1 text-[11px] font-bold text-[#7fbf7f]">
                      ✅ {s.quest.name}
                    </span>
                  )}
                  {s.quest && !s.quest.done && (
                    <span className="rounded-lg bg-[#1a241f] px-2 py-1 text-[11px] text-[#a8b3a5]">
                      📜 {s.quest.name} {s.quest.progress}/{s.quest.cost}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rise rise-1 card-viking p-8 text-center">
          <div className="text-5xl opacity-40">📖</div>
          <p className="mt-3 text-sm font-semibold text-[#ece6d6]">Aucune séance pour l’instant</p>
          <p className="mt-1 text-xs text-[#a8b3a5]">Les bardes attendent ton premier exploit.</p>
        </div>
      )}
    </div>
  );
}
