/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameSetup } from './components/GameSetup';
import { ArenaCanvas } from './components/ArenaCanvas';
import { WinnerModal } from './components/WinnerModal';
import { LeaderboardView } from './components/LeaderboardView';
import { StatisticsView } from './components/StatisticsView';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { CountryProfileModal } from './components/CountryProfileModal';
import { ShareModal } from './components/ShareModal';
import { ReplayViewerModal } from './components/ReplayViewerModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import { Country, GameMode, SeriesMode, ArenaTheme, SoundSettings } from './types';
import { COUNTRIES } from './data/countries';
import { soundManager } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'home' | 'setup' | 'battle' | 'leaderboard' | 'stats' | 'rules' | 'settings' | 'admin'
  >('home');

  // Sound Preferences
  const [soundSettings, setSoundSettings] = useState<SoundSettings>({
    soundFx: true,
    bgm: false,
    volume: 0.7,
    performanceMode: false,
  });

  // Active Battle Config
  const [battleConfig, setBattleConfig] = useState<{
    selectedCountries: Country[];
    gameMode: GameMode;
    seriesMode: SeriesMode;
    arenaTheme: ArenaTheme;
  }>({
    selectedCountries: COUNTRIES.slice(0, 32),
    gameMode: 'normal',
    seriesMode: 3,
    arenaTheme: 'cyber',
  });

  // Active Battle Result
  const [battleResult, setBattleResult] = useState<{
    winner: Country;
    seriesScore: Record<string, number>;
    durationSeconds: number;
  } | null>(null);

  // Modals
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showReplayModal, setShowReplayModal] = useState<boolean>(false);
  const [isBattlePaused, setIsBattlePaused] = useState<boolean>(false);

  // Update Sound Manager
  const handleUpdateSoundSettings = (newSettings: Partial<SoundSettings>) => {
    const updated = { ...soundSettings, ...newSettings };
    setSoundSettings(updated);
    soundManager.updateSettings(updated);
  };

  const toggleSound = () => {
    handleUpdateSoundSettings({ soundFx: !soundSettings.soundFx });
  };

  // Launch Battle
  const handleLaunchBattle = (config: {
    selectedCountries: Country[];
    gameMode: GameMode;
    seriesMode: SeriesMode;
    arenaTheme: ArenaTheme;
  }) => {
    setBattleConfig(config);
    setBattleResult(null);
    setIsBattlePaused(false);
    setActiveTab('battle');
  };

  // Battle Finished Callback
  const handleBattleFinish = (winner: Country, seriesScore: Record<string, number>, duration: number) => {
    setBattleResult({ winner, seriesScore, durationSeconds: duration });

    // Record battle to server DB
    fetch('/api/record-battle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        winnerCountry: winner,
        participants: battleConfig.selectedCountries,
        mode: battleConfig.gameMode,
        seriesMode: `First to ${battleConfig.seriesMode}`,
        arenaTheme: battleConfig.arenaTheme,
        durationSeconds: duration,
        totalEliminations: battleConfig.selectedCountries.length - 1,
      }),
    }).catch(() => {});
  };

  // Admin Instant Start
  const handleAdminStart = (config: {
    flagCount: number;
    mode: GameMode;
    series: SeriesMode;
    theme: ArenaTheme;
  }) => {
    const selected = COUNTRIES.slice(0, config.flagCount);
    handleLaunchBattle({
      selectedCountries: selected,
      gameMode: config.mode,
      seriesMode: config.series,
      arenaTheme: config.theme,
    });
  };

  const handleResetStats = () => {
    fetch('/api/admin/reset', { method: 'POST' }).catch(() => {});
    alert('All battle statistics have been reset.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans pb-16 md:pb-0">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundSettings={soundSettings}
        toggleSound={toggleSound}
        isPaused={isBattlePaused}
        onTogglePause={() => setIsBattlePaused(p => !p)}
        onExitBattle={() => setActiveTab('setup')}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <Hero
            onStartBattle={() => setActiveTab('setup')}
            onViewLeaderboard={() => setActiveTab('leaderboard')}
            onViewStats={() => setActiveTab('stats')}
          />
        )}

        {activeTab === 'setup' && (
          <GameSetup onLaunchBattle={handleLaunchBattle} />
        )}

        {activeTab === 'battle' && (
          <ArenaCanvas
            countries={battleConfig.selectedCountries}
            gameMode={battleConfig.gameMode}
            seriesMode={battleConfig.seriesMode}
            arenaTheme={battleConfig.arenaTheme}
            soundSettings={soundSettings}
            isPaused={isBattlePaused}
            onTogglePause={() => setIsBattlePaused(p => !p)}
            onBattleFinish={handleBattleFinish}
            onExit={() => setActiveTab('setup')}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView onSelectCountry={(id) => setSelectedCountryId(id)} />
        )}

        {activeTab === 'stats' && <StatisticsView />}

        {activeTab === 'rules' && <RulesModal />}

        {activeTab === 'settings' && (
          <SettingsModal
            soundSettings={soundSettings}
            onUpdateSoundSettings={handleUpdateSoundSettings}
            onResetStats={handleResetStats}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPanelModal
            onStartBattleWithConfig={handleAdminStart}
            onResetStats={handleResetStats}
          />
        )}
      </main>

      {/* WINNER CHAMPION MODAL */}
      {battleResult && (
        <WinnerModal
          winner={battleResult.winner}
          seriesScore={battleResult.seriesScore}
          seriesMode={battleConfig.seriesMode}
          gameMode={battleConfig.gameMode}
          arenaTheme={battleConfig.arenaTheme}
          defeatedCount={battleConfig.selectedCountries.length - 1}
          durationSeconds={battleResult.durationSeconds}
          onPlayAgain={() => {
            setBattleResult(null);
            handleLaunchBattle(battleConfig);
          }}
          onWatchReplay={() => setShowReplayModal(true)}
          onShare={() => setShowShareModal(true)}
        />
      )}

      {/* COUNTRY PROFILE DEEP STATS MODAL */}
      {selectedCountryId && (
        <CountryProfileModal
          countryId={selectedCountryId}
          onClose={() => setSelectedCountryId(null)}
        />
      )}

      {/* SHARE RESULT MODAL */}
      {showShareModal && battleResult && (
        <ShareModal
          winner={battleResult.winner}
          defeatedCount={battleConfig.selectedCountries.length - 1}
          durationSeconds={battleResult.durationSeconds}
          mode={battleConfig.gameMode}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* REPLAY VIEWER MODAL */}
      {showReplayModal && battleResult && (
        <ReplayViewerModal
          winner={battleResult.winner}
          onClose={() => setShowReplayModal(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
}
