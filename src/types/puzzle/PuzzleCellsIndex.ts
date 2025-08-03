import { getLineVector, getVectorLength, Line, Position, PositionSet, stringifyPosition } from "../layout/Position";
import {
    getIsSamePuzzlePosition,
    getPuzzleLineHasher,
    getPuzzlePositionHasher,
    normalizePuzzleLine,
    normalizePuzzlePosition,
    PuzzleDefinition,
} from "./PuzzleDefinition";
import { indexes } from "../../utils/indexes";
import { getRectPoints, Rect, transformRect } from "../layout/Rect";
import { CustomCellBounds, TransformedCustomCellBounds } from "./CustomCellBounds";
import { CellPart } from "./CellPart";
import { PlainValueSet, SetInterface } from "../struct/Set";
import { PuzzlePositionSet } from "./PuzzlePositionSet";
import { PuzzleLineSet } from "./PuzzleLineSet";
import { incrementArrayItemByIndex } from "../../utils/array";
import { CellColorValue } from "./CellColor";
import { LineWithColor } from "./LineWithColor";
import { PrioritizedQueue } from "../struct/PrioritizedQueue";
import { PuzzleContext } from "./PuzzleContext";
import { AnyPTM } from "./PuzzleTypeMap";
import { CellTypeProps, isInteractableCell } from "./CellTypeProps";

export class PuzzleCellsIndex<T extends AnyPTM> {
    public readonly allCells: CellInfo<T>[][];

    public readonly cache: Record<string, any> = {};

    private readonly realCellPointMap: Record<string, PuzzleCellPointInfo> = {};
    private readonly borderLineMap: Record<string, Record<string, PuzzleCellBorderInfo>> = {};

