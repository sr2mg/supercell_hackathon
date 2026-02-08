'use client';
import { useGameStore, canBuyAsset } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { DollarSign } from 'lucide-react';
import clsx from 'clsx';
import type { Asset, Tag } from '@/data/boardData';
import { useEffect, useRef, useState } from 'react';
import { playSound } from '@/lib/sound';

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
    const didInit = useRef(false);
    const prevRolling = useRef(isRolling);
    const prevHasRolled = useRef(hasRolled);
    const prevPlayerIndex = useRef(activePlayerIndex);
    const prevTurn = useRef(turnCount);

    useEffect(() => {
        if (!didInit.current) {
            didInit.current = true;
            return;
        }
        if (activePlayerIndex !== prevPlayerIndex.current || turnCount !== prevTurn.current) {
            playSound('turn-start', 0.5);
        }
        prevPlayerIndex.current = activePlayerIndex;
        prevTurn.current = turnCount;
    }, [activePlayerIndex, turnCount]);

    useEffect(() => {
        if (isRolling && !prevRolling.current) {
            playSound('dice', 0.6);
        }
        prevRolling.current = isRolling;
    }, [isRolling]);

    useEffect(() => {
        if (hasRolled && !prevHasRolled.current) {
            playSound('moving', 0.45);
        }
        prevHasRolled.current = hasRolled;
    }, [hasRolled]);

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

    return (
        <div className="flex flex-col gap-2 w-full max-w-sm">
            {/* Header - Outside the border */}
            <div className="shrink-0">
                <div className="bg-black text-white py-2 rounded-2xl w-full text-center">
                    <h3 className="text-2xl tracking-widest leading-none" style={{ fontFamily: 'var(--font-lilita-one)' }}>
                        TURN {turnCount}
                    </h3>
                </div>
            </div>

            {/* Main bordered container */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl border-[5px] border-black min-h-[600px]">
                {/* Portfolio Grid */}
                <div className="px-4 shrink-0">
                    <div className="border-2 border-black rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {(['MEDIA', 'AI', 'ENERGY', 'CRYPTO', 'CHIPS', 'GOV'] as Tag[]).map((tag) => {
                                const count = holdings
                                    .filter(h => h.tag === tag)
                                    .reduce((sum, h) => sum + h.shares, 0);

                                // Map tags to specific colors based on the design
                                const tagColors: Record<Tag, string> = {
                                    AI: '#07A5E2',
                                    CHIPS: '#F5D304',
                                    ENERGY: '#F99408',
                                    GOV: '#B586DF',
                                    CRYPTO: '#00E16D',
                                    MEDIA: '#FDA3F5',
                                };

                                const displayTag = tag === 'CRYPTO' ? 'CRYPT' : tag;

                                return (
                                    <div key={tag} className="flex items-center justify-between">
                                        <div
                                            className="px-2 py-0.5 text-center min-w-[70px] border border-black/10"
                                            style={{
                                                backgroundColor: tagColors[tag],
                                                fontFamily: 'var(--font-lilita-one)'
                                            }}
                                        >
                                            <span className="text-[13px] text-black tracking-wide leading-none block pt-0.5">
                                                {displayTag}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-1" style={{ fontFamily: 'var(--font-lilita-one)' }}>
                                            <span className="text-lg leading-none">×</span>
                                            <span className="text-2xl leading-none">{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {isSellMode ? (
                        /* Sell Mode Content */
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Sell Mode Header */}
                            <div className="text-center mb-2 shrink-0">
                                <h3 className="text-lg font-bold font-sans">Select shares to sell.</h3>
                            </div>

                            {/* Holdings List for Selling */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
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
                                                        style={{
                                                            backgroundColor: {
                                                                AI: '#07A5E2',
                                                                CHIPS: '#F5D304',
                                                                ENERGY: '#F99408',
                                                                GOV: '#B586DF',
                                                                CRYPTO: '#00E16D',
                                                                MEDIA: '#FDA3F5',
                                                            }[h.tag] || '#E5E7EB'
                                                        }}
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
                            <div className="flex flex-col gap-3 mt-4 shrink-0">
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
                    ) : (
                        /* Normal Mode Content */
                        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2 shrink-0">
                                {!hasRolled && (
                                    <button
                                        onClick={rollDice}
                                        disabled={isRolling || hasRolled || activePlayer.isComputer}
                                        className="col-span-2 text-black text-4xl tracking-widest leading-none py-2 border-4 border-black rounded-full disabled:opacity-30 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                                    >
                                        {isRolling ? 'ROLLING...' : 'ROLL'}
                                    </button>
                                )}

                                {!activePlayer.isComputer && currentTile.price > 0 && (
                                    <button
                                        onClick={() => {
                                            playSound('share-pay', 0.5);
                                            buyShare(currentTile.id);
                                        }}
                                        disabled={!canBuy || activePlayer.money < currentTile.price}
                                        className="col-span-2 bg-green-600 text-white text-4xl tracking-widest leading-none py-2 border-4 border-black rounded-full transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-md disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
                                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                                    >
                                        <DollarSign size={32} strokeWidth={3} /> BUY ${currentTile.price}
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

                                {hasRolled && (
                                    <button
                                        onClick={nextTurn}
                                        disabled={activePlayer.isComputer}
                                        className="col-span-2 text-black text-4xl tracking-widest leading-none py-2 border-4 border-black rounded-full disabled:opacity-30 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                                    >
                                        END TURN
                                    </button>
                                )}
                            </div>

                            {/* Player List */}
                            <div className="mt-4 space-y-2 pr-1">
                                {players.map(p => {
                                    const playerHoldings = getHoldings(board, p.id);
                                    const playerStockValue = playerHoldings.reduce((acc, h) => acc + (h.shares * h.price), 0);
                                    const playerNetWorth = p.money + playerStockValue;
                                    const isActive = p.id === activePlayer.id;
                                    const isUser = !p.isComputer;

                                    return (
                                        <div
                                            key={p.id}
                                            className={clsx(
                                                "group relative flex items-center gap-3 py-2 pl-2 pr-4 rounded-xl transition-all",
                                                isActive && "border-[3px] border-black bg-black/5"
                                            )}
                                        >
                                            {/* Player Token */}
                                            <div className="relative shrink-0">
                                                {isUser && (
                                                    <div
                                                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-black tracking-widest"
                                                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                                                    >
                                                        YOU
                                                    </div>
                                                )}
                                                {isActive && isUser && (
                                                    <div
                                                        className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-white bg-black px-2 py-0.5 rounded-full tracking-widest animate-pulse"
                                                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                                                    >
                                                        YOUR TURN
                                                    </div>
                                                )}
                                                <div
                                                    className="w-10 h-10 rounded-full border-[3px] border-black"
                                                    style={{ backgroundColor: p.color }}
                                                />
                                            </div>

                                            {/* Net Worth */}
                                            <div className="flex items-baseline gap-1 text-black">
                                                <span className="text-lg" style={{ fontFamily: 'var(--font-lilita-one)' }}>$</span>
                                                <span className="text-4xl leading-none" style={{ fontFamily: 'var(--font-lilita-one)' }}>{playerNetWorth}</span>
                                            </div>

                                            {/* Breakdown */}
                                            <div
                                                className="grid grid-cols-[auto_1fr] gap-x-2 text-base leading-none text-black ml-auto"
                                                style={{ fontFamily: 'var(--font-lilita-one)' }}
                                            >
                                                <span className="text-right">CASH</span>
                                                <span className="text-right">{p.money}</span>

                                                <span className="text-right">STOCK</span>
                                                <span className="text-right">{playerStockValue}</span>
                                            </div>

                                            {/* Holdings Tooltip */}
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
                    )}
                </div>
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
