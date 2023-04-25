import {JigsawDigit} from "./JigsawDigit";
import {
    arrayContainsPosition,
    Position,
    PositionSet,
    PositionWithAngle,
    rotateVectorClockwise
} from "../../../types/layout/Position";
import {SudokuCellsIndex} from "../../../types/sudoku/SudokuCellsIndex";
import {loop} from "../../../utils/math";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {getRegionBoundingBox} from "../../../utils/regions";
import {JigsawPieceInfo} from "./JigsawPieceInfo";
import {JigsawPTM} from "./JigsawPTM";
import {isRotatableDigit, rotateDigit} from "../../../components/sudoku/digit/DigitComponentType";
import {getPointsBoundingBox, getRectCenter, getRectPoints, Rect} from "../../../types/layout/Rect";
import {indexes} from "../../../utils/indexes";
import {GridRegion} from "../../../types/sudoku/GridRegion";
import {applyMetricsDiff, emptyGestureMetrics, GestureMetrics} from "../../../utils/gestures";
import {JigsawFieldPieceState} from "./JigsawFieldState";

const getJigsawPieces = (
    cellsIndex: SudokuCellsIndex<JigsawPTM>
): { pieces: JigsawPieceInfo[], otherCells: Position[] } => {
    const {
        puzzle: {
            regions = [],
            fieldSize: {rowsCount, columnsCount},
            importOptions,
        },
    } = cellsIndex;
    const stickyRegion = importOptions?.stickyRegion;

    let regionCells = regions.map((region) => Array.isArray(region) ? region : region.cells);

    let otherCells = new PositionSet(indexes(rowsCount).flatMap(
        (top) => indexes(columnsCount).map((left) => ({top, left}))
    )).bulkRemove(regionCells.flat());

    if (stickyRegion) {
        const isStickyRegionCell = ({top, left}: Position) => {
            top -= stickyRegion.top;
            left -= stickyRegion.left;
            return top >= 0 && left >= 0 && top < stickyRegion.height && left < stickyRegion.width;
        };

        const otherActiveCells = otherCells.filter((cell) => isStickyRegionCell(cell) && cellsIndex.allCells[cell.top]?.[cell.left]?.isActive);
        otherCells = otherCells.bulkRemove(otherActiveCells.items);

        if (otherActiveCells.size) {
            regionCells.push(otherActiveCells.items);
        }

        regionCells = regionCells.filter(([cell]) => !isStickyRegionCell(cell));
    }

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

export const getJigsawPieceIndexesByCell = (
    cellsIndex: SudokuCellsIndex<JigsawPTM>,
    piecePositions: JigsawFieldPieceState[],
    cell: Position,
) => {
    const index = getJigsawPieceIndexByCell(cellsIndex, cell);

    return index === undefined
        ? []
        : getJigsawPieceIndexesByZIndex(piecePositions, piecePositions[index].zIndex);
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

export const getActiveJigsawPieceZIndex = (pieces: JigsawFieldPieceState[]) => {
    if (pieces.length === 0) {
        return 0;
    }
    const zIndexes = pieces.map(({zIndex}) => zIndex);
    return Math.max(...zIndexes);
};

interface JigsawPiecesGroupItem {
    info: JigsawPieceInfo;
    position: JigsawFieldPieceState;
    region: GridRegion;
    index: number;
}
export interface JigsawPiecesGroup {
    zIndex: number;
    boundingRect: Rect;
    center: Position;
    pieces: JigsawPiecesGroupItem[];
    cells: Position[];
    indexes: number[];
}

export const groupJigsawPiecesByZIndex = (
    pieces: JigsawPieceInfo[],
    piecePositions: JigsawFieldPieceState[],
): JigsawPiecesGroup[] => {
    const piecesByZIndex: Record<number, JigsawPiecesGroupItem[]> = {};

    for (const [index, position] of piecePositions.entries()) {
        const info = pieces[index];
        const {zIndex} = position;

        piecesByZIndex[zIndex] = piecesByZIndex[zIndex] ?? [];
        piecesByZIndex[zIndex].push({
            info,
            position,
            region: getJigsawPieceRegion(info, position),
            index,
        });
    }

    return Object.entries(piecesByZIndex)
        .map(([zIndexStr, pieces]): JigsawPiecesGroup => {
            const boundingRect = getPointsBoundingBox(...pieces.flatMap(
                ({info: {boundingRect}, region}) =>
                    getRectPoints(boundingRect).map((point) => region.transformCoords?.(point) ?? point)
            ));

            return {
                zIndex: Number(zIndexStr),
                boundingRect,
                center: getRectCenter(boundingRect),
                pieces,
                cells: pieces.flatMap(({info: {cells}}) => cells),
                indexes: pieces.map(({index}) => index),
            };
        });
};

export const moveJigsawPieceByGroupGesture = (
    group: JigsawPiecesGroup,
    gesture: GestureMetrics,
    piece: JigsawPieceInfo,
    prevPosition: PositionWithAngle,
): PositionWithAngle => {
    const pieceCenter = getRectCenter(piece.boundingRect);
    const groupToPieceGesture = (gesture: GestureMetrics): GestureMetrics => ({
        ...gesture,
        x: gesture.x + group.center.left - pieceCenter.left,
        y: gesture.y + group.center.top - pieceCenter.top,
    });

    const {x, y, rotation} = applyMetricsDiff(
        {
            x: prevPosition.left,
            y: prevPosition.top,
            scale: 1,
            rotation: prevPosition.angle,
        },
        groupToPieceGesture(emptyGestureMetrics),
        groupToPieceGesture(gesture),
    );

    return {
        top: y,
        left: x,
        angle: rotation,
    };
};

export const getJigsawPieceIndexesByZIndex = (pieces: JigsawFieldPieceState[], zIndex?: number): number[] =>
    pieces
        .map((piece, index) => ({piece, index}))
        .filter(({piece}) => piece.zIndex === zIndex)
        .map(({index}) => index);

export const getActiveJigsawPieceIndexes = (piecePositions: JigsawFieldPieceState[]): number[] =>
    getJigsawPieceIndexesByZIndex(piecePositions, getActiveJigsawPieceZIndex(piecePositions));

export const sortJigsawPiecesByPosition = (pieces: JigsawPieceInfo[], piecePositions: Position[]) =>
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

export const getJigsawCellCenterAbsolutePosition = (region: GridRegion, {top, left}: Position) => {
    const center: Position = {top: top + 0.5, left: left + 0.5};
    return region.transformCoords?.(center) ?? center;
};

export const getJigsawPieceRegion = (
    {cells, boundingRect}: JigsawPieceInfo,
    {top, left, angle}: PositionWithAngle,
): GridRegion => {
    const center = getRectCenter(boundingRect);

    return {
        ...boundingRect,
        cells: cells.length ? cells : undefined,
        transformCoords: (position) => {
            const rotated = rotateVectorClockwise(position, angle, center);

            return {
                top: rotated.top + top,
                left: rotated.left + left,
            };
        },
    };
};