    constructor(public readonly puzzle: PuzzleDefinition<T>) {
        const {
            typeManager: {
                transformCoords = (coords: Position) => coords,
                isNonLinearTransformCoords,
                getAdditionalNeighbors = () => [],
            },
            gridSize: { rowsCount, columnsCount },
            customCellBounds = {},
            disableDiagonalCenterLines,
            disableDiagonalBorderLines,
        } = puzzle;

        const inactiveCellsIndex = new PositionSet(puzzle.inactiveCells ?? []);

        // Init all cell infos (neighbors and border segments are empty at this point)
        this.allCells = indexes(rowsCount).map((top) =>
            indexes(columnsCount).map((left) => {
                const naiveRect: Rect = {
                    top,
                    left,
                    width: 1,
                    height: 1,
                };

                const customBounds = customCellBounds?.[top]?.[left];
                let bounds: CustomCellBounds = customBounds || {
                    borders: [getRectPoints(naiveRect)],
                    userArea: naiveRect,
                };
                bounds = {
                    ...bounds,
                    borders: bounds.borders.map((border) =>
                        this.isSamePosition(border[0], border[border.length - 1])
                            ? border.slice(0, border.length - 1)
                            : border,
                    ),
                };

                let cellTypeProps = this.puzzle.typeManager.getCellTypeProps?.({ top, left }, this.puzzle) ?? {};
                let isActive = !inactiveCellsIndex.contains({ top, left });
                if (!isActive) {
                    cellTypeProps = {
                        ...cellTypeProps,
                        noInteraction: true,
                        noBorders: true,
                    };
                } else {
                    isActive = isInteractableCell(cellTypeProps);
                }

                return {
                    position: { top, left },
                    bounds,
                    getTransformedBounds: (context) => {
                        const transformCoordsBound = (point: Position) =>
                            isNonLinearTransformCoords ? transformCoords(point, context) : point;

                        return {
                            borders: bounds.borders.map((border) => border.map(transformCoordsBound)),
                            userArea: transformRect(bounds.userArea, transformCoordsBound),
                        };
                    },
                    areCustomBounds: customBounds !== undefined,
                    center: {
                        top: bounds.userArea.top + bounds.userArea.height / 2,
                        left: bounds.userArea.left + bounds.userArea.width / 2,
                    },
                    neighbors: new PuzzlePositionSet(puzzle),
                    diagonalNeighbors: new PuzzlePositionSet(puzzle),
                    borderSegments: {},
                    isActive,
                    cellTypeProps,
                };
            }),
        );

        // Init all point infos (neighbors are empty at this point) and border lines
        this.allCells.forEach((row) =>
            row.forEach((info) => {
                const {
                    position: cellPosition,
                    center,
                    bounds: { borders },
                    areCustomBounds,
                    cellTypeProps,
                } = info;

                if (!isInteractableCell(cellTypeProps)) {
                    return;
                }

                this.realCellPointMap[this.getPositionHash(center)] = {
                    position: center,
                    cells: new PuzzlePositionSet(puzzle, [cellPosition]),
                    type: CellPart.center,
                    neighbors: new PuzzlePositionSet(puzzle),
                    diagonalNeighbors: new PuzzlePositionSet(puzzle),
                };

                borders.forEach((border) =>
                    border.forEach((point, index) => {
                        const pointKey = this.getPositionHash(point);

                        const next = incrementArrayItemByIndex(border, index);
                        const prev = incrementArrayItemByIndex(border, index, -1);

                        const borderLineStartMap = (this.borderLineMap[pointKey] = this.borderLineMap[pointKey] || {});
                        for (const end of [next, prev]) {
                            const endKey = this.getPositionHash(end);
                            const borderLineInfo = (borderLineStartMap[endKey] = borderLineStartMap[endKey] || {
                                line: { start: point, end },
                                cells: new PuzzlePositionSet(puzzle),
                            });
                            borderLineInfo.cells = borderLineInfo.cells.add(cellPosition);
                        }

                        const pointInfo = (this.realCellPointMap[pointKey] = this.realCellPointMap[pointKey] || {
                            position: point,
                            cells: new PuzzlePositionSet(puzzle),
                            type: (puzzle.mergeGridLines ?? areCustomBounds) ? CellPart.border : CellPart.corner,
                            neighbors: new PuzzlePositionSet(puzzle),
                            diagonalNeighbors: new PuzzlePositionSet(puzzle),
                        });
                        pointInfo.cells = pointInfo.cells.add(cellPosition);
                        if (Object.keys(borderLineStartMap).length > 2) {
                            pointInfo.type = CellPart.corner;
                        }
                    }),
                );
            }),
        );

        // Calculate neighbors for cells and cell center points
        this.allCells.forEach((row) =>
            row.forEach((info) => {
                const {
                    position: cellPosition,
                    center,
                    bounds: { borders },
                    cellTypeProps,
                } = info;

                if (!isInteractableCell(cellTypeProps)) {
                    return;
                }

                // Add neighbors by type manager's special geometry
                info.neighbors = info.neighbors.bulkAdd(getAdditionalNeighbors(cellPosition, puzzle));
                // TODO: getAdditionalDiagonalNeighbors

                borders.forEach((border) =>
                    border.forEach((point, index) => {
                        // Add neighbors by shared borders
                        const next = incrementArrayItemByIndex(border, index);

                        info.neighbors = info.neighbors.bulkAdd(
                            this.borderLineMap[this.getPositionHash(point)][this.getPositionHash(next)].cells.remove(
                                cellPosition,
                            ).items,
                        );

                        // Add neighbors by shared corners
                        const cornerInfo = this.realCellPointMap[this.getPositionHash(point)];

                        if (!disableDiagonalCenterLines) {
                            info.diagonalNeighbors = info.diagonalNeighbors.bulkAdd(
                                cornerInfo.cells.remove(cellPosition).items,
                            );
                        }

                        // Add other border points as diagonal neighbors to the corner point
                        if (!disableDiagonalBorderLines) {
                            cornerInfo.diagonalNeighbors = cornerInfo.diagonalNeighbors.bulkAdd(
                                border.filter((_, index2) => {
                                    const indexDiff = Math.abs(index2 - index);
                                    return indexDiff > 1 && indexDiff < border.length - 1;
                                }),
                            );
                        }
                    }),
                );

                // Ensure that the regular neighbors are not duplicated as diagonal neighbors
                info.diagonalNeighbors = info.diagonalNeighbors.bulkRemove(info.neighbors.items);

                // Set center point's neighbors by cell's neighbors
                const centerInfo = this.realCellPointMap[this.getPositionHash(center)];
                centerInfo.neighbors = centerInfo.neighbors.set(
                    info.neighbors.items.map(({ top, left }) => this.allCells[top][left].center),
                );
                centerInfo.diagonalNeighbors = centerInfo.diagonalNeighbors.set(
                    info.diagonalNeighbors.items.map(({ top, left }) => this.allCells[top][left].center),
                );
            }),
        );

        // Calculate neighbors for corners and cell border segments
        for (const [startKey, info] of Object.entries(this.realCellPointMap)) {
            const { type, position: start } = info;

            if (type !== CellPart.corner) {
                continue;
            }

            for (const [
                branchKey,
                {
                    line: { end: branch },
                    cells,
                },
            ] of Object.entries(this.borderLineMap[startKey])) {
                let nextKey: string | undefined = branchKey;
                let next: Position | undefined = branch;
                const lineKeys = [startKey, branchKey];
                const line = [start, branch];

                while (nextKey !== undefined && this.realCellPointMap[nextKey].type === CellPart.border) {
                    const nextBorders: Record<string, PuzzleCellBorderInfo> = this.borderLineMap[nextKey];
                    nextKey = new PlainValueSet(Object.keys(nextBorders)).bulkRemove(lineKeys).first();
                    if (nextKey === undefined) {
                        next = undefined;
                    } else {
                        next = nextBorders[nextKey].line.end;
                        lineKeys.push(nextKey);
                        line.push(next);
                    }
                }

                if (next) {
                    info.neighbors = info.neighbors.add(next);

                    const multiLine = indexes(line.length - 1).map((index) => {
                        const linePart: Line = {
                            start: line[index],
                            end: line[index + 1],
                        };

                        const lineVector = getLineVector(linePart);

                        return {
                            lineStart: linePart.start,
                            lineVector,
                            lineLength: getVectorLength(lineVector),
                        };
                    });

                    let length = 0;
                    for (const { lineLength } of multiLine) {
                        length += lineLength;
                    }

                    let remainingLength = length / 2;
                    let center = start;
                    let centerIndex = 0;
                    for (const [lineIndex, { lineStart, lineVector, lineLength }] of multiLine.entries()) {
                        if (!lineLength) {
                            continue;
                        }

                        if (remainingLength > lineLength) {
                            remainingLength -= lineLength;
                            continue;
                        }

                        const coeff = remainingLength / lineLength;
                        center = {
                            top: lineStart.top + coeff * lineVector.top,
                            left: lineStart.left + coeff * lineVector.left,
                        };
                        centerIndex = lineIndex;
                        break;
                    }

                    const lineKey =
                        this.getLineHash({ start, end: next }) +
                        ":" +
                        this.getLineHash({ start, end: line[1] ?? next });

                    for (const cell of cells.items) {
                        this.allCells[cell.top][cell.left].borderSegments[lineKey] = {
                            line,
                            center,
                            halves: [
                                [...line.slice(0, centerIndex + 1), center],
                                [center, ...line.slice(centerIndex + 1)],
                            ],
                            neighbors: cells.remove(cell),
                        };
                    }
                } else {
                    console.warn(`Failed to finish border: ${stringifyPosition(start)}->${stringifyPosition(branch)}`);
                }
            }
        }
    }

