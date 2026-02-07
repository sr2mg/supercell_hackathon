'use client';

import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';

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

            // After 2.0s, stop random rolling and show actual result
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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl animate-fade-in pointer-events-none">
            <div className="bg-white p-8 rounded-2xl shadow-2xl transform scale-100 animate-pop-in flex gap-8 items-center border-[6px] border-slate-900 pointer-events-auto">
                <DiceDisplay value={displayedDice[0]} />
                <DiceDisplay value={displayedDice[1]} />
            </div>
        </div>
    );
}

function DiceDisplay({ value }: { value: number }) {
    // Dice Guidelines:
    // Dot Diameter (D): 20% - 25% of face width. -> 20%
    // Distance (S): >= 0.5 * D. -> 10% (Gap = 30% - 20% = 10%)
    // Margin (M): 0.5 * D - 0.8 * D. -> 10% (0.5D)

    // Grid Positions (0-100%):
    // Col 1: 10% (Margin)
    // Col 2: 40% (Center)
    // Col 3: 70% (100 - 10 - 20)

    // Row 1: 10%
    // Row 2: 40%
    // Row 3: 70%

    // Coords: [top%, left%]
    const POS = {
        TL: [10, 10], TC: [10, 40], TR: [10, 70],
        ML: [40, 10], MC: [40, 40], MR: [40, 70],
        BL: [70, 10], BC: [70, 40], BR: [70, 70]
    };

    const getDotPositions = (val: number) => {
        switch (val) {
            case 1: return [POS.MC];
            case 2: return [POS.TR, POS.BL];
            case 3: return [POS.TR, POS.MC, POS.BL];
            case 4: return [POS.TL, POS.TR, POS.BL, POS.BR];
            case 5: return [POS.TL, POS.TR, POS.MC, POS.BL, POS.BR];
            case 6: return [POS.TL, POS.TR, POS.ML, POS.MR, POS.BL, POS.BR];
            default: return [];
        }
    };

    const dots = getDotPositions(value);

    return (
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-xl shadow-inner border-[3px] border-slate-300 relative overflow-hidden">
            {dots.map((pos, idx) => (
                <div
                    key={idx}
                    className="absolute rounded-full bg-slate-900 shadow-sm"
                    style={{
                        top: `${pos[0]}%`,
                        left: `${pos[1]}%`,
                        width: '20%',
                        height: '20%'
                    }}
                />
            ))}
        </div>
    );
}
