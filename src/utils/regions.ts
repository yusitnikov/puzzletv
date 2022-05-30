import {isSamePosition, Position, stringifyCellCoords} from "../types/layout/Position";
import {emptyRect, Rect} from "../types/layout/Rect";

export const getRegionMap = <T>(cells: Position[], value: T) => {
    const map: Record<string, T> = {};

    for (const cell of cells) {
        map[stringifyCellCoords(cell)] = value;
    }

    return map;
};

export const getRegionBoundingBox = (cells: Position[]): Rect => {
    if (!cells.length) {
        return emptyRect;
    }

    const min: Position = {
        left: Math.min(...cells.map(cell => cell.left)),
        top: Math.min(...cells.map(cell => cell.top)),
    };
    const max: Position = {
        left: Math.max(...cells.map(cell => cell.left)),
        top: Math.max(...cells.map(cell => cell.top)),
    };

    return {
        ...min,
        width: max.left + 1 - min.left,
        height: max.top + 1 - min.top,
    };
};

export const getRegionBorders = (cells: Position[], includeLoopedCell = false): Position[] => {
    if (!cells.length) {
        return [];
    }

    const boundingBox = getRegionBoundingBox(cells);
    const cellsMap = getRegionMap(cells, true);

    const bordersGraph: Record<string, Position[]> = {};
    for (let top = boundingBox.top; top <= boundingBox.top + boundingBox.height; top++) {
        for (let left = boundingBox.left; left <= boundingBox.left + boundingBox.width; left++) {
            const cellCoords: Position = {left, top};
            const cellCoordsStr = stringifyCellCoords(cellCoords);

            const addToGraph = (cellCoords2: Position) => {
                const cellCoords2Str = stringifyCellCoords(cellCoords2);

                bordersGraph[cellCoordsStr] = bordersGraph[cellCoordsStr] || [];
                bordersGraph[cellCoordsStr].push(cellCoords2);

                bordersGraph[cellCoords2Str] = bordersGraph[cellCoords2Str] || [];
                bordersGraph[cellCoords2Str].push(cellCoords);
            };

            // Add the left border before the top border for the top-left cell, so that the region will go anti-clockwise
            if (cellsMap[cellCoordsStr] !== cellsMap[stringifyCellCoords({left: left - 1, top})]) {
                addToGraph({left, top: top + 1});
            }

            if (cellsMap[cellCoordsStr] !== cellsMap[stringifyCellCoords({left, top: top - 1})]) {
                addToGraph({left: left + 1, top});
            }
        }
    }

    const topLeftCell: Position = {
        top: boundingBox.top,
        left: Math.min(
            ...cells
                .filter(cell => cell.top === boundingBox.top)
                .map(cell => cell.left)
        ),
    };

    const borderPoints = [topLeftCell];
    for (
        let cell1 = topLeftCell,
            cell1Str = stringifyCellCoords(cell1),
            cell2: Position,
            cell2Str: string;
        bordersGraph[cell1Str].length;
        cell1 = cell2, cell1Str = cell2Str
    ) {
        // Peek the next cell and remove the border from the graph
        cell2 = bordersGraph[cell1Str].shift()!;
        cell2Str = stringifyCellCoords(cell2);
        bordersGraph[cell2Str] = bordersGraph[cell2Str].filter(cell => !isSamePosition(cell, cell1));

        // Add the current border to the results (replace the previous point if the next point is the continuation)
        if (borderPoints.length >= 2 && (borderPoints[borderPoints.length - 2].left === cell1.left) === (cell1.left === cell2.left)) {
            borderPoints[borderPoints.length - 1] = cell2;
        } else {
            borderPoints.push(cell2);
        }
    }

    if (!includeLoopedCell) {
        borderPoints.pop();
    }

    return borderPoints;
};

export const getAutoRegionWidth = (fieldSize: number) => {
    let result = fieldSize;

    for (let i = 2; i * i <= fieldSize; i++) {
        if (fieldSize % i === 0) {
            result = fieldSize / i;
        }
    }

    return result;
};
