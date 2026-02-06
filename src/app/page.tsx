import { Board } from "@/components/Board";
import { ControlPanel } from "@/components/ControlPanel";
import { NewsTicker } from "@/components/NewsTicker";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top: News Ticker */}
      <NewsTicker />

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-center gap-6 p-2 md:p-8">

        {/* Left: Board Container - Needs to preserve aspect ratio and fit screen */}
        <div className="flex-1 w-full flex justify-center items-start lg:sticky lg:top-8">
          <Board />
        </div>

        {/* Right: Controls - Stacks below on mobile */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          <ControlPanel />

          {/* Info / Legend */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-xs text-slate-500">
            <h4 className="font-bold mb-2 text-slate-700">How to Play</h4>
            <ul className="space-y-1 list-disc pl-4">
              <li>Roll dice to move around the loop.</li>
              <li>Every 3 turns, <strong>World News</strong> changes property values or rents.</li>
              <li>Buy properties to bankrupt your opponent.</li>
              <li>Watch out for News Alerts!</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