    getPointInfo(point: Position): PuzzleCellPointInfo | undefined {
        return this.realCellPointMap[this.getPositionHash(point)];
    }

    getPath({ start, end }: Line, color?: CellColorValue): LineWithColor[] {
        const startKey = this.getPositionHash(start);
        const endKey = this.getPositionHash(end);

        const map: Record<string, Position> = { [startKey]: start };
        const queue = new PrioritizedQueue([start]);
        while (!queue.isEmpty() && map[endKey] === undefined) {
            const position = queue.shift()!;

            const info = this.realCellPointMap[this.getPositionHash(position)];
            if (!info) {
                console.warn(`Didn't find point info by key: ${stringifyPosition(position)}`);
                continue;
            }

            for (const next of info.neighbors.items) {
                const nextKey = this.getPositionHash(next);

                if (map[nextKey] === undefined) {
                    map[nextKey] = position;
                    queue.push(2, next);
                }
            }

            for (const next of info.diagonalNeighbors.items) {
                const nextKey = this.getPositionHash(next);

                if (map[nextKey] === undefined) {
                    map[nextKey] = position;
                    queue.push(3, next);
                }
            }
        }

        const points: Position[] = [];
        for (
            let position: Position | undefined = end;
            position && !this.isSamePosition(position, start);
            position = map[this.getPositionHash(position)]
        ) {
            points.unshift(position);
        }

        return points.map((position, index) =>
            normalizePuzzleLine(
                {
                    start: index ? points[index - 1] : start,
                    end: position,
                    color,
                },
                this.puzzle,
            ),
        );
    }

