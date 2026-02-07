'use client';
import { useGameStore, canBuyAsset } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, SkipForward, DollarSign } from 'lucide-react';
import clsx from 'clsx';
import type { Asset } from '@/data/boardData';
import { useState } from 'react';
import { SellStockModal } from './SellStockModal';

const DiceIcons = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export function ControlPanel() {
    const {
        players,
        activePlayerIndex,
        dice,
        rollDice,
        isRolling,
        hasRolled,
        turnCount,
        nextTurn,
        currentNews,
        board,
        buyShare,
        sellShare
    } = useGameStore(useShallow(state => ({
        players: state.players,
        activePlayerIndex: state.activePlayerIndex,
        dice: state.dice,
        rollDice: state.rollDice,
        isRolling: state.isRolling,
        hasRolled: state.hasRolled,
        turnCount: state.turnCount,
        nextTurn: state.nextTurn,
        currentNews: state.currentNews,
        board: state.board,
        buyShare: state.buyShare,
        sellShare: state.sellShare
    })));

    const activePlayer = players[activePlayerIndex];
    const currentTile = board[activePlayer.position]; // Assuming direct index mapping for now (0-23)

    const canBuy = canBuyAsset(currentTile, activePlayer);
    const holdings = getHoldings(board, activePlayer.id);
    const stockValue = holdings.reduce((acc, h) => acc + (h.shares * h.price), 0);
    const netWorth = activePlayer.money + stockValue;

    const [sellModalOpen, setSellModalOpen] = useState(false);
    const [selectedSellAsset, setSelectedSellAsset] = useState<{ id: number, name: string, tag: import('@/data/boardData').Tag, price: number, shares: number } | null>(null);

    const openSellModal = (asset: { id: number, name: string, tag: import('@/data/boardData').Tag, price: number, shares: number }) => {
        setSelectedSellAsset(asset);
        setSellModalOpen(true);
    };

    const handleSellConfirm = (amount: number) => {
        if (selectedSellAsset) {
            sellShare(selectedSellAsset.id, amount);
        }
    };

    return (
        <>
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
                        disabled={isRolling || hasRolled || activePlayer.isComputer}
                        className="col-span-2 bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        {isRolling ? 'Rolling...' : 'ROLL DICE'}
                    </button>

                    {canBuy && !activePlayer.isComputer && (
                        <button
                            onClick={() => buyShare(currentTile.id)}
                            className="col-span-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 animate-bounce-short shadow-md"
                        >
                            <DollarSign size={18} /> Buy 1 share ({currentTile.name}) ({currentTile.price})
                        </button>
                    )}

                    <button
                        onClick={nextTurn}
                        disabled={activePlayer.isComputer}
                        className="col-span-2 border border-slate-300 text-slate-600 py-2 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <SkipForward size={16} /> End Turn
                    </button>
                </div>

                {/* Active Player Summary */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-slate-500">Cash</div>
                            <div className="font-mono font-semibold text-slate-800">${activePlayer.money}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-slate-500">Stock</div>
                            <div className="font-mono font-semibold text-slate-800">${stockValue}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wide text-slate-500">Net Worth</div>
                            <div className="font-mono font-semibold text-slate-800">${netWorth}</div>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="text-xs font-semibold text-slate-700">Holdings</div>
                        {holdings.length === 0 && (
                            <div className="text-[11px] text-slate-500 mt-1">No shares yet</div>
                        )}
                        {holdings.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {holdings.map(h => {
                                    const pnl = h.dividend - h.purchaseDividend;
                                    const canSell = !hasRolled && !activePlayer.isComputer;
                                    return (
                                        <div key={h.id} className="flex items-center justify-between text-[11px] text-slate-700">
                                            <div className="truncate max-w-[120px]">{h.name}</div>
                                            <div className="font-mono flex items-center gap-1">
                                                <span>D${h.dividend}</span>
                                                <span className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    ({pnl >= 0 ? '+' : ''}{pnl})
                                                </span>
                                                <span>· {h.shares}sh</span>
                                                {canSell && (
                                                    <button
                                                        onClick={() => openSellModal(h)}
                                                        className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-medium hover:bg-red-200 transition-colors"
                                                    >
                                                        Sell (${h.price})
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Player List */}
                <div className="mt-4 space-y-2">
                    {players.map(p => {
                        const playerHoldings = getHoldings(board, p.id);
                        const playerStockValue = playerHoldings.reduce((acc, h) => acc + (h.shares * h.price), 0);
                        const playerNetWorth = p.money + playerStockValue;
                        return (
                            <div key={p.id} className={clsx(
                                "p-2 rounded transition-colors relative group cursor-pointer",
                                p.id === activePlayer.id ? 'bg-slate-100 ring-1 ring-slate-300' : 'hover:bg-slate-50'
                            )}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${p.color}`} />
                                        <span className="text-sm font-medium">{p.name}</span>
                                    </div>
                                    <div className="font-mono text-sm font-semibold">${playerNetWorth}</div>
                                </div>
                                <div className="flex justify-end gap-3 mt-1 text-[10px] text-slate-500">
                                    <span>Cash: ${p.money}</span>
                                    <span>Stock: ${playerStockValue}</span>
                                </div>
                                {/* Holdings Tooltip */}
                                <div className="absolute left-0 right-0 top-full mt-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                                    <div className="bg-slate-800 text-white text-[11px] rounded-lg p-3 shadow-xl">
                                        <div className="font-semibold mb-2 text-slate-200">{p.name}&apos;s Holdings</div>
                                        {playerHoldings.length === 0 ? (
                                            <div className="text-slate-400">No shares yet</div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {playerHoldings.map(h => {
                                                    const pnl = h.dividend - h.purchaseDividend;
                                                    return (
                                                        <div key={h.id} className="flex items-center justify-between gap-4">
                                                            <span className="truncate max-w-[120px] text-slate-100">{h.name}</span>
                                                            <span className="font-mono text-slate-300 whitespace-nowrap">
                                                                {h.shares}sh · D${h.dividend}{' '}
                                                                <span className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                                    ({pnl >= 0 ? '+' : ''}{pnl})
                                                                </span>
                                                                {' '}· ${h.shares * h.price}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                                <div className="border-t border-slate-600 pt-1.5 mt-1.5 flex justify-between font-semibold">
                                                    <span>Total Stock Value</span>
                                                    <span className="font-mono">${playerStockValue}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedSellAsset && (
                <SellStockModal
                    isOpen={sellModalOpen}
                    onClose={() => setSellModalOpen(false)}
                    assetName={selectedSellAsset.name}
                    assetTag={selectedSellAsset.tag}
                    currentPrice={selectedSellAsset.price}
                    maxShares={selectedSellAsset.shares}
                    onSell={handleSellConfirm}
                />
            )}
        </>
    );
}

function DiceIcon({ value, isRolling }: { value: number, isRolling: boolean }) {
    const Icon = DiceIcons[value] || Dice1;
    return <Icon className={`w-12 h-12 text-slate-800 ${isRolling ? 'animate-spin' : ''}`} />;
}

function getHoldings(board: Asset[], playerId: number) {
    return board
        .map(asset => {
            const holder = asset.shareholders.find(h => h.playerId === playerId);
            if (!holder) return null;
            return {
                id: asset.id,
                name: asset.name,
                tag: asset.tag,
                shares: holder.shares,
                dividend: asset.dividend,
                price: asset.price,
                purchaseDividend: holder.purchaseDividend
            };
        })
        .filter((h): h is NonNullable<typeof h> => h !== null && h.shares > 0);
}
