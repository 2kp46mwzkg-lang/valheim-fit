import { useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import { GameProvider, useGame } from './game/store';
import { QUESTS } from './game/recipes';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import BottomNav, { type TabId } from './components/BottomNav';
import House from './components/House';
import Inventory from './components/Inventory';
import Upload from './components/Upload';
import SkillTree from './components/SkillTree';
import Journal from './components/Journal';

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#f2d16b]/30 bg-[#f2d16b]/10">
        <Flame className="animate-pulse text-[#f2d16b]" size={30} />
      </div>
      <div className="font-display text-xl font-bold text-[#f2d16b]">Valheim Fit</div>
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#2f4237]">
        <div className="h-full w-1/2 animate-[shine_1.2s_linear_infinite] rounded-full bg-[#f2d16b]" />
      </div>
      <p className="text-xs text-[#7d8a80]">Les corbeaux apportent ta sauvegarde…</p>
    </div>
  );
}

function Shell() {
  const { state, loaded } = useGame();
  const [tab, setTab] = useState<TabId>('house');
  const [arrivalToken, setArrivalToken] = useState(0);

  const questBadge = useMemo(() => {
    if (!state.character) return 0;
    // quêtes presque terminées (≥70 %) → rappel
    return QUESTS.filter((q) => {
      if (state.totalPoints < q.unlockAt) return false;
      const p = state.quests[q.id]?.progress ?? 0;
      return p >= q.cost * 0.7 && p < q.cost;
    }).length;
  }, [state]);

  if (!loaded) return <Splash />;
  if (!state.character) {
    return (
      <div className="ambient-bg rune-pattern min-h-screen">
        <Onboarding />
      </div>
    );
  }

  return (
    <div className="ambient-bg min-h-screen">
      {/* décors desktop */}
      <div className="pointer-events-none fixed inset-0 hidden overflow-hidden lg:block" aria-hidden>
        <div className="rune-pattern absolute inset-0 opacity-60" />
        <div className="absolute -left-24 top-1/4 h-96 w-96 rounded-full bg-[#7fbf7f]/10 blur-3xl" />
        <div className="absolute -right-24 top-1/2 h-96 w-96 rounded-full bg-[#f2d16b]/10 blur-3xl" />
        <div className="absolute left-[max(2rem,calc(50%-560px))] top-24 max-w-[300px]">
          <p className="text-[11px] font-bold uppercase tracking-[.3em] text-[#7fbf7f]">Valheim Fit</p>
          <h2 className="font-display mt-2 text-4xl font-bold leading-tight text-[#ece6d6]">
            Ton effort<br />bâtit ta<br /><span className="text-[#f2d16b]">maison viking.</span>
          </h2>
          <ul className="mt-6 space-y-3 text-sm text-[#a8b3a5]">
            <li className="flex gap-2.5"><span>⌚</span> Importe tes séances Garmin (.fit / .zip)</li>
            <li className="flex gap-2.5"><span>🪵</span> Chaque minute d’effort = du butin</li>
            <li className="flex gap-2.5"><span>🛖</span> Construis, décore, augmente ton confort</li>
            <li className="flex gap-2.5"><span>📜</span> Boucle des quêtes pour les ressources rares</li>
          </ul>
          <div className="mt-6 rounded-2xl border border-[#3f5548] bg-[#24332b]/70 p-4 text-xs leading-relaxed text-[#7d8a80]">
            📱 <b className="text-[#a8b3a5]">Sur iPhone :</b> ouvre cette page dans Safari → Partager → « Sur l’écran d’accueil » pour en faire une vraie appli.
          </div>
        </div>
        <div className="absolute right-[max(2rem,calc(50%-560px))] top-24 hidden w-[280px] xl:block">
          <div className="rounded-2xl border border-[#3f5548] bg-[#24332b]/70 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[.25em] text-[#f2d16b]">Comment ça marche</p>
            <ol className="mt-3 space-y-3 text-xs leading-relaxed text-[#a8b3a5]">
              <li><b className="text-[#ece6d6]">1. Fais du sport</b><br />Course, vélo, muscu, badminton… avec ou sans montre.</li>
              <li><b className="text-[#ece6d6]">2. Reviens au campement</b><br />Onglet Retour : fichier FIT ou saisie manuelle + intensité.</li>
              <li><b className="text-[#ece6d6]">3. Récolte</b><br />Points selon tes zones cardiaques, butin proportionnel.</li>
              <li><b className="text-[#ece6d6]">4. Bâtis</b><br />Feu → abri → déco → toit. Confort = plus de butin.</li>
            </ol>
          </div>
          <div className="mt-3 rounded-2xl border border-[#3f5548] bg-[#24332b]/70 p-4 text-[11px] leading-relaxed text-[#7d8a80]">
            1 point = 1 minute en Z2. Z5 rapporte ×2,5. Le Repas du chasseur ajoute ×1,2.
          </div>
        </div>
      </div>

      <div className="relative mx-auto min-h-screen w-full max-w-[520px] bg-[#141b17] shadow-[0_0_80px_-20px_rgba(0,0,0,.9)] lg:border-x lg:border-[#3f5548]/60">
        <Header />
        <main className="px-4 pb-32 pt-4">
          <div className={tab === 'house' ? '' : 'hidden'}>
            <House
              onGoUpload={() => setTab('upload')}
              onGoQuests={() => setTab('skills')}
              arrivalToken={arrivalToken}
            />
          </div>
          <div className={tab === 'inventory' ? '' : 'hidden'}><Inventory /></div>
          <div className={tab === 'upload' ? '' : 'hidden'}>
            <Upload onDone={() => { setTab('house'); setArrivalToken((t) => t + 1); }} />
          </div>
          <div className={tab === 'skills' ? '' : 'hidden'}><SkillTree /></div>
          <div className={tab === 'journal' ? '' : 'hidden'}><Journal /></div>
        </main>
        <BottomNav tab={tab} go={setTab} questBadge={questBadge} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Shell />
    </GameProvider>
  );
}