    getCenterLines(lines: Line[], convertToCellPoints: boolean): Line[] {
        return this.getLinesByType(lines, CellPart.center, convertToCellPoints);
    }

    getLinesByType(lines: Line[], type: CellPart, convertToCellPoints: boolean): Line[] {
        const linesWithPointInfo = lines
            .map(({ start, end }) => ({
                start: {
                    point: start,
                    info: this.getPointInfo(start),
                },
                end: {
                    point: end,
                    info: this.getPointInfo(end),
                },
            }))
            .filter(({ start: { info } }) => info?.type === type);

        return linesWithPointInfo.map(({ start, end }) => ({
            start: convertToCellPoints ? start.info!.cells.first()! : start.point,
            end: convertToCellPoints ? end.info!.cells.first()! : end.point,
        }));
    }

    getLineSegmentsByType(lines: Line[], type: CellPart): PuzzleMultiLine[] {
        const map: Record<string, SetInterface<Position>> = {};
        let remainingPoints: SetInterface<Position> = new PuzzlePositionSet(this.puzzle);

        for (const { start, end } of this.getLinesByType(lines, type, false)) {
            const startKey = this.getPositionHash(start);
            const endKey = this.getPositionHash(end);

            map[startKey] = (map[startKey] || new PuzzlePositionSet(this.puzzle)).add(end);
            map[endKey] = (map[endKey] || new PuzzlePositionSet(this.puzzle)).add(start);

            remainingPoints = remainingPoints.add(start).add(end);
        }

        remainingPoints = remainingPoints.set(
            remainingPoints.items
                .map((position) => ({
                    position,
                    count: map[this.getPositionHash(position)].size,
                }))
                .sort((a, b) => a.count - b.count)
                .map(({ position }) => position),
        );

        const result: PuzzleMultiLine[] = [];

        while (remainingPoints.size) {
            let position = remainingPoints.last()!;
            const isBranching = map[this.getPositionHash(position)].size > 2;
            let isLoop = false;
            if (!isBranching) {
                position = remainingPoints.first()!;
                isLoop = map[this.getPositionHash(position)].size === 2;
            }
            remainingPoints = remainingPoints.remove(position);

            let lines = new PuzzleLineSet(this.puzzle);
            const points = [position];

            if (!isBranching) {
                const next = map[this.getPositionHash(position)].first()!;
                lines = lines.add({ start: position, end: next });
                points.push(next);
                remainingPoints = remainingPoints.remove(next);
                position = next;
            }

            const queue = [position];
            while (queue.length) {
                const current = queue.shift()!;

                for (const next of map[this.getPositionHash(current)].items) {
                    lines = lines.add({ start: current, end: next });
                    if (remainingPoints.contains(next)) {
                        points.push(next);
                        remainingPoints = remainingPoints.remove(next);
                        queue.push(next);
                    }
                }
            }

            result.push({
                lines: lines.items.map((line) => normalizePuzzleLine(line, this.puzzle)),
                points: points.map((point) => normalizePuzzlePosition(point, this.puzzle)),
                isLoop,
                isBranching,
            });
        }

        return result;
    }

    getCellTypeProps(cell: Position): CellTypeProps<T> {
        return this.allCells[cell.top]?.[cell.left]?.cellTypeProps ?? {};
    }

    // region Custom regions
    // noinspection JSUnusedGlobalSymbols
    getCustomRegionsByBorderLines(lines: SetInterface<Line>) {
        const map: PuzzleCustomRegionsMap = {
            regions: [],
            map: {},
        };

        for (const [top, row] of this.allCells.entries()) {
            for (const left of row.keys()) {
                const cell: Position = { top, left };

                if (map.map[this.getPositionHash(cell)] === undefined) {
                    this.getCustomRegionByBorderLinesAtInternal(lines, cell, map);
                }
            }
        }

        // noinspection JSUnusedGlobalSymbols
        return {
            regions: map.regions,
            getRegionByCell: (cell: Position) => {
                return map.map[this.getPositionHash(cell)];
            },
        };
    }

    getCustomRegionByBorderLinesAt({ lines }: PuzzleContext<T>, cell: Position) {
        const map: PuzzleCustomRegionsMap = {
            regions: [],
            map: {},
        };

        return this.getCustomRegionByBorderLinesAtInternal(lines, cell, map);
    }

