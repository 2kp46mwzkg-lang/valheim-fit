import { Backpack, BookOpen, Flame, Home, ScrollText } from 'lucide-react';

export type TabId = 'house' | 'inventory' | 'upload' | 'quests' | 'journal';

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'house', label: 'Maison', icon: Home },
  { id: 'inventory', label: 'Sac', icon: Backpack },
  { id: 'upload', label: 'Retour', icon: Flame },
  { id: 'quests', label: 'Quêtes', icon: ScrollText },
  { id: 'journal', label: 'Journal', icon: BookOpen },
];

export default function BottomNav({ tab, go, questBadge }: { tab: TabId; go: (t: TabId) => void; questBadge: number }) {
  return (
    <nav className="tabbar fixed bottom-0 left-0 right-0 z-20 border-t border-[#3f5548] bg-[#1c2620]/95 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-[520px] grid-cols-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          const isReturn = id === 'upload';
          return (
            <button
              key={id}
              onClick={() => go(id)}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition ${
                active ? 'text-[#f2d16b]' : 'text-[#7d8a80] hover:text-[#ece6d6]'
              }`}
            >
              {isReturn && active && (
                <span className="absolute -top-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#f2d16b] bg-gradient-to-b from-[#e8955a] to-[#a8542e] text-white shadow-[0_8px_24px_-4px_rgba(232,149,90,.7)]">
                  <Flame size={22} />
                </span>
              )}
              {isReturn && active && <span className="h-6" />}
              {!(isReturn && active) && (
                <span className={`flex h-6 items-center ${active ? 'scale-110' : ''} transition-transform`}>
                  <Icon size={21} strokeWidth={active ? 2.4 : 2} />
                </span>
              )}
              {label}
              {id === 'quests' && questBadge > 0 && (
                <span className="absolute right-1/2 top-1 flex h-4 min-w-4 translate-x-5 items-center justify-center rounded-full bg-[#b33a3a] px-1 text-[9px] font-bold text-white">
                  {questBadge}
                </span>
              )}
              {active && !isReturn && <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-[#f2d16b]" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
