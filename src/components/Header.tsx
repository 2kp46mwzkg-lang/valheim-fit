import { Flame, Home } from 'lucide-react';
import { useGame } from '../game/store';

export default function Header() {
  const { state, comfort } = useGame();
  const c = state.character!;

  return (
    <header className="sticky top-0 z-20 border-b border-[#3f5548]/60 bg-[#141b17]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[520px] items-center gap-3 px-4 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#f2d16b]/50 font-display text-lg font-bold"
          style={{ background: `linear-gradient(135deg, ${c.tunic}, #1c2620)` }}
        >
          {c.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[15px] font-bold text-[#ece6d6]">{c.name}</div>
          <div className="flex items-center gap-2 text-[11px] text-[#a8b3a5]">
            <span className="flex items-center gap-1"><Home size={11} /> Confort {comfort}/5</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[#f2d16b]"><Flame size={11} /> {state.totalPoints} pts</span>
          </div>
        </div>
        {state.buff && (
          <div className="pop rounded-full border border-[#f2d16b]/40 bg-[#f2d16b]/10 px-2.5 py-1 text-[11px] font-bold text-[#f2d16b]">
            🍲 ×{state.buff.mult}
          </div>
        )}
      </div>
      {/* comfort pips */}
      <div className="mx-auto flex w-full max-w-[520px] gap-1 px-4 pb-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i < comfort ? 'bg-gradient-to-r from-[#f2d16b] to-[#d9a93c]' : 'bg-[#2f4237]'}`}
          />
        ))}
      </div>
    </header>
  );
}
