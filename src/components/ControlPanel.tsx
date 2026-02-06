'use client';
import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, SkipForward, DollarSign } from 'lucide-react';
import clsx from 'clsx';

const DiceIcons = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export function ControlPanel() {
    const {
        players,
        activePlayerIndex,
        dice,
        rollDice,
        isRolling,
        turnCount,
        nextTurn,
        currentNews, // kept for future use context
        board,
        buyProperty
    } = useGameStore(useShallow(state => ({
        players: state.players,
        activePlayerIndex: state.activePlayerIndex,
        dice: state.dice,
        rollDice: state.rollDice,
        isRolling: state.isRolling,
        turnCount: state.turnCount,
        nextTurn: state.nextTurn,
        currentNews: state.currentNews,
        board: state.board,
        buyProperty: state.buyProperty
    })));

    const activePlayer = players[activePlayerIndex];
    const currentTile = board[activePlayer.position]; // Assuming direct index mapping for now (0-23)

    const canBuy = currentTile &&
        (currentTile.type === 'PROPERTY' || currentTile.group === 'railroad' || currentTile.group === 'utility') &&
        !currentTile.owner &&
        currentTile.price &&
        activePlayer.money >= currentTile.price;

    return (
        <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-sm">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Turn {turnCount}</h3>
                    <p className="text-xs text-slate-500">Global Event Cycle: {3 - (turnCount % 3 === 0 ? 3 : turnCount % 3) + 1} turns left</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-slate-500">Current Player</div>
                    <div className={`font-bold ${activePlayer.id === 0 ? 'text-red-600' : 'text-blue-600'}`}>{activePlayer.name}</div>
                </div>
            </div>

            {/* Dice Section */}
            <div className="flex justify-center gap-4 py-4 bg-slate-50 rounded-lg">
                <DiceIcon value={dice[0]} isRolling={isRolling} />
                <DiceIcon value={dice[1]} isRolling={isRolling} />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={rollDice}
                    disabled={isRolling}
                    className="col-span-2 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    {isRolling ? 'Rolling...' : 'ROLL DICE'}
                </button>

                {canBuy && (
                    <button
                        onClick={() => buyProperty(currentTile.id)}
                        className="col-span-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 animate-bounce-short shadow-md"
                    >
                        <DollarSign size={18} /> Buy {currentTile.name} (${currentTile.price})
                    </button>
                )}

                <button
                    onClick={nextTurn}
                    className="col-span-2 border border-slate-300 text-slate-600 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                    <SkipForward size={16} /> End Turn
                </button>
            </div>

            {/* Player List */}
            <div className="mt-4 space-y-2">
                {players.map(p => (
                    <div key={p.id} className={clsx(
                        "flex justify-between p-2 rounded transition-colors",
                        p.id === activePlayer.id ? 'bg-slate-100 ring-1 ring-slate-300' : ''
                    )}>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${p.color}`} />
                            <span className="text-sm font-medium">{p.name}</span>
                        </div>
                        <div className="font-mono text-sm">${p.money}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DiceIcon({ value, isRolling }: { value: number, isRolling: boolean }) {
    const Icon = DiceIcons[value] || Dice1;
    return <Icon className={`w-12 h-12 text-slate-800 ${isRolling ? 'animate-spin' : ''}`} />;
}
