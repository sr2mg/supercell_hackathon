'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Tile } from './Tile';
import { DiceRollModal } from './DiceRollModal';
import { useShallow } from 'zustand/react/shallow';
import { getGridSize, getTileGridArea, getTileCenter } from '@/lib/boardUtils';
import { PlayerToken } from './PlayerToken';

// プレイヤートークンの色定義
const playerColors: Record<number, string> = {
    0: '#F5D304',
    1: '#FDA3F5',
    2: '#00E16D',
    3: '#07A5E2',
};

export function Board() {
    const { board, players, turnCount, activePlayerIndex, hasRolled, currentNews, triggerNews } = useGameStore(useShallow(state => ({
        board: state.board,
        players: state.players,
        turnCount: state.turnCount,
        activePlayerIndex: state.activePlayerIndex,
        hasRolled: state.hasRolled,
        currentNews: state.currentNews,
        triggerNews: state.triggerNews
    })));

    // アニメーション中かどうかを管理
    const [isAnimating, setIsAnimating] = useState(false);
    // 前回のプレイヤー位置を保持
    const prevPositionsRef = useRef<Record<number, number>>({});

    useEffect(() => {
        // Trigger news at the very start of the game (Turn 1, Player 1, before rolling)
        if (turnCount === 1 && activePlayerIndex === 0 && !hasRolled && !currentNews) {
            triggerNews();
        }
    }, [turnCount, activePlayerIndex, hasRolled, currentNews, triggerNews]);

    // プレイヤー位置が変更されたらアニメーションをトリガー
    useEffect(() => {
        const currentPositions = Object.fromEntries(players.map(p => [p.id, p.position]));
        const hasPositionChange = players.some(p => prevPositionsRef.current[p.id] !== undefined && prevPositionsRef.current[p.id] !== p.position);

        if (hasPositionChange) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 600);
            return () => clearTimeout(timer);
        }

        prevPositionsRef.current = currentPositions;
    }, [players]);

    // 位置変更のたびにprevPositionsRefを更新（アニメーション後）
    useEffect(() => {
        if (!isAnimating) {
            prevPositionsRef.current = Object.fromEntries(players.map(p => [p.id, p.position]));
        }
    }, [isAnimating, players]);

    // Calculate grid dimensions
    const totalTiles = board.length;
    const sideLength = getGridSize(totalTiles);

    // Dynamic Grid Style
    const containerStyle = {
        gridTemplateColumns: `repeat(${sideLength}, 1fr)`,
        gridTemplateRows: `repeat(${sideLength}, 1fr)`
    };

    // getPlayersOnTileは内部表示用に空配列を返す（アニメーション中は外部で描画）
    const getPlayersOnTile = (tileId: number) => {
        // アニメーション用オーバーレイで表示するため、常に空配列を返す
        return [];
    };

    // プレイヤートークンの位置を計算
    const playerTokenPositions = useMemo(() => {
        return players.filter(p => p.isAlive).map(player => {
            const pos = getTileCenter(player.position, totalTiles, sideLength);
            return {
                ...player,
                x: pos.x,
                y: pos.y
            };
        });
    }, [players, totalTiles, sideLength]);

    return (
        <div className="w-full aspect-square bg-slate-200 p-1 md:p-2 rounded-xl shadow-2xl relative">
            <div
                className="grid gap-0 w-full h-full text-[10px] sm:text-xs"
                style={containerStyle}
            >
                {/* Center Logo / Play Area */}
                <div
                    className="bg-white/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-4 md:p-8 text-center"
                    style={{
                        gridColumnStart: 2,
                        gridColumnEnd: sideLength,
                        gridRowStart: 2,
                        gridRowEnd: sideLength
                    }}
                >
                    <img
                        src="/logo-s.png"
                        alt="STOP the PRESSES!"
                        className="w-2/3 max-w-[520px] h-auto"
                    />
                </div>

                {/* Modal Overlay for Dice */}
                <DiceRollModal />

                {board.map((tile, index) => {
                    const coords = getTileGridArea(index, totalTiles);
                    const style = {
                        gridRowStart: coords.rowStart,
                        gridRowEnd: coords.rowEnd,
                        gridColumnStart: coords.colStart,
                        gridColumnEnd: coords.colEnd
                    };

                    return (
                        <div key={`${tile.id}-${tile.dividend}-${tile.previousDividend ?? 0}`} style={style} className="w-full h-full overflow-hidden">
                            <Tile tile={tile} playersOnTile={getPlayersOnTile(tile.id)} />
                        </div>
                    );
                })}
            </div>

            {/* プレイヤートークンのアニメーションオーバーレイ */}
            <div className="absolute inset-0 pointer-events-none p-1 md:p-2">
                {playerTokenPositions.map((player, index) => (
                    <div
                        key={player.id}
                        className="absolute z-30 transition-all duration-500 ease-out"
                        style={{
                            left: `${player.x}%`,
                            top: `${player.y}%`,
                            transform: `translate(-50%, -50%) translate(${index * 8}px, ${index * 8}px)`,
                        }}
                        title={player.name}
                    >
                        <PlayerToken
                            color={playerColors[player.id] || player.color}
                            className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg"
                        />
                    </div>
                ))}
            </div>
        </div >
    );
}
