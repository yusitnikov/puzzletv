import {JigsawDigit} from "./JigsawDigit";
import {isSamePosition, Position} from "../../../types/layout/Position";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {loop} from "../../../utils/math";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {getRegionBoundingBox} from "../../../utils/regions";
import {JigsawPieceInfo} from "./JigsawPieceInfo";
import {JigsawPTM} from "./JigsawPTM";
import {isRotatableDigit, rotateDigit} from "../../../components/sudoku/digit/DigitComponentType";

export const getJigsawPieces = (
    {regions = [], fieldSize: {rowsCount, columnsCount}}: PuzzleDefinition<JigsawPTM>,
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
    {puzzle, cache}: SudokuCellsIndex<JigsawPTM>,
): ReturnType<typeof getJigsawPieces> => {
    return cache.jigsawPieces = cache.jigsawPieces ?? getJigsawPieces(puzzle);
};

export const getJigsawPieceIndexByCell = (
    cellsIndex: SudokuCellsIndex<JigsawPTM>,
    cell: Position,
): number | undefined => getJigsawPiecesWithCache(cellsIndex).findIndex(
    ({cells}) => cells.some((regionCell) => isSamePosition(regionCell, cell))
);

export const normalizeJigsawDigit = (puzzle: PuzzleDefinition<JigsawPTM>, {digit, angle}: JigsawDigit): JigsawDigit => {
    angle = loop(angle, 360);
    if (angle >= 180 && isRotatableDigit(puzzle, digit)) {
        return {
            digit: rotateDigit(puzzle, digit, 180),
            angle: angle - 180,
        };
    }
    return {digit, angle};
};
