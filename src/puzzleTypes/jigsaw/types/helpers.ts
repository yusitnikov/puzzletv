import { JigsawDigit } from "./JigsawDigit";
import { arrayContainsPosition, Position, PositionSet, PositionWithAngle } from "../../../types/layout/Position";
import { loop, roundToStep } from "../../../utils/math";
import { getRegionCells, isStickyRegionCell, PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { getRegionBoundingBox } from "../../../utils/regions";
import { JigsawPieceInfo } from "./JigsawPieceInfo";
import { JigsawPTM } from "./JigsawPTM";
import { isRotatableDigit, rotateDigit } from "../../../components/puzzle/digit/DigitComponentType";
import { getPointsBoundingBox, getRectCenter, getRectPoints, Rect } from "../../../types/layout/Rect";
import { indexes } from "../../../utils/indexes";
import { GridRegion } from "../../../types/puzzle/GridRegion";
import { applyMetricsDiff, emptyGestureMetrics, GestureMetrics } from "../../../utils/gestures";
import { JigsawGridPieceState } from "./JigsawGridState";
import { CellsMap } from "../../../types/puzzle/CellsMap";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { JigsawPieceRegion } from "./JigsawPieceRegion";

export const getJigsawPieces = (
    puzzle: PuzzleDefinition<JigsawPTM>,
    getCenter: (piece: Omit<JigsawPieceInfo, "center">) => Position,
): { pieces: JigsawPieceInfo[]; otherCells: Position[] } => {
    const {
        regions = [],
        gridSize: { rowsCount, columnsCount },
        importOptions,
        inactiveCells = [],
    } = puzzle;

    let regionCells = regions.map(getRegionCells);

    let otherCells = new PositionSet(
        indexes(rowsCount).flatMap((top) => indexes(columnsCount).map((left) => ({ top, left }))),
    ).bulkRemove(regionCells.flat());

    if (importOptions?.stickyRegion) {
        const otherActiveCells = otherCells
            .bulkRemove(inactiveCells)
            .filter((cell) => isStickyRegionCell(puzzle, cell));
        otherCells = otherCells.bulkRemove(otherActiveCells.items);

        if (otherActiveCells.size) {
            regionCells.push(otherActiveCells.items);
        }

        regionCells = regionCells.filter(([cell]) => !isStickyRegionCell(puzzle, cell));
    }

    // TODO: other region creation modes

    const pieces: JigsawPieceInfo[] = regionCells.map((cells) => {
        const boundingRect = getRegionBoundingBox(cells, 1);

        const piece: Omit<JigsawPieceInfo, "center"> = {
            cells,
            boundingRect,
        };
        return {
            ...piece,
            center: getCenter(piece),
        };
    });

    return { pieces, otherCells: otherCells.items };
};

export const getJigsawRegionWithCache = (context: PuzzleContext<JigsawPTM>, index: number): JigsawPieceRegion => {
    return context.getCachedItem(`jigsawRegion[${index}]`, () => new JigsawPieceRegion(context, index));
};

export const getJigsawPieceIndexByCell = (puzzle: PuzzleDefinition<JigsawPTM>, cell: Position): number | undefined => {
    const index = puzzle.extension.pieces.findIndex(({ cells }) => arrayContainsPosition(cells, cell));
    return index >= 0 ? index : undefined;
};

export const getJigsawPieceIndexesByCell = (
    puzzle: PuzzleDefinition<JigsawPTM>,
    piecePositions: JigsawGridPieceState[],
    cell: Position,
) => {
    const index = getJigsawPieceIndexByCell(puzzle, cell);

    return index === undefined ? [] : getJigsawPieceIndexesByZIndex(piecePositions, piecePositions[index].zIndex);
};

export const normalizeJigsawDigit = (
    puzzle: PuzzleDefinition<JigsawPTM>,
    { digit, angle }: JigsawDigit,
): JigsawDigit => {
    angle = loop(angle, 360);
    if (angle >= 180 && isRotatableDigit(puzzle, digit)) {
        return {
            digit: rotateDigit(puzzle, digit, 180),
            angle: angle - 180,
        };
    }
    return { digit, angle };
};

export const rotateJigsawDigitByPiece = (
    { puzzle, gridExtension: { pieces } }: PuzzleContext<JigsawPTM>,
    data: JigsawDigit,
    cell: Position,
): JigsawDigit => {
    const regionIndex = getJigsawPieceIndexByCell(puzzle, cell);
    return regionIndex !== undefined
        ? normalizeJigsawDigit(puzzle, {
              digit: data.digit,
              angle: data.angle + pieces[regionIndex].angle,
          })
        : data;
};

export const getActiveJigsawPieceZIndex = (pieces: JigsawGridPieceState[]) => {
    if (pieces.length === 0) {
        return 0;
    }
    const zIndexes = pieces.map(({ zIndex }) => zIndex);
    return Math.max(...zIndexes);
};

interface JigsawPiecesGroupItem {
    info: JigsawPieceInfo;
    position: JigsawGridPieceState;
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
    context: PuzzleContext<JigsawPTM>,
    positionOverrides?: JigsawGridPieceState[],
): JigsawPiecesGroup[] => {
    const pieces = context.puzzle.extension.pieces ?? [];

    const piecesByZIndex: Record<number, JigsawPiecesGroupItem[]> = {};

    for (const index of indexes(pieces.length)) {
        const info = pieces[index];
        const position = (positionOverrides ?? context.gridExtension.pieces)[index];
        const { zIndex } = position;

        piecesByZIndex[zIndex] = piecesByZIndex[zIndex] ?? [];
        piecesByZIndex[zIndex].push({
            info,
            position,
            region: positionOverrides
                ? new JigsawPieceRegion(context, index, positionOverrides)
                : getJigsawRegionWithCache(context, index),
            index,
        });
    }

    return Object.entries(piecesByZIndex).map(([zIndexStr, pieces]): JigsawPiecesGroup => {
        const boundingRect = getPointsBoundingBox(
            ...pieces.flatMap(({ info: { boundingRect }, region }) =>
                getRectPoints(boundingRect).map((point) => region.transformCoords?.(point) ?? point),
            ),
        );

        let groupCenter: Position;
        if (pieces.length === 1) {
            const {
                region,
                info: { center },
            } = pieces[0];
            groupCenter = region.transformCoords?.(center) ?? center;
        } else {
            groupCenter = getRectCenter(boundingRect);
        }

        return {
            zIndex: Number(zIndexStr),
            boundingRect,
            center: groupCenter,
            pieces,
            cells: pieces.flatMap(({ info: { cells } }) => cells),
            indexes: pieces.map(({ index }) => index),
        };
    });
};

export const moveJigsawPieceByGroupGesture = (
    rotationAxis: Position,
    gesture: GestureMetrics,
    piece: JigsawPieceInfo,
    prevPosition: Omit<JigsawGridPieceState, "zIndex">,
): PositionWithAngle => {
    const groupToPieceGesture = (gesture: GestureMetrics): GestureMetrics => ({
        ...gesture,
        x: gesture.x + rotationAxis.left - piece.center.left,
        y: gesture.y + rotationAxis.top - piece.center.top,
    });

    const { x, y, rotation } = applyMetricsDiff(
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

export const getJigsawPieceIndexesByZIndex = (pieces: JigsawGridPieceState[], zIndex?: number): number[] =>
    pieces
        .map((piece, index) => ({ piece, index }))
        .filter(({ piece }) => piece.zIndex === zIndex)
        .map(({ index }) => index);

export const getActiveJigsawPieceIndexes = (piecePositions: JigsawGridPieceState[]): number[] =>
    getJigsawPieceIndexesByZIndex(piecePositions, getActiveJigsawPieceZIndex(piecePositions));

export const sortJigsawPiecesByPosition = (pieces: JigsawPieceInfo[], piecePositions: Position[]) =>
    piecePositions
        .map(({ top, left }, index) => {
            const center = pieces[index].center;
            return {
                index,
                top: top + center.top,
                left: left + center.left,
            };
        })
        .sort((a, b) => Math.sign(a.top - b.top) || Math.sign(a.left - b.left) || a.index - b.index)
        .map(({ index }) => index);

export const getJigsawCellCenterAbsolutePosition = (region: GridRegion, { top, left }: Position, round: boolean) => {
    let center: Position = { top: top + 0.5, left: left + 0.5 };
    center = region.transformCoords?.(center) ?? center;
    if (round) {
        center = {
            top: roundToStep(center.top, 0.1),
            left: roundToStep(center.left, 0.1),
        };
    }
    return center;
};

export const getJigsawCellCenterAbsolutePositionsIndex = (groups: JigsawPiecesGroup[]) =>
    groups.map(({ pieces, indexes, zIndex }) => {
        const cells = pieces.flatMap(({ info: { cells }, region, index }) =>
            cells.map((cell) => ({
                pieceIndex: index,
                cell,
                position: getJigsawCellCenterAbsolutePosition(region, cell, true),
            })),
        );

        const cellsMap: CellsMap<(typeof cells)[0]> = {};
        for (const cell of cells) {
            const {
                position: { top, left },
            } = cell;
            cellsMap[top] = cellsMap[top] ?? {};
            cellsMap[top][left] = cell;
        }

        return {
            zIndex,
            pieceIndexes: indexes,
            cells,
            cellsMap,
        };
    });
