import React from 'react';
import { Home, Play, Trophy, BarChart3, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'setup' | 'battle' | 'leaderboard' | 'stats' | 'rules' | 'settings' | 'admin';
  setActiveTab: (tab: 'home' | 'setup' | 'battle' | 'leaderboard' | 'stats' | 'rules' | 'settings' | 'admin') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md py-2 px-4 flex items-center justify-around text-xs">
      
      <button
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'home' ? 'text-rose-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </button>

      <button
        onClick={() => setActiveTab('setup')}
        className={`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'setup' || activeTab === 'battle' ? 'text-rose-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Play className="w-5 h-5 fill-current" />
        <span>Battle</span>
      </button>

      <button
        onClick={() => setActiveTab('leaderboard')}
        className={`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'leaderboard' ? 'text-rose-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span>Rank</span>
      </button>

      <button
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'stats' ? 'text-rose-400 font-bold' : 'text-slate-400'
        }`}
      >
        <BarChart3 className="w-5 h-5" />
        <span>Stats</span>
      </button>

      <button
        onClick={() => setActiveTab('settings')}
        className={`flex flex-col items-center gap-1 cursor-pointer ${
          activeTab === 'settings' ? 'text-rose-400 font-bold' : 'text-slate-400'
        }`}
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </button>

    </div>
  );
};
