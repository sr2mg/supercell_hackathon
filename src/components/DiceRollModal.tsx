'use client';

import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const DiceIcons = [Dice1, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export function DiceRollModal() {
    const { isRolling, dice } = useGameStore(useShallow(state => ({
        isRolling: state.isRolling,
        dice: state.dice
    })));

    const [displayedDice, setDisplayedDice] = useState<[number, number]>([1, 1]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRolling) {
            // Start rolling animation
            const rollSpeed = 100; // ms

            intervalRef.current = setInterval(() => {
                setDisplayedDice([
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1
                ]);
            }, rollSpeed);

            // After 2000ms, stop random rolling and show actual result (which is already set in store immediately)
            // Wait, the store logic updates `dice` immediately now (per plan), so we should transition to it.
            // But if we want it to "land" on the result, we should probably stop random rolling slightly before isRolling becomes false.
            // Actually, the simplest way is to just let it random roll until a specific time, then set to `dice`?
            // BUT `isRolling` stays true for 2.5s.

            // Let's make it random for 2.0s, then show target for 0.5s?
            const stopRollingTimeout = setTimeout(() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setDisplayedDice(dice);
            }, 2000);

            return () => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                clearTimeout(stopRollingTimeout);
            };
        }
    }, [isRolling, dice]);

    if (!isRolling) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl transform scale-100 animate-pop-in flex gap-8 items-center border-[6px] border-slate-900">
                <DiceDisplay value={displayedDice[0]} />
                <DiceDisplay value={displayedDice[1]} />
            </div>
        </div>
    );
}

function DiceDisplay({ value }: { value: number }) {
    // Just use dots for cleaner look if we want custom, or use Lucide.
    // The user liked the example image which had simple dots. Lucide is OK but small.
    // Let's stick to Lucide but make them BIG.
    const Icon = DiceIcons[value] || Dice1;

    return (
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-white rounded-xl shadow-inner">
            <Icon strokeWidth={1.5} className="w-full h-full text-slate-900" />
        </div>
    );
}
