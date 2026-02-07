'use client';
import { useGameStore, canBuyAsset } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { SkipForward, DollarSign } from 'lucide-react';
import clsx from 'clsx';
import type { Asset } from '@/data/boardData';
import { useState } from 'react';

export function ControlPanel() {
    const {
        players,
        activePlayerIndex,
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


    const [isSellMode, setIsSellMode] = useState(false);
    const [sellAmounts, setSellAmounts] = useState<Record<number, number>>({});

    // Initialize sell amounts when entering sell mode
    const handleEnterSellMode = () => {
        const initialAmounts: Record<number, number> = {};
        holdings.forEach(h => {
            initialAmounts[h.id] = 0;
        });
        setSellAmounts(initialAmounts);
        setIsSellMode(true);
    };

    const getSellAmount = (assetId: number) => sellAmounts[assetId] || 0;

    const adjustSellAmount = (assetId: number, delta: number, max: number) => {
        const current = getSellAmount(assetId);
        const next = Math.min(max, Math.max(0, current + delta));
        setSellAmounts(prev => ({ ...prev, [assetId]: next }));
    };

    const handleConfirmSell = () => {
        Object.entries(sellAmounts).forEach(([assetId, amount]) => {
            if (amount > 0) {
                sellShare(Number(assetId), amount);
            }
        });
        setIsSellMode(false);
    };

    const handleExitSellMode = () => {
        setIsSellMode(false);
    };

    if (isSellMode) {
        return (
            <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-sm h-full relative">
                {/* Sell Mode Header */}
                <div className="text-center mb-2">
                    <h3 className="text-lg font-bold font-sans">Select shares to sell.</h3>
                </div>

                {/* Holdings List for Selling */}
                <div className="flex-1 overflow-y-auto space-y-3">
                    {holdings.length === 0 ? (
                        <div className="text-center text-slate-500 py-4">No shares to sell</div>
                    ) : (
                        holdings.map(h => {
                            const sellAmount = getSellAmount(h.id);
                            return (
                                <div key={h.id} className="flex items-center justify-between text-lg font-bold font-sans tracking-tight">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded-full border border-black"
                                            style={{ backgroundColor: h.tag === 'AI' ? '#FDA3F5' : h.tag === 'CHIPS' ? '#00E16D' : h.tag === 'ENERGY' ? '#F5D304' : '#07A5E2' }} // Simplified color mapping based on tag for now, ideally strictly from data
                                        />
                                        <span className="truncate max-w-[140px] uppercase text-black">{h.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-black">
                                        <span className="mr-1">—</span>
                                        <button
                                            onClick={() => adjustSellAmount(h.id, -1, h.shares)}
                                            disabled={sellAmount <= 0}
                                            className="text-2xl leading-none text-slate-500 hover:text-black disabled:opacity-30 px-1"
                                        >
                                            -
                                        </button>
                                        <span className="font-mono">{sellAmount}/{h.shares}</span>
                                        <button
                                            onClick={() => adjustSellAmount(h.id, 1, h.shares)}
                                            disabled={sellAmount >= h.shares}
                                            className="text-2xl leading-none text-slate-500 hover:text-black disabled:opacity-30 px-1"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-auto">
                    <button
                        onClick={handleConfirmSell}
                        className="w-full bg-black text-white text-3xl py-2 rounded-full font-black tracking-wider hover:scale-105 active:scale-95 transition-transform"
                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                    >
                        SELL
                    </button>
                    <button
                        onClick={handleExitSellMode}
                        className="w-full bg-white text-black text-3xl py-2 rounded-full font-black tracking-wider border-[3px] border-black hover:bg-slate-50 active:scale-95 transition-transform"
                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                    >
                        EXIT
                    </button>
                </div>

            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-sm">
            {/* Header */}
            <div className="flex justify-center border-b pb-4">
                <div className="bg-black text-white px-6 py-2 rounded-full shadow-lg transform -rotate-1">
                    <h3 className="text-2xl tracking-widest leading-none" style={{ fontFamily: 'var(--font-lilita-one)' }}>
                        TURN {turnCount}
                    </h3>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={rollDice}
                    disabled={isRolling || hasRolled || activePlayer.isComputer}
                    className="col-span-2 text-black text-4xl tracking-widest leading-none py-2 border-4 border-black rounded-full disabled:opacity-30 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                    style={{ fontFamily: 'var(--font-lilita-one)' }}
                >
                    {isRolling ? 'ROLLING...' : 'ROLL'}
                </button>

                {canBuy && !activePlayer.isComputer && (
                    <button
                        onClick={() => buyShare(currentTile.id)}
                        className="col-span-2 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 animate-bounce-short shadow-md"
                    >
                        <DollarSign size={18} /> Buy 1 share ({currentTile.name}) ({currentTile.price})
                    </button>
                )}

                {/* Main Sell Button to enter mode */}
                {!activePlayer.isComputer && hasRolled === false && holdings.length > 0 && (
                    <button
                        onClick={handleEnterSellMode}
                        className="col-span-2 bg-red-500 text-white text-2xl py-2 rounded-full font-black tracking-wider hover:bg-red-600 transition-all shadow-md"
                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                    >
                        SELL
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
                <div className="text-xs font-semibold text-slate-700">Holdings</div>
                {holdings.length === 0 && (
                    <div className="text-[11px] text-slate-500 mt-1">No shares yet</div>
                )}
                {holdings.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {holdings.map(h => {
                            const pnl = h.dividend - h.purchaseDividend;
                            return (
                                <div key={h.id} className="flex items-center justify-between text-[11px] text-slate-700">
                                    <div className="truncate max-w-[100px]">{h.name}</div>
                                    <div className="font-mono flex items-center gap-2">
                                        <span>D${h.dividend}</span>
                                        <span className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            ({pnl >= 0 ? '+' : ''}{pnl})
                                        </span>
                                        <span>· {h.shares}sh</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Player List */}
            <div className="mt-4 space-y-2">
                {players.map(p => {
                    const playerHoldings = getHoldings(board, p.id);
                    const playerStockValue = playerHoldings.reduce((acc, h) => acc + (h.shares * h.price), 0);
                    const playerNetWorth = p.money + playerStockValue;

                    return (
                        <div key={p.id} className="group relative flex items-center gap-3 py-2">
                            {/* Player Token */}
                            <div className="relative shrink-0">
                                {!p.isComputer && (
                                    <div
                                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-black tracking-widest"
                                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                                    >
                                        YOU
                                    </div>
                                )}
                                <div
                                    className="w-10 h-10 rounded-full border-[3px] border-black"
                                    style={{ backgroundColor: p.color }}
                                />
                            </div>

                            {/* Net Worth */}
                            <div className="flex items-baseline gap-1 text-black">
                                <span className="text-xl" style={{ fontFamily: 'var(--font-lilita-one)' }}>$</span>
                                <span className="text-5xl leading-none" style={{ fontFamily: 'var(--font-lilita-one)' }}>{playerNetWorth}</span>
                            </div>

                            {/* Breakdown */}
                            <div
                                className="grid grid-cols-[auto_1fr] gap-x-3 text-xl leading-none text-black ml-auto"
                                style={{ fontFamily: 'var(--font-lilita-one)' }}
                            >
                                <span className="text-right">CASH</span>
                                <span className="text-right">{p.money}</span>

                                <span className="text-right">STOCK</span>
                                <span className="text-right">{playerStockValue}</span>
                            </div>

                            {/* Holdings Tooltip - Keeping functionality but hiding it visually from the main design */}
                            <div className="absolute left-0 right-0 top-full mt-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                                <div className="bg-slate-800 text-white text-[11px] rounded-lg p-3 shadow-xl border border-slate-700 w-64">
                                    <div className="font-semibold mb-2 text-slate-200 font-sans">{p.name}&apos;s Holdings</div>
                                    {playerHoldings.length === 0 ? (
                                        <div className="text-slate-400 font-sans">No shares yet</div>
                                    ) : (
                                        <div className="space-y-1.5 font-sans">
                                            {playerHoldings.map(h => {
                                                const pnl = h.dividend - h.purchaseDividend;
                                                return (
                                                    <div key={h.id} className="flex items-center justify-between gap-4">
                                                        <span className="truncate flex-1 text-slate-100">{h.name}</span>
                                                        <span className="font-mono text-slate-300 whitespace-nowrap">
                                                            {h.shares}sh · D${h.dividend}{' '}
                                                            <span className={pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                                ({pnl >= 0 ? '+' : ''}{pnl})
                                                            </span>
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
    );
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
