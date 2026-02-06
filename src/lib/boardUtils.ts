export interface GridCoordinate {
    rowStart: number;
    colStart: number;
    rowEnd: number;
    colEnd: number;
}

/**
 * Calculates the grid coordinates for a tile on a square board loop.
 * Assumes a square grid where tiles are placed on the perimeter.
 * 
 * @param index The 0-based index of the tile.
 * @param totalTiles The total number of tiles on the board. prefer multiples of 4.
 * @returns CSS Grid Area coordinates (1-based).
 */
export function getTileGridArea(index: number, totalTiles: number): GridCoordinate {
    // Determine the side length (number of tiles on one side, including corners)
    // For a perimeter of T tiles, the side length S is (T / 4) + 1.
    // Example: 16 tiles -> Side is 5 (5+3+3+3+2 = 16? No. 5+4+4+3=16 for corners? Let's check)
    // Actually: Perimeter = 2 * (W + H) - 4 (corners counted once)
    // If square, W=H=S. 4S - 4 = T => 4S = T + 4 => S = (T/4) + 1.
    // 16 tiles -> S = 16/4 + 1 = 5. Correct.

    const sideLength = Math.floor(totalTiles / 4) + 1;
    const itemsPerSide = sideLength - 1; // Number of steps to next corner

    // Define the segments
    // Bottom: 0 to S-1 (index 0 is Bottom-Right corner)
    // Left: S-1 to 2*(S-1)
    // Top: 2*(S-1) to 3*(S-1)
    // Right: 3*(S-1) to 4*(S-1)

    // Segment ranges (inclusive start, exclusive end for calculation logic)
    const limitBottom = itemsPerSide;
    const limitLeft = itemsPerSide * 2;
    const limitTop = itemsPerSide * 3;
    const limitRight = itemsPerSide * 4; // Should equal totalTiles

    // 1. Bottom Row (Right to Left)
    // Starts at (S, S), moves left to (S, 1)
    // Indices: 0 to itemsPerSide
    if (index >= 0 && index < limitBottom) {
        const offset = index;
        // Row is always S (bottom)
        // Col starts at S and decreases by offset
        return {
            rowStart: sideLength,
            rowEnd: sideLength + 1,
            colStart: sideLength - offset,
            colEnd: sideLength - offset + 1
        };
    }

    // 2. Left Row (Bottom to Top)
    // Starts at (S, 1), moves up to (1, 1)
    // Indices: itemsPerSide to 2*itemsPerSide
    if (index >= limitBottom && index < limitLeft) {
        const offset = index - limitBottom;
        // Col is always 1 (left)
        // Row starts at S and decreases by offset
        return {
            rowStart: sideLength - offset,
            rowEnd: sideLength - offset + 1,
            colStart: 1,
            colEnd: 2
        };
    }

    // 3. Top Row (Left to Right)
    // Starts at (1, 1), moves right to (1, S)
    // Indices: 2*itemsPerSide to 3*itemsPerSide
    if (index >= limitLeft && index < limitTop) {
        const offset = index - limitLeft;
        // Row is always 1 (top)
        // Col starts at 1 and increases by offset
        return {
            rowStart: 1,
            rowEnd: 2,
            colStart: 1 + offset,
            colEnd: 1 + offset + 1
        };
    }

    // 4. Right Row (Top to Bottom)
    // Starts at (1, S), moves down to (S, S)
    // Indices: 3*itemsPerSide to totalTiles
    if (index >= limitTop && index < totalTiles) {
        const offset = index - limitTop;
        // Col is always S (right)
        // Row starts at 1 and increases by offset
        return {
            rowStart: 1 + offset,
            rowEnd: 1 + offset + 1,
            colStart: sideLength,
            colEnd: sideLength + 1
        };
    }

    // Fallback (should not happen for valid indices)
    return { rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 2 };
}

export function getGridSize(totalTiles: number): number {
    return Math.floor(totalTiles / 4) + 1;
}
