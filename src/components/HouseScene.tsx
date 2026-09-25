import { useGame } from '../game/store';

export default function HouseScene() {
  const { state } = useGame();
  const has = (id: string) => state.built.includes(id);
  const ch = state.character!;
  const tenue = state.crafted.includes('tenue');
  const comfortCount = state.built.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#3f5548] shadow-[0_20px_60px_-20px_rgba(0,0,0,.7)]">
      <svg className="block w-full" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ta maison viking">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d3348" />
            <stop offset=".55" stopColor="#3d6070" />
            <stop offset="1" stopColor="#9db8ad" />
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4d7a86" />
            <stop offset="1" stopColor="#33565f" />
          </linearGradient>
          <radialGradient id="sunGlow" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#f2d16b" stopOpacity=".9" />
            <stop offset="1" stopColor="#f2d16b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ciel */}
        <rect width="400" height="250" fill="url(#sky)" />
        <circle cx="336" cy="46" r="34" fill="url(#sunGlow)" />
        <circle cx="336" cy="46" r="15" fill="#f2d16b" opacity=".95" />

        {/* nuages */}
        <g fill="#ffffff" opacity=".28" className="floaty">
          <ellipse cx="110" cy="44" rx="30" ry="8" />
          <ellipse cx="135" cy="38" rx="22" ry="7" />
        </g>
        <g fill="#ffffff" opacity=".18">
          <ellipse cx="250" cy="70" rx="26" ry="6" />
        </g>

        {/* montagnes lointaines */}
        <polygon points="0,150 60,95 120,150" fill="#5a7484" opacity=".7" />
        <polygon points="60,95 75,112 66,115 60,110 52,116 45,111" fill="#e8eef0" opacity=".9" />
        <polygon points="90,150 150,105 215,150" fill="#4d6779" opacity=".7" />
        <polygon points="150,105 163,120 155,123 150,119 143,124 137,119" fill="#e8eef0" opacity=".85" />

        {/* mer */}
        <rect y="148" width="400" height="26" fill="url(#sea)" opacity=".9" />
        <g stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.5" strokeLinecap="round">
          <line x1="20" y1="158" x2="52" y2="158" />
          <line x1="70" y1="165" x2="110" y2="165" />
          <line x1="300" y1="160" x2="340" y2="160" />
          <line x1="240" y1="167" x2="270" y2="167" />
        </g>

        {/* drakkar au loin */}
        <g transform="translate(52,156)" opacity=".9">
          <path d="M-22,6 Q0,12 22,6 L17,10 Q0,15 -17,10 Z" fill="#5a3a22" />
          <rect x="-1.5" y="-14" width="3" height="20" fill="#3a2a1a" />
          <rect x="-11" y="-14" width="20" height="13" rx="1" fill="#b33a3a" />
          <line x1="-11" y1="-7.5" x2="9" y2="-7.5" stroke="#e8dcc0" strokeWidth="1.5" />
          <path d="M-22,6 q-4,-6 -1,-9 q0,5 4,7" fill="#5a3a22" />
        </g>

        {/* prairie */}
        <ellipse cx="70" cy="200" rx="150" ry="52" fill="#4b6b3a" />
        <ellipse cx="330" cy="212" rx="160" ry="50" fill="#557a42" />
        <rect y="196" width="400" height="54" fill="#5e8447" />
        <ellipse cx="200" cy="196" rx="220" ry="18" fill="#6b9350" opacity=".7" />

        {/* fleurs */}
        <g>
          {[[40, 224], [120, 234], [200, 228], [280, 236], [350, 226], [90, 242], [250, 244]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              <line x1="0" y1="0" x2="0" y2="-6" stroke="#3d5a2e" strokeWidth="1.5" />
              <circle cx="0" cy="-7" r="2.4" fill={i % 2 ? '#e8e2d0' : '#f2d16b'} />
            </g>
          ))}
        </g>

        {/* arbres */}
        <g>
          <polygon points="22,196 38,142 54,196" fill="#2e4a2a" />
          <polygon points="28,176 38,150 48,176" fill="#3d5f36" />
          <rect x="35.5" y="196" width="5" height="13" fill="#3a2a1a" />
          <polygon points="352,200 370,140 388,200" fill="#2e4a2a" />
          <polygon points="359,180 370,152 381,180" fill="#3d5f36" />
          <rect x="367.5" y="200" width="5" height="13" fill="#3a2a1a" />
        </g>

        {/* maison */}
        {has('abri') ? (
          <g>
            {/* ombre */}
            <ellipse cx="205" cy="222" rx="78" ry="9" fill="#000000" opacity=".25" />
            <rect x="140" y="142" width="130" height="76" fill="#a8763f" stroke="#6b4a26" strokeWidth="2" rx="2" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1="140" y1={154 + i * 12} x2="270" y2={154 + i * 12} stroke="#8a5f30" strokeWidth="1.5" opacity=".8" />
            ))}
            {/* porte */}
            <rect x="236" y="172" width="22" height="46" fill="#3a2a1a" rx="2" />
            <circle cx="254" cy="196" r="1.8" fill="#f2d16b" />
            {/* fenêtre chaude */}
            <rect x="150" y="184" width="40" height="24" fill="#2c1f10" stroke="#6b4a26" strokeWidth="2" />
            <rect x="153" y="187" width="34" height="18" fill="#f6c453" opacity=".9" />
            <line x1="170" y1="187" x2="170" y2="205" stroke="#6b4a26" strokeWidth="2" />
            <line x1="153" y1="196" x2="187" y2="196" stroke="#6b4a26" strokeWidth="2" />
            {/* lit visible */}
            <rect x="150" y="178" width="40" height="8" fill="#e8dcc0" opacity=".95" />
            {/* toit */}
            <polygon
              points={`130,144 205,${has('toit') ? 88 : 108} 280,144`}
              fill={has('toit') ? '#7a4030' : '#8a6a3a'}
              stroke="#4a2a1a" strokeWidth="2.5" strokeLinejoin="round"
            />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const x = 148 + i * 18;
              const topY = has('toit') ? 88 : 108;
              return <line key={i} x1={x} y1={144} x2={205} y2={topY + 4} stroke="#00000022" strokeWidth="2" />;
            })}
            {/* cheminée + fumée */}
            {has('toit') && (
              <g>
                <rect x="228" y="96" width="14" height="26" fill="#6a6a62" stroke="#4a4a44" strokeWidth="1.5" />
                <circle cx="235" cy="90" r="4" fill="#cfd4d6" className="smoke" style={{ animationDelay: '0s' }} />
                <circle cx="235" cy="90" r="5" fill="#cfd4d6" className="smoke" style={{ animationDelay: '1.1s' }} />
                <circle cx="235" cy="90" r="6" fill="#cfd4d6" className="smoke" style={{ animationDelay: '2.2s' }} />
              </g>
            )}
            {/* bannière */}
            {has('toit') && (
              <g>
                <rect x="150" y="76" width="4" height="46" fill="#3a2a1a" />
                <polygon points="154,78 196,87 154,97" fill="#b33a3a" className="flag-wave" />
                <circle cx="164" cy="87.5" r="4" fill="#f2d16b" />
              </g>
            )}
            {/* tapis */}
            {has('tapis') && <ellipse cx="215" cy="212" rx="22" ry="6" fill="#b58a5a" stroke="#8a5f30" strokeWidth="1.5" />}
            {/* table */}
            {has('table') && (
              <g>
                <rect x="196" y="184" width="30" height="4" rx="1" fill="#6b4a26" />
                <rect x="199" y="188" width="3" height="14" fill="#6b4a26" />
                <rect x="220" y="188" width="3" height="14" fill="#6b4a26" />
                <ellipse cx="211" cy="183" rx="6" ry="2" fill="#c9b27a" />
              </g>
            )}
          </g>
        ) : (
          <g opacity=".85">
            {/* emplacement vide : piquets + fondations */}
            <ellipse cx="205" cy="220" rx="70" ry="8" fill="#000000" opacity=".2" />
            <rect x="150" y="196" width="110" height="10" fill="#8a8a80" opacity=".6" rx="2" />
            {[155, 205, 255].map((x) => (
              <g key={x}>
                <rect x={x} y={176} width="6" height={24} fill="#6b4a26" />
                <polygon points={`${x},176 ${x + 3},168 ${x + 6},176`} fill="#8a5f30" />
              </g>
            ))}
          </g>
        )}

        {/* feu */}
        {has('feu') ? (
          <g transform="translate(325,228)">
            <ellipse cx="0" cy="0" rx="20" ry="6" fill="#4a4a44" />
            <ellipse cx="0" cy="-1" rx="14" ry="4" fill="#33332e" />
            <rect x="-12" y="-4" width="24" height="4" rx="2" fill="#5a3a22" transform="rotate(8)" />
            <rect x="-12" y="-4" width="24" height="4" rx="2" fill="#4a2e1a" transform="rotate(-10)" />
            <polygon className="flame" points="-8,-3 0,-26 8,-3" fill="#f2a33a" />
            <polygon className="flame-inner" points="-4.5,-3 0,-17 4.5,-3" fill="#f8d76b" />
            <circle cx="0" cy="-34" r="3" fill="#cfd4d6" className="smoke" style={{ animationDelay: '.6s' }} />
          </g>
        ) : (
          <g transform="translate(325,228)" opacity=".55">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#6a6a5a" />
            <circle cx="-6" cy="-1" r="2.5" fill="#8a8a80" />
            <circle cx="5" cy="0" r="2" fill="#8a8a80" />
          </g>
        )}

        {/* personnage */}
        <g transform="translate(92,208)">
          <ellipse cx="0" cy="22" rx="12" ry="3" fill="#000" opacity=".25" />
          <rect x="-6" y="8" width="5" height="14" rx="1.5" fill="#5a4630" />
          <rect x="1" y="8" width="5" height="14" rx="1.5" fill="#4e3d28" />
          <rect x="-7" y="-14" width="14" height="23" rx="4" fill={tenue ? '#8a5a2b' : ch.tunic} stroke="#00000033" />
          {tenue && <line x1="-7" y1="0" x2="7" y2="0" stroke="#f2d16b" strokeWidth="1.5" />}
          <circle cx="-9" cy="-4" r="3.2" fill="#e6b891" />
          <circle cx="9" cy="-4" r="3.2" fill="#e6b891" />
          <circle cx="0" cy="-22" r="8.5" fill="#e6b891" />
          <path d="M-8.5,-23 q8.5,-13 17,0 v-4 q-8.5,-9 -17,0 z" fill={ch.hair} />
          <circle cx="-3" cy="-22" r="1.1" fill="#222" />
          <circle cx="3" cy="-22" r="1.1" fill="#222" />
          <path d="M-2.5,-18.5 q2.5,1.8 5,0" stroke="#8a5a3a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* hache */}
          <g transform="translate(12,2) rotate(12)">
            <rect x="-1" y="-14" width="2.5" height="20" fill="#6b4a26" />
            <path d="M1.5,-14 h9 a5,6 0 0 1 -9,6 z" fill="#9aa4ad" stroke="#5a626a" strokeWidth="1" />
          </g>
        </g>

        {/* corbeaux si toit */}
        {has('toit') && (
          <g stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" className="floaty">
            <path d="M120,80 q5,-5 10,0 q5,-5 10,0" />
            <path d="M150,66 q4,-4 8,0 q4,-4 8,0" />
          </g>
        )}
      </svg>

      {/* overlay progression */}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-[#f2d16b] backdrop-blur">
        <span>🏠</span> Confort {comfortCount}/5
      </div>
      {!has('abri') && (
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/55 px-3 py-2 text-center text-xs text-[#ece6d6] backdrop-blur">
          Ton terrain t’attend. Construis le <b className="text-[#f2d16b]">Feu de camp</b> puis ton <b className="text-[#f2d16b]">Abri</b>.
        </div>
      )}
      {has('toit') && (
        <div className="absolute right-3 top-3 rounded-full bg-[#f2d16b] px-3 py-1.5 text-[11px] font-bold text-[#221806] shadow-lg">
          ⚔️ Maison achevée
        </div>
      )}
    </div>
  );
}
