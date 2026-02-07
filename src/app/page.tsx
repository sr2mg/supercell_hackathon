'use client';

import { Board } from "@/components/Board";
import { ControlPanel } from "@/components/ControlPanel";
import { NewsTicker } from "@/components/NewsTicker";
import { HowToPlay } from "@/components/HowToPlay";
import { useGameStore } from "@/store/gameStore";
import { useEffect } from "react";

export default function Home() {
  const isNewsReady = useGameStore(state => state.isNewsReady);
  const fetchNews = useGameStore(state => state.fetchNews);

  // Prefetch news on mount
  useEffect(() => {
    fetchNews({ mode: 'initial', initialCount: 1, chunkSize: 5 });
  }, [fetchNews]);

  if (!isNewsReady) {
    return (
      <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-yellow-400 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-white mb-2">NEWSOPOLY</h1>
          <p className="text-slate-400 animate-pulse">Fetching latest market news...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top: News Ticker */}
      <NewsTicker />

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-6 p-2 md:p-8">

        {/* Left: How to Play (Desktop) */}
        <div className="hidden lg:block w-64 lg:sticky lg:top-8 shrink-0">
          <HowToPlay />
        </div>

        {/* Center: Board Container - Needs to preserve aspect ratio and fit screen */}
        <div className="flex-1 w-full flex justify-center items-start lg:sticky lg:top-8">
          <Board />
        </div>

        {/* Right: Controls - Stacks below on mobile */}
        <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0">
          <ControlPanel />

          {/* Info / Legend (Mobile) */}
          <div className="lg:hidden">
            <HowToPlay />
          </div>
        </div>
      </div>
    </main>
  );
}
