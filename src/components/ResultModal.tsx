import type { Player } from '@/types/game';
import type { Asset } from '@/data/boardData';
import { getPlayerAssets } from '@/lib/stock/stockRules';

interface ResultModalProps {
    winner: Player;
    winningReason: string | null;
    players: Player[];
    board: Asset[];
}

export function ResultModal({ winner, winningReason, players, board }: ResultModalProps) {
    const getStockValue = (playerId: number) =>
        board.reduce((acc, asset) => {
            const owned = asset.shareholders.find(h => h.playerId === playerId)?.shares || 0;
            return acc + owned * asset.price;
        }, 0);

    const rankings = [...players].sort((a, b) => getPlayerAssets(b, board) - getPlayerAssets(a, board));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
            <div className="w-[860px] max-w-[92vw] bg-white border-[5px] border-black rounded-[36px] p-8">
                <div className="text-center mb-6">
                    <div
                        className="text-black text-5xl tracking-widest"
                        style={{ fontFamily: 'var(--font-lilita-one)' }}
                    >
                        RESULT
                    </div>
                    <div className="mt-3 text-3xl text-black" style={{ fontFamily: 'var(--font-lilita-one)' }}>
                        WINNER: {winner.name}
                    </div>
                    {winningReason && (
                        <div className="mt-2 text-base text-black/70">
                            {winningReason}
                        </div>
                    )}
                </div>

                <div className="border-4 border-black rounded-2xl p-4">
                    <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 text-sm font-bold text-black mb-2">
                        <div>PLAYER</div>
                        <div className="text-right">CASH</div>
                        <div className="text-right">STOCK</div>
                        <div className="text-right">NET</div>
                    </div>
                    <div className="space-y-2">
                        {rankings.map((p, index) => {
                            const stockValue = getStockValue(p.id);
                            const netWorth = p.money + stockValue;
                            const isWinner = p.id === winner.id;
                            return (
                                <div
                                    key={p.id}
                                    className={`grid grid-cols-[1.2fr_1fr_1fr_1fr] gap-3 items-center px-3 py-2 rounded-xl ${isWinner ? 'border-4 border-black bg-black/5' : 'border border-black/20'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full border-2 border-black" style={{ backgroundColor: p.color }} />
                                        <span className="text-black font-semibold">
                                            {index + 1}. {p.name}
                                        </span>
                                    </div>
                                    <div className="text-right text-black">${p.money}</div>
                                    <div className="text-right text-black">${stockValue}</div>
                                    <div className="text-right text-black font-bold">${netWorth}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
