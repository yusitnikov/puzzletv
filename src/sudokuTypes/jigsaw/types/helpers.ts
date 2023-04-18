import {JigsawDigit} from "./JigsawDigit";
import {arrayContainsPosition, Position, PositionSet, PositionWithAngle} from "../../../types/layout/Position";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {loop} from "../../../utils/math";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {getRegionBoundingBox} from "../../../utils/regions";
import {JigsawPieceInfo} from "./JigsawPieceInfo";
import {JigsawPTM} from "./JigsawPTM";
import {isRotatableDigit, rotateDigit} from "../../../components/sudoku/digit/DigitComponentType";
import {JigsawPieceState} from "./JigsawPieceState";
import {getRectCenter} from "../../../types/layout/Rect";
import {indexes} from "../../../utils/indexes";

const getJigsawPieces = (
    cellsIndex: SudokuCellsIndex<JigsawPTM>
): { pieces: JigsawPieceInfo[], otherCells: Position[] } => {
    const {puzzle: {regions = [], fieldSize: {rowsCount, columnsCount}}} = cellsIndex;

    const regionCells = regions.map((region) => Array.isArray(region) ? region : region.cells);

    let otherCells = new PositionSet(indexes(rowsCount).flatMap(
        (top) => indexes(columnsCount).map((left) => ({top, left}))
    )).bulkRemove(regionCells.flat());

    // TODO: other region creation modes

    const pieces: JigsawPieceInfo[] = regionCells.map((cells) => {
        return {
            cells,
            boundingRect: getRegionBoundingBox(cells, 1),
        };
    });

    return {pieces, otherCells: otherCells.items};
};

export const getJigsawPiecesWithCache = (cellsIndex: SudokuCellsIndex<JigsawPTM>): ReturnType<typeof getJigsawPieces> => {
    return cellsIndex.cache.jigsawPieces = cellsIndex.cache.jigsawPieces ?? getJigsawPieces(cellsIndex);
};

export const getJigsawPieceIndexByCell = (
    cellsIndex: SudokuCellsIndex<JigsawPTM>,
    cell: Position,
): number | undefined => {
    const index = getJigsawPiecesWithCache(cellsIndex).pieces.findIndex(
        ({cells}) => arrayContainsPosition(cells, cell)
    );
    return index >= 0 ? index : undefined;
};

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

export const getActiveJigsawPieceIndex = (pieces: JigsawPieceState[]) => {
    if (pieces.length === 0) {
        return 0;
    }
    const zIndexes = pieces.map(({zIndex}) => zIndex);
    const maxZIndex = Math.max(...zIndexes);
    return zIndexes.indexOf(maxZIndex);
};

export const sortJigsawPiecesByPosition = (pieces: JigsawPieceInfo[], piecePositions: PositionWithAngle[]) =>
    piecePositions
        .map(({top, left}, index) => {
            const center = getRectCenter(pieces[index].boundingRect);
            return {
                index,
                top: top + center.top,
                left: left + center.left,
            };
        })
        .sort((a, b) => Math.sign(a.top - b.top) || Math.sign(a.left - b.left) || (a.index - b.index))
        .map(({index}) => index);
