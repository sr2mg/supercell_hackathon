import React, { useState } from 'react';
import { Tag } from '@/data/boardData';

interface SellStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    assetName: string;
    assetTag: Tag;
    currentPrice: number;
    maxShares: number;
    onSell: (amount: number) => void;
}

export function SellStockModal({
    isOpen,
    onClose,
    assetName,
    assetTag,
    currentPrice,
    maxShares,
    onSell
}: SellStockModalProps) {
    const [amount, setAmount] = useState(1);

    if (!isOpen) return null;

    const totalValue = amount * currentPrice;

    const handleSell = () => {
        onSell(amount);
        setAmount(1); // Reset for next time
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900">Sell {assetName}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex justify-between text-sm text-slate-500 mb-1">
                            <span>Current Price</span>
                            <span>Max Shares</span>
                        </div>
                        <div className="flex justify-between font-mono font-semibold text-slate-900">
                            <span>${currentPrice}</span>
                            <span>{maxShares}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                            Quantity to Sell
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setAmount(Math.max(1, amount - 1))}
                                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors"
                            >
                                -
                            </button>
                            <div className="flex-1 text-center">
                                <span className="text-2xl font-bold font-mono text-slate-900">{amount}</span>
                            </div>
                            <button
                                onClick={() => setAmount(Math.min(maxShares, amount + 1))}
                                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors"
                            >
                                +
                            </button>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max={maxShares}
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-sm font-medium text-slate-500">Total Value</span>
                            <span className="text-2xl font-bold font-mono text-green-600">${totalValue}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSell}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
                            >
                                Sell Shares
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
