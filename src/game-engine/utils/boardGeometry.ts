export type BoardGeometry = {
    cols: number;
    rows: number;
};

export type BoardSide = 'bottom' | 'left' | 'top' | 'right';

export type BoardTileLayout = {
    col: number;
    row: number;
    side: BoardSide;
    sideIndex: 0 | 1 | 2 | 3;
    isCorner: boolean;
    rotation: number;
};

export function getBoardTileCount(geometry: BoardGeometry): number {
    const { cols, rows } = geometry;

    if (cols < 2 || rows < 2) {
        throw new Error(`Invalid board geometry: cols=${cols}, rows=${rows}`);
    }

    return 2 * (cols + rows) - 4;
}

export function getBoardCornerIndexes(geometry: BoardGeometry) {
    const { cols, rows } = geometry;

    return {
        bottomRight: 0,
        bottomLeft: cols - 1,
        topLeft: cols + rows - 2,
        topRight: 2 * cols + rows - 3,
    };
}

export function getBoardTileLayout(
    index: number,
    geometry: BoardGeometry
): BoardTileLayout {
    const { cols, rows } = geometry;
    const total = getBoardTileCount(geometry);

    let i = ((index % total) + total) % total;

    const bottomLength = cols;
    const leftLength = rows - 2;
    const topLength = cols;
    const rightLength = rows - 2;

    if (i < bottomLength) {
        return {
            col: cols - 1 - i,
            row: rows - 1,
            side: 'bottom',
            sideIndex: 0,
            isCorner: i === 0 || i === bottomLength - 1,
            rotation: 0,
        };
    }

    i -= bottomLength;

    if (i < leftLength) {
        return {
            col: 0,
            row: rows - 2 - i,
            side: 'left',
            sideIndex: 1,
            isCorner: false,
            rotation: 90,
        };
    }

    i -= leftLength;

    if (i < topLength) {
        return {
            col: i,
            row: 0,
            side: 'top',
            sideIndex: 2,
            isCorner: i === 0 || i === topLength - 1,
            rotation: 180,
        };
    }

    i -= topLength;

    if (i < rightLength) {
        return {
            col: cols - 1,
            row: 1 + i,
            side: 'right',
            sideIndex: 3,
            isCorner: false,
            rotation: -90,
        };
    }

    throw new Error(`Invalid tile index: ${index}`);
}