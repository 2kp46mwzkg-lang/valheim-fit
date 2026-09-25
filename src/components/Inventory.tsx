import { useState } from 'react';
import { Backpack, UtensilsCrossed } from 'lucide-react';
import { useGame } from '../game/store';
import { ITEMS } from '../game/loot';
import Modal from './Modal';

export default function Inventory() {
  const { state, eatMeal } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const entries = Object.entries(state.inventory).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const canEat = (state.inventory.repas ?? 0) > 0 && !state.buff;

  return (
    <div className="space-y-4">
      <div className="rise flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-[#f2d16b]">🎒 Sac</h1>
          <p className="text-xs text-[#a8b3a5]">{total} objet{total > 1 ? 's' : ''} · {entries.length} type{entries.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3f5548] bg-[#24332b]">
          <Backpack className="text-[#c48a4a]" size={22} />
        </div>
      </div>

      {state.buff && (
        <div className="rise rise-1 pop flex items-center gap-3 rounded-2xl border border-[#f2d16b]/40 bg-[#f2d16b]/10 p-4">
          <div className="text-3xl">🍲</div>
          <div>
            <div className="text-sm font-bold text-[#f2d16b]">{state.buff.label} actif</div>
            <div className="text-xs text-[#a8b3a5]">×{state.buff.mult} sur les points de ta prochaine séance.</div>
          </div>
        </div>
      )}

      {entries.length ? (
        <div className="rise rise-1 grid grid-cols-3 gap-2.5">
          {entries.map(([k, v], i) => (
            <button
              key={k}
              onClick={() => setSelected(k)}
              className="card-viking rise p-3 text-center transition hover:border-[#f2d16b]/50 hover:bg-[#2a3c33]"
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
            >
              <div className="text-3xl">{ITEMS[k]?.icon ?? '❔'}</div>
              <div className="mt-1 font-display text-lg font-bold text-[#ece6d6]">{v}</div>
              <div className="truncate text-[10px] font-semibold text-[#a8b3a5]">{ITEMS[k]?.name ?? k}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rise rise-1 card-viking p-8 text-center">
          <div className="text-5xl opacity-40">🎒</div>
          <p className="mt-3 text-sm font-semibold text-[#ece6d6]">Ton sac est vide</p>
          <p className="mt-1 text-xs text-[#a8b3a5]">Va faire du sport, puis reviens au campement via l’onglet Retour.</p>
        </div>
      )}

      {canEat && (
        <button onClick={eatMeal} className="btn-gold rise rise-2 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-bold">
          <UtensilsCrossed size={17} /> Manger un Repas du chasseur ({state.inventory.repas})
        </button>
      )}
      {(state.inventory.repas ?? 0) > 0 && state.buff && (
        <p className="text-center text-[11px] text-[#7d8a80]">Un repas est déjà actif. Il s’appliquera à ta prochaine sortie.</p>
      )}

      <div className="rise rise-3 rounded-2xl border border-dashed border-[#3f5548] p-4 text-[11px] leading-relaxed text-[#7d8a80]">
        💡 <b className="text-[#a8b3a5]">D’où vient le butin ?</b> Chaque séance rapporte bois, fibres, pierre… proportionnellement à ton effort.
        Les <b className="text-[#a8b3a5]">peaux de cerf</b> et <b className="text-[#a8b3a5]">plumes</b> ne s’obtiennent qu’en quêtes.
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <div className="text-center">
            <div className="text-6xl">{ITEMS[selected]?.icon}</div>
            <h3 className="font-display mt-2 text-lg font-bold text-[#f2d16b]">{ITEMS[selected]?.name}</h3>
            <p className="font-display text-3xl font-bold text-[#ece6d6]">×{state.inventory[selected]}</p>
            <p className="mt-2 text-sm text-[#a8b3a5]">{ITEMS[selected]?.desc}</p>
            {selected === 'repas' && canEat && (
              <button onClick={() => { eatMeal(); setSelected(null); }} className="btn-gold mt-4 w-full rounded-xl px-4 py-3 font-bold">
                Manger maintenant (×1.2)
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
