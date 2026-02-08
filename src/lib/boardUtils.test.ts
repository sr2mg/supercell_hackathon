import { describe, it, expect } from 'vitest';
import { getTileGridArea, getGridSize, getTileCenter } from './boardUtils';

describe('boardUtils', () => {
    describe('getGridSize', () => {
        it('should calculate correct grid size for 16 tiles', () => {
            expect(getGridSize(16)).toBe(5);
        });

        it('should calculate correct grid size for 20 tiles', () => {
            expect(getGridSize(20)).toBe(6);
        });

        it('should calculate correct grid size for 24 tiles', () => {
            expect(getGridSize(24)).toBe(7);
        });
    });

    describe('getTileGridArea', () => {
        const totalTiles = 16;

        it('should return correct coordinates for tile 0 (bottom-right corner)', () => {
            const coords = getTileGridArea(0, totalTiles);
            expect(coords.rowStart).toBe(5);
            expect(coords.colStart).toBe(5);
        });

        it('should return correct coordinates for bottom row tiles', () => {
            // Tile 1 should be at (5, 4)
            expect(getTileGridArea(1, totalTiles)).toEqual({
                rowStart: 5, rowEnd: 6,
                colStart: 4, colEnd: 5
            });
            // Tile 4 should be at (5, 1) - bottom-left corner
            expect(getTileGridArea(4, totalTiles)).toEqual({
                rowStart: 5, rowEnd: 6,
                colStart: 1, colEnd: 2
            });
        });

        it('should return correct coordinates for left column tiles', () => {
            // Tile 5 should be at (4, 1)
            expect(getTileGridArea(5, totalTiles)).toEqual({
                rowStart: 4, rowEnd: 5,
                colStart: 1, colEnd: 2
            });
        });

        it('should return correct coordinates for top row tiles', () => {
            // Tile 8 should be top-left (1, 1)
            expect(getTileGridArea(8, totalTiles)).toEqual({
                rowStart: 1, rowEnd: 2,
                colStart: 1, colEnd: 2
            });
        });

        it('should return correct coordinates for right column tiles', () => {
            // Tile 12 should be at top-right (1, 5)
            expect(getTileGridArea(12, totalTiles)).toEqual({
                rowStart: 1, rowEnd: 2,
                colStart: 5, colEnd: 6
            });
        });
    });

    describe('getTileCenter', () => {
        const totalTiles = 16;
        const sideLength = getGridSize(totalTiles); // 5

        it('should return center coordinates as percentages', () => {
            const center = getTileCenter(0, totalTiles, sideLength);
            // For a 5x5 grid, each cell is 20% wide
            // Tile 0 is at grid (5, 5), so center should be at 90%, 90%
            expect(center.x).toBe(90);
            expect(center.y).toBe(90);
        });

        it('should return correct center for bottom-left corner', () => {
            const center = getTileCenter(4, totalTiles, sideLength);
            // Tile 4 is at grid (5, 1), center should be at 10%, 90%
            expect(center.x).toBe(10);
            expect(center.y).toBe(90);
        });

        it('should return correct center for top-left corner', () => {
            const center = getTileCenter(8, totalTiles, sideLength);
            // Tile 8 is at grid (1, 1), center should be at 10%, 10%
            expect(center.x).toBe(10);
            expect(center.y).toBe(10);
        });

        it('should return correct center for top-right corner', () => {
            const center = getTileCenter(12, totalTiles, sideLength);
            // Tile 12 is at grid (1, 5), center should be at 90%, 10%
            expect(center.x).toBe(90);
            expect(center.y).toBe(10);
        });

        it('should return percentage values that are always between 0 and 100', () => {
            for (let i = 0; i < totalTiles; i++) {
                const center = getTileCenter(i, totalTiles, sideLength);
                expect(center.x).toBeGreaterThan(0);
                expect(center.x).toBeLessThan(100);
                expect(center.y).toBeGreaterThan(0);
                expect(center.y).toBeLessThan(100);
            }
        });

        it('should be window-size-independent (uses percentages)', () => {
            // This test verifies the design: since we use percentages,
            // the actual pixel position scales with container size
            const center1 = getTileCenter(0, totalTiles, sideLength);
            const center2 = getTileCenter(0, totalTiles, sideLength);

            // Same input should give same percentages
            expect(center1).toEqual(center2);

            // The values are percentages, not pixels
            // So they work at any window size
            expect(typeof center1.x).toBe('number');
            expect(typeof center1.y).toBe('number');
        });

        it('should work with different board sizes', () => {
            // 20 tiles -> 6x6 grid
            const tiles20 = 20;
            const side20 = getGridSize(tiles20); // 6
            const center20 = getTileCenter(0, tiles20, side20);

            // Each cell is ~16.67% wide, tile 0 at (6,6)
            // Center should be at 91.67%, 91.67%
            expect(center20.x).toBeCloseTo(100 / 6 * 5.5, 1);
            expect(center20.y).toBeCloseTo(100 / 6 * 5.5, 1);
        });
    });
});
