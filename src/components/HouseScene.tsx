import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/store';
import { CAMP_SPOTS, WALK_MS, type CampLoc } from './camp';

export default function HouseScene({ loc, onSelect }: { loc: CampLoc; onSelect: (l: CampLoc) => void }) {
  const { state } = useGame();
  const has = (id: string) => state.built.includes(id);
  const ch = state.character!;
  const tenue = state.crafted.includes('tenue');
  const comfortCount = state.built.length;

  const target = CAMP_SPOTS.find((s) => s.id === loc)!;
  const [x, setX] = useState(CAMP_SPOTS[0].x);
  const [facing, setFacing] = useState(1);
  const [walking, setWalking] = useState(false);
  const xRef = useRef(x);

  useEffect(() => {
    const tx = target.x;
    setFacing(tx >= xRef.current ? 1 : -1);
    if (tx !== xRef.current) {
      setWalking(true);
      const t = setTimeout(() => setWalking(false), WALK_MS);
      xRef.current = tx;
      setX(tx);
      return () => clearTimeout(t);
    }
  }, [target.x]);

  const locked = (s: (typeof CAMP_SPOTS)[number]) => (s.requires ?? []).some((r) => !has(r));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#3f5548] shadow-[0_20px_60px_-20px_rgba(0,0,0,.7)]">
      <svg className="block w-full select-none" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ton camp viking">
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

        {/* sentier */}
        <path d="M40,232 Q110,214 162,222 T330,230" stroke="#b39a6b" strokeWidth="9" strokeLinecap="round" opacity=".35" fill="none" strokeDasharray="2 12" />

        {/* fleurs */}
        <g>
          {[[40, 224], [200, 228], [280, 236], [350, 226], [250, 244]].map(([px, py], i) => (
            <g key={i} transform={`translate(${px},${py})`}>
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

        {/* poteau d'amarrage (rivage) */}
        <g transform="translate(34,210)">
          <ellipse cx="0" cy="14" rx="9" ry="3" fill="#000" opacity=".2" />
          <rect x="-2.5" y="-14" width="5" height="28" rx="2" fill="#6b4a26" />
          <circle cx="0" cy="-15" r="3.4" fill="#8a5f30" />
          <ellipse cx="6" cy="6" rx="5" ry="3" fill="none" stroke="#c9b27a" strokeWidth="2" />
        </g>

        {/* pierre runique */}
        <g transform="translate(112,0)">
          <ellipse cx="0" cy="218" rx="17" ry="5" fill="#000" opacity=".22" />
          <path d="M-12,216 L-10,178 Q-9,162 0,160 Q9,162 10,178 L12,216 Z" fill="#7c838c" stroke="#565c64" strokeWidth="2" />
          <path d="M-12,216 L-10,178 Q-9,162 0,160 Q3,170 2,216 Z" fill="#565c64" opacity=".45" />
          <g stroke="#f2d16b" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".85">
            <path d="M-4,176 v16 M-4,176 l4,4 M-4,184 l4,-4" />
            <path d="M4,176 v16 M4,176 l-4,5 M4,186 l-4,-4" />
            <path d="M-3,200 l3,4 l3,-4" />
          </g>
          <ellipse cx="-4" cy="210" rx="4" ry="2" fill="#6a7178" />
        </g>

        {/* établi / souche */}
        {has('abri') ? (
          <g transform="translate(162,0)">
            <ellipse cx="0" cy="222" rx="20" ry="4" fill="#000" opacity=".22" />
            <rect x="-20" y="196" width="40" height="6" rx="2" fill="#8a5f30" stroke="#5a3a1c" strokeWidth="1.5" />
            <line x1="-14" y1="202" x2="-18" y2="220" stroke="#5a3a1c" strokeWidth="4" strokeLinecap="round" />
            <line x1="14" y1="202" x2="18" y2="220" stroke="#5a3a1c" strokeWidth="4" strokeLinecap="round" />
            <line x1="0" y1="202" x2="0" y2="219" stroke="#6b4a26" strokeWidth="3" />
            {/* marteau posé */}
            <g transform="translate(10,192) rotate(20)">
              <rect x="-1.5" y="-8" width="3" height="14" rx="1" fill="#6b4a26" />
              <rect x="-6" y="-11" width="12" height="6" rx="1.5" fill="#9aa4ad" stroke="#5a626a" strokeWidth="1" />
            </g>
            {/* petit tas de copeaux */}
            <circle cx="-12" cy="221" r="1.6" fill="#d9b87e" />
            <circle cx="-8" cy="223" r="1.3" fill="#d9b87e" />
            <circle cx="14" cy="222" r="1.4" fill="#d9b87e" />
          </g>
        ) : (
          <g transform="translate(162,0)" opacity=".55">
            <ellipse cx="0" cy="220" rx="12" ry="3.5" fill="#000" opacity=".2" />
            <rect x="-7" y="206" width="14" height="14" fill="#7a5430" />
            <ellipse cx="0" cy="206" rx="7" ry="3.5" fill="#a97a44" />
            <ellipse cx="0" cy="206" rx="3.5" ry="1.8" fill="none" stroke="#7a5430" strokeWidth="1" />
          </g>
        )}

        {/* maison */}
        {has('abri') ? (
          <g>
            <ellipse cx="205" cy="222" rx="78" ry="9" fill="#000000" opacity=".25" />
            <rect x="140" y="142" width="130" height="76" fill="#a8763f" stroke="#6b4a26" strokeWidth="2" rx="2" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1="140" y1={154 + i * 12} x2="270" y2={154 + i * 12} stroke="#8a5f30" strokeWidth="1.5" opacity=".8" />
            ))}
            <rect x="236" y="172" width="22" height="46" fill="#3a2a1a" rx="2" />
            <circle cx="254" cy="196" r="1.8" fill="#f2d16b" />
            <rect x="150" y="184" width="40" height="24" fill="#2c1f10" stroke="#6b4a26" strokeWidth="2" />
            <rect x="153" y="187" width="34" height="18" fill="#f6c453" opacity=".9" />
            <line x1="170" y1="187" x2="170" y2="205" stroke="#6b4a26" strokeWidth="2" />
            <line x1="153" y1="196" x2="187" y2="196" stroke="#6b4a26" strokeWidth="2" />
            <rect x="150" y="178" width="40" height="8" fill="#e8dcc0" opacity=".95" />
            <polygon
              points={`130,144 205,${has('toit') ? 88 : 108} 280,144`}
              fill={has('toit') ? '#7a4030' : '#8a6a3a'}
              stroke="#4a2a1a" strokeWidth="2.5" strokeLinejoin="round"
            />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const lx = 148 + i * 18;
              const topY = has('toit') ? 88 : 108;
              return <line key={i} x1={lx} y1="144" x2="205" y2={topY + 4} stroke="#00000022" strokeWidth="2" />;
            })}
            {has('toit') && (
              <g>
                <rect x="228" y="96" width="14" height="26" fill="#6a6a62" stroke="#4a4a44" strokeWidth="1.5" />
                <circle cx="235" cy="90" r="4" fill="#cfd4d6" className="smoke" style={{ animationDelay: '0s' }} />
                <circle cx="235" cy="90" r="5" fill="#cfd4d6" className="smoke" style={{ animationDelay: '1.1s' }} />
                <circle cx="235" cy="90" r="6" fill="#cfd4d6" className="smoke" style={{ animationDelay: '2.2s' }} />
              </g>
            )}
            {has('toit') && (
              <g>
                <rect x="150" y="76" width="4" height="46" fill="#3a2a1a" />
                <polygon points="154,78 196,87 154,97" fill="#b33a3a" className="flag-wave" />
                <circle cx="164" cy="87.5" r="4" fill="#f2d16b" />
              </g>
            )}
            {has('tapis') && <ellipse cx="215" cy="212" rx="22" ry="6" fill="#b58a5a" stroke="#8a5f30" strokeWidth="1.5" />}
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
            <ellipse cx="205" cy="220" rx="70" ry="8" fill="#000000" opacity=".2" />
            <rect x="150" y="196" width="110" height="10" fill="#8a8a80" opacity=".6" rx="2" />
            {[155, 205, 255].map((px) => (
              <g key={px}>
                <rect x={px} y="176" width="6" height={24} fill="#6b4a26" />
                <polygon points={`${px},176 ${px + 3},168 ${px + 6},176`} fill="#8a5f30" />
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
            <ellipse cx="0" cy="6" rx="30" ry="9" fill="#f2a33a" opacity=".08" />
          </g>
        ) : (
          <g transform="translate(325,228)" opacity=".55">
            <ellipse cx="0" cy="0" rx="14" ry="5" fill="#6a6a5a" />
            <circle cx="-6" cy="-1" r="2.5" fill="#8a8a80" />
            <circle cx="5" cy="0" r="2" fill="#8a8a80" />
          </g>
        )

        }

        {/* corbeaux */}
        {has('toit') && (
          <g stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" className="floaty">
            <path d="M120,80 q5,-5 10,0 q5,-5 10,0" />
            <path d="M150,66 q4,-4 8,0 q4,-4 8,0" />
          </g>
        )}

        {/* ---- personnage (marche) ---- */}
        <g
          className={walking ? 'walking' : 'idle'}
          style={{ transition: `transform ${WALK_MS}ms cubic-bezier(.35,.1,.3,1)` }}
          transform={`translate(${x},208) scale(${facing},1)`}
        >
          {/* poussière de marche */}
          <ellipse className="dust" cx="-7" cy="22" rx="4" ry="1.8" fill="#d8d2bf" style={{ ['--dx' as string]: '-8px', animationDelay: '0s' }} />
          <ellipse className="dust" cx="-9" cy="22" rx="3" ry="1.4" fill="#d8d2bf" style={{ ['--dx' as string]: '-12px', animationDelay: '.35s' }} />
          <ellipse cx="0" cy="22" rx="12" ry="3" fill="#000" opacity=".25" />
          <g className="viking-body">
            <g className="leg-a" style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
              <rect x="-6" y="8" width="5" height="14" rx="1.5" fill="#5a4630" />
            </g>
            <g className="leg-b" style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
              <rect x="1" y="8" width="5" height="14" rx="1.5" fill="#4e3d28" />
            </g>
            <rect x="-7" y="-14" width="14" height="23" rx="4" fill={tenue ? '#8a5a2b' : ch.tunic} stroke="#00000033" />
            {tenue && <line x1="-7" y1="0" x2="7" y2="0" stroke="#f2d16b" strokeWidth="1.5" />}
            <g className="arm-b" style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
              <circle cx="-9" cy="-4" r="3.2" fill="#e6b891" />
            </g>
            <g className="arm-a" style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
              <circle cx="9" cy="-4" r="3.2" fill="#e6b891" />
            </g>
            <circle cx="0" cy="-22" r="8.5" fill="#e6b891" />
            <path d="M-8.5,-23 q8.5,-13 17,0 v-4 q-8.5,-9 -17,0 z" fill={ch.hair} />
            <circle cx="-3" cy="-22" r="1.1" fill="#222" />
            <circle cx="3" cy="-22" r="1.1" fill="#222" />
            <path d="M-2.5,-18.5 q2.5,1.8 5,0" stroke="#8a5a3a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* hache */}
            <g transform="translate(12,2)">
              <rect x="-1" y="-14" width="2.5" height="20" fill="#6b4a26" />
              <path d="M1.5,-14 h9 a5,6 0 0 1 -9,6 z" fill="#9aa4ad" stroke="#5a626a" strokeWidth="1" />
            </g>
          </g>
        </g>

        {/* ---- marqueurs de lieux ---- */}
        {CAMP_SPOTS.map((s) => {
          const isLocked = locked(s);
          const active = s.id === loc;
          return (
            <g key={s.id} className="spot-wrap" onClick={() => onSelect(s.id)} role="button" aria-label={s.label}>
              <circle className="spot-hit" cx={s.x} cy={s.markerY} r="22" fill="transparent" />
              <g className="spot-marker" style={{ opacity: active ? 0 : 1, transition: 'opacity .25s' }}>
                {!isLocked && <circle className="spot-pulse" cx={s.x} cy={s.markerY} r="11" fill="#f2d16b" opacity=".4" />}
                <circle
                  cx={s.x} cy={s.markerY} r="12.5"
                  fill={isLocked ? '#2f4237' : '#f2d16b'}
                  stroke={isLocked ? '#5a6a60' : '#d9a93c'}
                  strokeWidth="1.5"
                  style={{ filter: isLocked ? 'none' : 'drop-shadow(0 3px 6px rgba(0,0,0,.4))' }}
                />
                <text
                  x={s.x} y={s.markerY + (s.icon.length > 1 ? 0 : 1)}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={isLocked ? 10 : 12}
                >{isLocked ? '🔒' : s.icon}</text>
              </g>
              {active && (
                <g>
                  <circle cx={s.x} cy={s.markerY} r="13" fill="#141b17" stroke="#f2d16b" strokeWidth="2" />
                  <text x={s.x} y={s.markerY + 1} textAnchor="middle" dominantBaseline="central" fontSize="12">{isLocked ? '🔒' : s.icon}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* overlay confort */}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-[#f2d16b] backdrop-blur">
        <span>🏠</span> Confort {comfortCount}/5
      </div>
      {has('toit') && (
        <div className="absolute right-3 top-3 rounded-full bg-[#f2d16b] px-3 py-1.5 text-[11px] font-bold text-[#221806] shadow-lg">
          ⚔️ Camp achevé
        </div>
      )}

      {/* lieu courant */}
      <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/60 px-3 py-2 text-center backdrop-blur">
        <span className="text-xs font-bold text-[#f2d16b]">{target.icon} {target.label}</span>
        <span className="ml-1.5 hidden text-[11px] text-[#ece6d6]/80 sm:inline">— {target.desc}</span>
      </div>
    </div>
  );
}
