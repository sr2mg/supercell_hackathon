'use client';

import { Board } from "@/components/Board";
import { ControlPanel } from "@/components/ControlPanel";
import { NewsTicker } from "@/components/NewsTicker";
import { ResultModal } from "@/components/ResultModal";
import { HowToPlay } from "@/components/HowToPlay";
import { useGameStore } from "@/store/gameStore";
import { useEffect, useState } from "react";
import { playBgm } from "@/lib/sound";

export default function Home() {
  const isNewsReady = useGameStore(state => state.isNewsReady);
  const fetchNews = useGameStore(state => state.fetchNews);
  const winner = useGameStore(state => state.winner);
  const winningReason = useGameStore(state => state.winningReason);
  const players = useGameStore(state => state.players);
  const board = useGameStore(state => state.board);
  const currentNews = useGameStore(state => state.currentNews);
  const [hasStarted, setHasStarted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  // Prefetch news on mount
  useEffect(() => {
    fetchNews({ mode: 'initial', initialCount: 1, chunkSize: 5 });
  }, [fetchNews]);

  useEffect(() => {
    if (!hasStarted) {
      playBgm('basic-bgm', 0.35);
      const resume = () => playBgm('basic-bgm', 0.35);
      window.addEventListener('pointerdown', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
      return () => {
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
      };
    }
  }, [hasStarted]);

  if (!hasStarted) {
    if (showIntro) {
      return (
        <main className="min-h-screen bg-[#efede6] flex items-center justify-center px-6">
          <div className="w-full max-w-[1200px] flex flex-col items-center gap-10">
            <img
              src="/description.svg"
              alt="How to Play"
              className="w-full max-w-[1100px] h-auto"
            />
            <button
              onClick={() => setShowIntro(false)}
              className="px-10 py-3 rounded-full text-2xl tracking-wide bg-black text-white"
              style={{ fontFamily: 'var(--font-lilita-one)' }}
            >
              BACK
            </button>
          </div>
        </main>
      );
    }
    return (
      <main className="min-h-screen bg-[#efede6] flex items-center justify-center px-6">
        <div className="w-full max-w-[900px] flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center justify-center gap-10">
            <img
              src="/logo-s.png"
              alt="STOP the PRESSES!"
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
            <button
              onClick={() => setShowIntro(true)}
              className="text-black underline text-sm tracking-widest"
              style={{ fontFamily: 'var(--font-lilita-one)' }}
            >
              HOW TO PLAY
            </button>
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
          <div className="flex flex-col items-center gap-2">
            <Board />
            {currentNews?.impactText && (
              <div className="bg-white/95 border-[3px] border-black rounded-2xl px-6 py-3 shadow-lg w-[500px] max-w-[92vw]">
                <div className="text-black font-black uppercase tracking-widest text-sm md:text-xl">
                  {currentNews.impactText}
                </div>
                {currentNews.reactionText && (
                  <div className="text-slate-700 italic text-xs md:text-sm mt-1">
                    {currentNews.reactionText}
                  </div>
                )}
              </div>
            )}
          </div>
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
      {winner && (
        <ResultModal
          winner={winner}
          winningReason={winningReason}
          players={players}
          board={board}
        />
      )}
    </main>
  );
}
