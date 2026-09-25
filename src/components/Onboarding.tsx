import { useState } from 'react';
import { Anchor, ChevronRight, HeartPulse, Shirt, Sparkles } from 'lucide-react';
import { useGame } from '../game/store';

const HAIR = [
  { c: '#3a2a1a', name: 'Brun' },
  { c: '#c8a14e', name: 'Blond' },
  { c: '#b5533c', name: 'Roux' },
  { c: '#e8e2d0', name: 'Blanc' },
];
const TUNIC = [
  { c: '#6b5a3e', name: 'Lin' },
  { c: '#4d6b4a', name: 'Mousse' },
  { c: '#6b4a4d', name: 'Baie' },
  { c: '#4a5a6b', name: 'Fjord' },
];

function VikingPreview({ hair, tunic, name }: { hair: string; tunic: string; name: string }) {
  return (
    <div className="relative mx-auto w-44">
      <svg viewBox="0 0 120 150" className="w-full drop-shadow-[0_16px_30px_rgba(0,0,0,.5)]">
        <ellipse cx="60" cy="142" rx="30" ry="6" fill="#000" opacity=".3" />
        <rect x="48" y="108" width="10" height="30" rx="3" fill="#5a4630" />
        <rect x="62" y="108" width="10" height="30" rx="3" fill="#4e3d28" />
        <rect x="40" y="66" width="40" height="46" rx="8" fill={tunic} stroke="#00000044" strokeWidth="2" />
        <line x1="40" y1="92" x2="80" y2="92" stroke="#f2d16b" strokeWidth="2" opacity=".7" />
        <circle cx="34" cy="80" r="8" fill="#e6b891" />
        <circle cx="86" cy="80" r="8" fill="#e6b891" />
        <circle cx="60" cy="42" r="21" fill="#e6b891" />
        <path d="M39,40 q21,-32 42,0 v-9 q-21,-22 -42,0 z" fill={hair} />
        <path d="M44,52 q16,14 32,0 l-3,10 q-13,8 -26,0 z" fill={hair} opacity=".9" />
        <circle cx="53" cy="42" r="2.4" fill="#222" />
        <circle cx="67" cy="42" r="2.4" fill="#222" />
        {/* casque */}
        <path d="M40,28 a20,14 0 0 1 40,0 l-3,0 a17,11 0 0 0 -34,0 z" fill="#8a8f96" stroke="#4a4e54" strokeWidth="1.5" />
        <path d="M40,26 q-12,-2 -16,-12 q10,2 18,6" fill="#e8e2d0" stroke="#999" />
        <path d="M80,26 q12,-2 16,-12 q-10,2 -18,6" fill="#e8e2d0" stroke="#999" />
      </svg>
      <div className="mt-1 text-center font-display text-lg font-bold text-[#f2d16b]">
        {name || 'Viking sans nom'}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { createCharacter } = useGame();
  const [name, setName] = useState('');
  const [age, setAge] = useState(30);
  const [hair, setHair] = useState(0);
  const [tunic, setTunic] = useState(0);

  const fcmax = 220 - (age || 30);

  const start = () => {
    createCharacter({
      name: name.trim() || 'Viking',
      age: age || 30,
      fcmax,
      hair: HAIR[hair].c,
      tunic: TUNIC[tunic].c,
    });
  };

  return (
    <div className="mx-auto w-full max-w-[520px] px-5 pb-16 pt-10">
      <div className="rise text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f2d16b]/30 bg-[#f2d16b]/10">
          <Anchor className="text-[#f2d16b]" size={26} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[.3em] text-[#7fbf7f]">Prairie · Biome 1</p>
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight text-[#f2d16b]">
          Tu t’échoues<br />sur le rivage…
        </h1>
        <p className="mx-auto mt-3 max-w-[340px] text-sm leading-relaxed text-[#a8b3a5]">
          Nu, sans rien. Chaque effort réel — course, vélo, muscu — te rapportera de quoi survivre, puis bâtir ta maison.
        </p>
      </div>

      <div className="rise rise-1 card-viking mt-6 p-5">
        <VikingPreview hair={HAIR[hair].c} tunic={TUNIC[tunic].c} name={name} />

        <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-[#a8b3a5]">
          Nom du viking
        </label>
        <input
          className="input-viking mt-1.5"
          placeholder="Ex : Ragnar, Lagertha…"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#a8b3a5]">Âge</label>
            <input
              className="input-viking mt-1.5"
              type="number" min={10} max={100}
              value={age}
              onChange={(e) => setAge(+e.target.value)}
            />
          </div>
          <div className="rounded-xl border border-[#3f5548] bg-[#1a241f] p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#a8b3a5]">
              <HeartPulse size={13} className="text-[#e08a7a]" /> FC max estimée
            </div>
            <div className="mt-1 font-display text-2xl font-bold text-[#ece6d6]">{fcmax} <span className="text-xs font-normal text-[#a8b3a5]">bpm</span></div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-[#a8b3a5]">Elle s’ajustera automatiquement si ta montre mesure plus haut.</p>

        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#a8b3a5]">
          <Sparkles size={13} /> Cheveux & barbe
        </div>
        <div className="mt-2 flex gap-2">
          {HAIR.map((h, i) => (
            <button
              key={h.c}
              title={h.name}
              onClick={() => setHair(i)}
              className={`h-11 flex-1 rounded-xl border-2 transition ${i === hair ? 'border-[#f2d16b] scale-[1.03]' : 'border-transparent opacity-70 hover:opacity-100'}`}
              style={{ background: h.c }}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#a8b3a5]">
          <Shirt size={13} /> Tunique
        </div>
        <div className="mt-2 flex gap-2">
          {TUNIC.map((t, i) => (
            <button
              key={t.c}
              title={t.name}
              onClick={() => setTunic(i)}
              className={`h-11 flex-1 rounded-xl border-2 transition ${i === tunic ? 'border-[#f2d16b] scale-[1.03]' : 'border-transparent opacity-70 hover:opacity-100'}`}
              style={{ background: t.c }}
            />
          ))}
        </div>

        <button onClick={start} className="btn-gold mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold">
          Commencer l’aventure <ChevronRight size={18} />
        </button>
      </div>

      <div className="rise rise-2 mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ['🔥', 'Sport = butin'],
          ['🛖', 'Butin = maison'],
          ['📜', 'Quêtes épiques'],
        ].map(([e, t]) => (
          <div key={t} className="rounded-xl border border-[#3f5548]/60 bg-[#24332b]/60 px-2 py-3 text-[11px] font-semibold text-[#a8b3a5]">
            <div className="text-xl">{e}</div>{t}
          </div>
        ))}
      </div>
    </div>
  );
}
