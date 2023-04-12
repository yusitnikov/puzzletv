import {JigsawGameState, JigsawProcessedGameState} from "./JigsawGameState";
import {JigsawDigit} from "./JigsawDigit";
import {isSamePosition, Position} from "../../../types/layout/Position";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {loop} from "../../../utils/math";
import {
    isRotatableDigit,
    isSelfRotatableDigit,
    toggleDigit
} from "../../rotatable/types/RotatableDigitSudokuTypeManager";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {getRegionBoundingBox} from "../../../utils/regions";
import {JigsawPieceInfo} from "./JigsawPieceInfo";

export const getJigsawPieces = (
    {fieldSize: {regions, rowsCount, columnsCount}}: PuzzleDefinition<JigsawDigit, JigsawGameState, JigsawProcessedGameState>,
): JigsawPieceInfo[] => {
    // Regions may be not initialized yet during puzzle import, so the code below is a fallback
    if (regions.length === 0) {
        return [
            {
                boundingRect: {
                    top: 0,
                    left: 0,
                    width: columnsCount,
                    height: rowsCount,
                },
                cells: [],
            },
        ];
    }

    // TODO: other region creation modes

    return regions.map((region) => {
        const cells = Array.isArray(region) ? region : region.cells;

        return {
            cells,
            boundingRect: getRegionBoundingBox(cells, 1),
        };
    });
};

export const getJigsawPiecesWithCache = (
    {puzzle, cache}: SudokuCellsIndex<JigsawDigit, JigsawGameState, JigsawProcessedGameState>,
): ReturnType<typeof getJigsawPieces> => {
    return cache.jigsawPieces = cache.jigsawPieces ?? getJigsawPieces(puzzle);
};

export const getJigsawPieceIndexByCell = (
    cellsIndex: SudokuCellsIndex<JigsawDigit, JigsawGameState, JigsawProcessedGameState>,
    cell: Position,
): number | undefined => getJigsawPiecesWithCache(cellsIndex).findIndex(
    ({cells}) => cells.some((regionCell) => isSamePosition(regionCell, cell))
);

export const normalizeJigsawDigit = ({digit, angle}: JigsawDigit): JigsawDigit => {
    angle = loop(angle, 360);
    if (angle >= 180 && (isRotatableDigit(digit) || isSelfRotatableDigit(digit))) {
        return {
            digit: toggleDigit(digit),
            angle: angle - 180,
        };
    }
    return {digit, angle};
};
