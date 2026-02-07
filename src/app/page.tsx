'use client';

import { Board } from "@/components/Board";
import { ControlPanel } from "@/components/ControlPanel";
import { NewsTicker } from "@/components/NewsTicker";
import { HowToPlay } from "@/components/HowToPlay";
import { useGameStore } from "@/store/gameStore";
import { useEffect, useState } from "react";

export default function Home() {
  const isNewsReady = useGameStore(state => state.isNewsReady);
  const fetchNews = useGameStore(state => state.fetchNews);
  const [hasStarted, setHasStarted] = useState(false);

  // Prefetch news on mount
  useEffect(() => {
    fetchNews({ mode: 'initial', initialCount: 1, chunkSize: 5 });
  }, [fetchNews]);

  if (!hasStarted) {
    return (
      <main className="min-h-screen bg-[#efede6] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-10">
          <img
            src="/logo-s.png"
            alt="Newsopoly"
            className="w-[420px] max-w-[80vw] h-auto"
          />
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => {
                if (isNewsReady) setHasStarted(true);
              }}
              className="px-10 py-3 rounded-full text-2xl tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-black text-white"
              style={{ fontFamily: 'var(--font-lilita-one)' }}
              disabled={!isNewsReady}
            >
              MARKET OPEN
            </button>
            <div className="text-black text-xl tracking-widest">
              PRESS TO START
            </div>
          </div>
          <div className="text-black/60 text-sm tracking-wide">
            {isNewsReady ? 'Ready.' : 'Loading market news...'}
          </div>
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
