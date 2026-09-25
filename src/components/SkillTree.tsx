import { useState } from 'react';
import { Check, Sparkles, TreePine } from 'lucide-react';
import { useGame } from '../game/store';
import { SKILLS, BRANCHES, totalSkillPointsSpent } from '../game/skills';
import type { Skill } from '../game/skills';

function SkillCard({ skill, onUpgrade }: { skill: Skill; onUpgrade: (id: string) => void }) {
  const { state } = useGame();
  const level = state.skills[skill.id] ?? 0;
  const maxed = level >= skill.maxLevel;
  const canAfford = state.skillPoints >= skill.costPerLevel && !maxed;
  const branch = BRANCHES.find((b) => b.id === skill.branch)!;

  // preview du prochain niveau
  const nextEffect = !maxed ? skill.effect(level + 1) : null;
  const currentEffect = skill.effect(level);

  return (
    <div className={`card-viking p-4 transition ${maxed ? 'border-[#7fbf7f]/40' : ''}`}>
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ background: `${branch.color}15`, border: `1px solid ${branch.color}30` }}
        >
          {skill.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <b className="text-sm text-[#ece6d6]">{skill.name}</b>
            {maxed && <span className="rounded-full bg-[#7fbf7f]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#7fbf7f]">MAX</span>}
          </div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-[#a8b3a5]">{skill.desc}</p>

          {/* barre de niveaux */}
          <div className="mt-2 flex gap-1">
            {Array.from({ length: skill.maxLevel }).map((_, i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-full transition-colors"
                style={{
                  background: i < level
                    ? branch.color
                    : i === level && canAfford
                      ? `${branch.color}40`
                      : '#1a241f',
                  border: `1px solid ${i < level ? branch.color : '#3f5548'}`,
                }}
              />
            ))}
          </div>

          {/* effets actuels */}
          {level > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {currentEffect.pointsMult && currentEffect.pointsMult > 1 && (
                <span className="rounded-lg bg-[#f2d16b]/10 px-2 py-0.5 text-[10px] font-bold text-[#f2d16b]">
                  Points x{currentEffect.pointsMult.toFixed(2)}
                </span>
              )}
              {currentEffect.lootMult && Object.entries(currentEffect.lootMult).map(([k, v]) => (
                <span key={k} className="rounded-lg bg-[#7fbf7f]/10 px-2 py-0.5 text-[10px] font-bold text-[#7fbf7f]">
                  {k} x{v.toFixed(1)}
                </span>
              ))}
              {currentEffect.doubleLootChance && currentEffect.doubleLootChance > 0 && (
                <span className="rounded-lg bg-[#c48a4a]/10 px-2 py-0.5 text-[10px] font-bold text-[#c48a4a]">
                  Double loot {Math.round(currentEffect.doubleLootChance * 100)}%
                </span>
              )}
              {currentEffect.questMult && currentEffect.questMult > 1 && (
                <span className="rounded-lg bg-[#e8955a]/10 px-2 py-0.5 text-[10px] font-bold text-[#e8955a]">
                  Quetes x{currentEffect.questMult.toFixed(2)}
                </span>
              )}
              {currentEffect.comfortBonus && currentEffect.comfortBonus > 0 && (
                <span className="rounded-lg bg-[#7fa8c9]/10 px-2 py-0.5 text-[10px] font-bold text-[#7fa8c9]">
                  +{currentEffect.comfortBonus} confort
                </span>
              )}
              {currentEffect.zoneBonus && Object.entries(currentEffect.zoneBonus).map(([z, v]) => (
                v > 0 && <span key={z} className="rounded-lg bg-[#e05a5a]/10 px-2 py-0.5 text-[10px] font-bold text-[#e05a5a]">
                  {z} +{(v * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          )}

          {/* preview prochain niveau */}
          {!maxed && nextEffect && (
            <p className="mt-1.5 text-[10px] text-[#7d8a80]">
              Prochain : {nextEffect.pointsMult && nextEffect.pointsMult > 1 && `Points x${nextEffect.pointsMult.toFixed(2)} `}
              {nextEffect.lootMult && Object.entries(nextEffect.lootMult).map(([k, v]) => `${k} x${v.toFixed(1)} `).join('')}
              {nextEffect.doubleLootChance && nextEffect.doubleLootChance > 0 && `Double loot ${Math.round(nextEffect.doubleLootChance * 100)}% `}
              {nextEffect.questMult && nextEffect.questMult > 1 && `Quetes x${nextEffect.questMult.toFixed(2)} `}
              {nextEffect.comfortBonus && nextEffect.comfortBonus > 0 && `+${nextEffect.comfortBonus} confort `}
              {nextEffect.zoneBonus && Object.entries(nextEffect.zoneBonus).map(([z, v]) => v > 0 ? `${z} +${(v * 100).toFixed(0)}% ` : '').join('')}
            </p>
          )}
        </div>
      </div>

      {!maxed && (
        <button
          disabled={!canAfford}
          onClick={() => onUpgrade(skill.id)}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
            canAfford ? 'btn-gold' : 'btn-ghost opacity-50'
          }`}
        >
          {level === 0 ? <Sparkles size={15} /> : <Check size={15} />}
          {level === 0 ? 'Apprendre' : 'Ameliorer'} ({skill.costPerLevel} pts)
        </button>
      )}
    </div>
  );
}

export default function SkillTree() {
  const { state, upgradeSkill } = useGame();
  const [branch, setBranch] = useState<string>('all');
  const totalSpent = totalSkillPointsSpent(state.skills);
  const totalUnlocked = Object.values(state.skills).reduce((a, b) => a + b, 0);

  const filtered = branch === 'all' ? SKILLS : SKILLS.filter((s) => s.branch === branch);

  return (
    <div className="space-y-4">
      <div className="rise">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-[#f2d16b]">Arbre de competences</h1>
            <p className="text-xs text-[#a8b3a5]">1 pt par seance, 2 avec Sagesse nordique, +1 si chasse parfaite</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3f5548] bg-[#24332b]">
            <TreePine className="text-[#c48a4a]" size={22} />
          </div>
        </div>
      </div>

      {/* stats */}
      <div className="rise rise-1 grid grid-cols-3 gap-2">
        <div className="card-viking p-3 text-center">
          <Sparkles size={15} className="mx-auto text-[#f2d16b]" />
          <div className="font-display mt-1 text-lg font-bold text-[#ece6d6]">{state.skillPoints}</div>
          <div className="text-[10px] text-[#a8b3a5]">disponibles</div>
        </div>
        <div className="card-viking p-3 text-center">
          <Check size={15} className="mx-auto text-[#7fbf7f]" />
          <div className="font-display mt-1 text-lg font-bold text-[#ece6d6]">{totalUnlocked}</div>
          <div className="text-[10px] text-[#a8b3a5]">niveaux</div>
        </div>
        <div className="card-viking p-3 text-center">
          <TreePine size={15} className="mx-auto text-[#c48a4a]" />
          <div className="font-display mt-1 text-lg font-bold text-[#ece6d6]">{totalSpent}</div>
          <div className="text-[10px] text-[#a8b3a5">depenses</div>
        </div>
      </div>

      {/* filtres branches */}
      <div className="rise rise-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setBranch('all')}
          className={`chip-loc flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold ${
            branch === 'all' ? 'border-[#f2d16b] bg-[#f2d16b] text-[#221806]' : 'border-[#3f5548] bg-[#24332b] text-[#ece6d6]'
          }`}
        >
          Toutes
        </button>
        {BRANCHES.map((b) => {
          const count = SKILLS.filter((s) => s.branch === b.id).reduce((sum, s) => sum + (state.skills[s.id] ?? 0), 0);
          return (
            <button
              key={b.id}
              onClick={() => setBranch(b.id)}
              className={`chip-loc flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold ${
                branch === b.id
                  ? `text-[#221806]`
                  : 'border-[#3f5548] bg-[#24332b] text-[#ece6d6]'
              }`}
              style={branch === b.id ? { borderColor: b.color, background: b.color } : {}}
            >
              <span>{b.icon}</span> {b.name}
              {count > 0 && <span className="ml-0.5 rounded-full bg-black/20 px-1.5 py-0.5 text-[9px]">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* skills */}
      <div className="space-y-2.5">
        {filtered.map((skill, i) => (
          <div key={skill.id} className={`rise ${i < 3 ? `rise-${i + 1}` : ''}`}>
            <SkillCard skill={skill} onUpgrade={upgradeSkill} />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-[#3f5548] p-4 text-[11px] leading-relaxed text-[#7d8a80]">
        <b className="text-[#a8b3a5]">Comment gagner des points ?</b><br />
        - <b className="text-[#ece6d6]">1 point</b> par seance sportive validee.<br />
        - <b className="text-[#ece6d6]">2 points</b> si tu as le skill Sagesse nordique.<br />
        - <b className="text-[#ece6d6]">+1 point</b> bonus quand tu boucles une quete en une seule sortie (chasse parfaite).<br />
        - Les points ne sont PAS depensables pour autre chose : investis-les tous dans tes skills.
      </div>
    </div>
  );
}