    private getCustomRegionByBorderLinesAtInternal(
        lines: SetInterface<Line>,
        cell: Position,
        { regions, map }: PuzzleCustomRegionsMap,
    ) {
        const newRegion: Position[] = [];
        const newRegionIndex = regions.length;
        regions.push(newRegion);

        let queue = new PuzzlePositionSet(this.puzzle, [cell]);
        while (queue.size) {
            const currentCell = queue.first()!;
            queue = queue.remove(currentCell);

            newRegion.push(currentCell);
            map[this.getPositionHash(currentCell)] = newRegionIndex;

            const cellInfo = this.allCells[currentCell.top][currentCell.left];
            let connectedNeighbors = cellInfo.neighbors;

            for (const { line, neighbors } of Object.values(cellInfo.borderSegments)) {
                if (lines.contains({ start: line[0], end: line[line.length - 1] })) {
                    connectedNeighbors = connectedNeighbors.bulkRemove(neighbors.items);
                }
            }

            queue = queue.bulkAdd(
                connectedNeighbors.items.filter((neighbor) => map[this.getPositionHash(neighbor)] === undefined),
            );
        }

        return newRegion;
    }

    splitUnconnectedRegions(regions: Position[][]): Position[][] {
        interface RegionInfo {
            index: number;
            id: number;
            cells: Position[];
        }

        const cellRegions = this.allCells.map((row) =>
            row.map(
                (): RegionInfo => ({
                    index: 0,
                    id: 0,
                    cells: [],
                }),
            ),
        );
        let autoIncrementId = 0;
        for (const [regionIndex, region] of regions.entries()) {
            for (const { top, left } of region) {
                if (cellRegions[top]) {
                    const info = (cellRegions[top][left] = {
                        index: regionIndex + 1,
                        id: ++autoIncrementId,
                        cells: [{ top, left }],
                    });

                    for (const { top: top2, left: left2 } of this.allCells[top][left].neighbors.items) {
                        const info2 = cellRegions[top2]?.[left2];
                        if (info2 && info2.index === info.index && info2.id !== info.id) {
                            info.cells.push(...info2.cells);
                            for (const { top: top3, left: left3 } of info2.cells) {
                                cellRegions[top3][left3] = info;
                            }
                        }
                    }
                }
            }
        }

        const newRegionsMap: Record<number, RegionInfo> = {};
        for (const row of cellRegions) {
            for (const info of row) {
                if (info.cells.length) {
                    newRegionsMap[info.id] = info;
                }
            }
        }

        return (
            Object.values(newRegionsMap)
                // preserve the original regions' order
                .sort((a, b) => a.index - b.index || a.id - b.id)
                .map(({ cells }) => cells)
        );
    }
    // endregion

    // region Internals
    private get positionHasher(): (position: Position) => string {
        return getPuzzlePositionHasher(this.puzzle);
    }

    private getPositionHash(position: Position) {
        return this.positionHasher(position);
    }

    private get isSamePosition(): (a: Position, b: Position) => boolean {
        return getIsSamePuzzlePosition(this.puzzle);
    }

    private get lineHasher(): (line: Line) => string {
        return getPuzzleLineHasher(this.puzzle);
    }

    private getLineHash(line: Line) {
        return this.lineHasher(line);
    }
    //endregion
}

export interface PuzzleCellPointInfo {
    position: Position;
    cells: SetInterface<Position>;
    type: CellPart;
    neighbors: SetInterface<Position>;
    diagonalNeighbors: SetInterface<Position>;
}

export interface PuzzleCellBorderInfo {
    line: Line;
    cells: SetInterface<Position>;
}

export interface PuzzleCellBorderSegmentInfo {
    line: Position[];
    center: Position;
    halves: [Position[], Position[]];
    neighbors: SetInterface<Position>;
}

export interface CellInfo<T extends AnyPTM> {
    position: Position;
    bounds: CustomCellBounds;
    getTransformedBounds: (context: PuzzleContext<T>) => TransformedCustomCellBounds;
    areCustomBounds: boolean;
    center: Position;
    neighbors: SetInterface<Position>;
    diagonalNeighbors: SetInterface<Position>;
    borderSegments: Record<string, PuzzleCellBorderSegmentInfo>;
    isActive: boolean;
    cellTypeProps: CellTypeProps<T>;
}

interface PuzzleCustomRegionsMap {
    regions: Position[][];
    map: Record<string, number>;
}

export interface PuzzleMultiLine {
    lines: Line[];
    points: Position[];
    isLoop: boolean;
    isBranching: boolean;
}
