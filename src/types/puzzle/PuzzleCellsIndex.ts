import {
    getLineCenter,
    getLineVector,
    getVectorLength,
    Line,
    Position,
    PositionSet,
    stringifyPosition,
} from "../layout/Position";
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
import { comparer, computed, makeAutoObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { profiler } from "../../utils/profiler";

export class PuzzleCellsIndex<T extends AnyPTM> {
    public readonly allCells: CellInfo<T>[][];

    private readonly realCellPointMap: Record<string, PuzzleCellPointInfo> = {};
    private readonly borderLineMap: Record<string, Record<string, PuzzleCellBorderInfo>> = {};

    private get realCellCornerClones() {
        profiler.trace();

        const result: Record<string, Position[]> = {};

        const { puzzle, realCellPointMap } = this;

        for (const [key, info] of Object.entries(realCellPointMap)) {
            if (info.type !== CellPart.center) {
                const clones = puzzle.typeManager.getCellCornerClones?.(info.position, puzzle);

                if (clones?.length) {
                    result[key] = clones;
                }
            }
        }

        return result;
    }

    private get realCellCornerCellsMap() {
        profiler.trace();

        const result: Record<string, SetInterface<Position>> = {};

        const { realCellPointMap, realCellCornerClones } = this;

        for (const [key, info] of Object.entries(realCellPointMap)) {
            if (info.type === CellPart.center) {
                continue;
            }

            result[key] = PuzzlePositionSet.merge(
                info.ownCells,
                ...(realCellCornerClones[key] ?? []).map(
                    (position) => realCellPointMap[this.getPositionHash(position)].ownCells,
                ),
            );
        }

        return result;
    }

    private get borderLineDynamicInfoMap() {
        profiler.trace();

        const result: Record<string, Record<string, PuzzleCellBorderDynamicInfo>> = {};

        const { borderLineMap, realCellPointMap, realCellCornerClones } = this;

        for (const [startKey, map] of Object.entries(borderLineMap)) {
            const startInfo = realCellPointMap[startKey];
            const startClones = [startInfo.position, ...(realCellCornerClones[startKey] ?? [])];

            result[startKey] = {};

            for (const [endKey, borderLineInfo] of Object.entries(map)) {
                const endInfo = realCellPointMap[endKey];
                const endClones = [endInfo.position, ...(realCellCornerClones[endKey] ?? [])];

                const borderClones = startClones.flatMap((start) =>
                    endClones
                        .filter((end) => start !== startInfo.position || end !== endInfo.position)
                        .map((end) => borderLineMap[this.getPositionHash(start)]?.[this.getPositionHash(end)])
                        .filter(Boolean),
                );

                result[startKey][endKey] = {
                    clones: borderClones,
                    cells: PuzzlePositionSet.merge(
                        borderLineInfo.ownCells,
                        ...borderClones.map(({ ownCells }) => ownCells),
                    ),
                };
            }
        }

        return result;
    }

    public get allCellNeighbors() {
        profiler.trace();

        const {
            puzzle,
            allCells,
            realCellPointMap,
            borderLineMap,
            realCellCornerClones,
            realCellCornerCellsMap,
            borderLineDynamicInfoMap,
        } = this;

        return allCells.map((row) =>
            row.map((info) => {
                const result: CellNeighbors = {
                    neighbors: new PuzzlePositionSet(puzzle),
                    diagonalNeighbors: new PuzzlePositionSet(puzzle),
                };

                const {
                    position: cellPosition,
                    bounds: { borders },
                    cellTypeProps,
                } = info;

                if (!isInteractableCell(cellTypeProps)) {
                    return result;
                }

                borders.forEach((border) =>
                    border.forEach((point, index) => {
                        // Add neighbors by shared borders
                        const next = incrementArrayItemByIndex(border, index);

                        const borderInfo = borderLineMap[this.getPositionHash(point)][this.getPositionHash(next)];
                        const borderDynamicInfo =
                            borderLineDynamicInfoMap[this.getPositionHash(point)][this.getPositionHash(next)];
                        result.neighbors = result.neighbors.bulkAdd(
                            borderDynamicInfo.cells.remove(cellPosition).items.map((cell): PositionWithConnector => {
                                if (borderInfo.ownCells.contains(cell)) {
                                    return cell;
                                }

                                const borderClone = borderDynamicInfo.clones.find(({ ownCells }) =>
                                    ownCells.contains(cell),
                                );
                                if (!borderClone) {
                                    return cell;
                                }

                                return {
                                    ...cell,
                                    // TODO: the real line centers
                                    connector: [
                                        {
                                            start: info.center,
                                            end: getLineCenter(borderInfo.line),
                                        },
                                        {
                                            start: getLineCenter(borderClone.line),
                                            end: allCells[cell.top][cell.left].center,
                                        },
                                    ],
                                };
                            }),
                        );

                        // Add neighbors by shared corners
                        if (!puzzle.disableDiagonalCenterLines) {
                            const cornerInfo = realCellPointMap[this.getPositionHash(point)];

                            result.diagonalNeighbors = result.diagonalNeighbors.bulkAdd(
                                realCellCornerCellsMap[this.getPositionHash(point)]
                                    .remove(cellPosition)
                                    .items.map((cell): PositionWithConnector => {
                                        if (cornerInfo.ownCells.contains(cell)) {
                                            return cell;
                                        }

                                        const cornerClone = realCellCornerClones[this.getPositionHash(point)]
                                            ?.map((corner) => realCellPointMap[this.getPositionHash(corner)])
                                            ?.find(({ ownCells }) => ownCells.contains(cell));
                                        if (!cornerClone) {
                                            return cell;
                                        }

                                        return {
                                            ...cell,
                                            connector: [
                                                {
                                                    start: info.center,
                                                    end: cornerInfo.position,
                                                },
                                                {
                                                    start: cornerClone.position,
                                                    end: allCells[cell.top][cell.left].center,
                                                },
                                            ],
                                        };
                                    }),
                            );
                        }
                    }),
                );

                // Ensure that the regular neighbors are not duplicated as diagonal neighbors
                result.diagonalNeighbors = result.diagonalNeighbors.bulkRemove(result.neighbors.items);

                return result;
            }),
        );
    }

    private get realCellCornerNeighborsMap() {
        profiler.trace();

        const result: Record<string, PuzzleCellPointNeighbors> = {};

        const { puzzle, allCells, realCellPointMap } = this;

        for (const [key, info] of Object.entries(realCellPointMap)) {
            if (info.type === CellPart.center) {
                continue;
            }

            result[key] = {
                neighbors: new PuzzlePositionSet(puzzle),
                diagonalNeighbors: new PuzzlePositionSet(puzzle),
            };
        }

        // Add other border points as diagonal neighbors to the corner point
        if (!puzzle.disableDiagonalBorderLines) {
            allCells.forEach((row) =>
                row.forEach((info) => {
                    const {
                        bounds: { borders },
                        cellTypeProps,
                    } = info;

                    if (!isInteractableCell(cellTypeProps)) {
                        return;
                    }

                    borders.forEach((border) =>
                        border.forEach((point, index) => {
                            const info = result[this.getPositionHash(point)];
                            info.diagonalNeighbors = info.diagonalNeighbors.bulkAdd(
                                border.filter((_, index2) => {
                                    const indexDiff = Math.abs(index2 - index);
                                    return indexDiff > 1 && indexDiff < border.length - 1;
                                }),
                            );
                        }),
                    );
                }),
            );
        }

        // Calculate neighbors for corner points
        allCells.forEach((row) =>
            row.forEach((info) => {
                for (const { line } of Object.values(info.borderSegments)) {
                    const start = line[0];
                    const end = line[line.length - 1];

                    const startInfo = result[this.getPositionHash(start)];
                    startInfo.neighbors = startInfo.neighbors.add(end);
                    const endInfo = result[this.getPositionHash(end)];
                    endInfo.neighbors = endInfo.neighbors.add(start);
                }
            }),
        );

        return result;
    }

    private get realCellCenterNeighborsMap() {
        profiler.trace();

        const result: Record<string, PuzzleCellPointNeighbors> = {};

        const { puzzle, allCells, realCellPointMap, allCellNeighbors } = this;

        for (const [key, info] of Object.entries(realCellPointMap)) {
            if (info.type === CellPart.center) {
                result[key] = {
                    neighbors: new PuzzlePositionSet(puzzle),
                    diagonalNeighbors: new PuzzlePositionSet(puzzle),
                };
            }
        }

        allCells.forEach((row) =>
            row.forEach((info) => {
                const { position: cellPosition, center, cellTypeProps } = info;

                if (!isInteractableCell(cellTypeProps)) {
                    return;
                }

                // Set center point's neighbors by cell's neighbors
                const centerInfo = result[this.getPositionHash(center)];
                const cellNeighbors = allCellNeighbors[cellPosition.top][cellPosition.left];
                centerInfo.neighbors = centerInfo.neighbors.set(
                    cellNeighbors.neighbors.items.map(({ top, left, connector }) => ({
                        ...allCells[top][left].center,
                        connector,
                    })),
                );
                centerInfo.diagonalNeighbors = centerInfo.diagonalNeighbors.set(
                    cellNeighbors.diagonalNeighbors.items.map(({ top, left, connector }) => ({
                        ...allCells[top][left].center,
                        connector,
                    })),
                );
            }),
        );

        return result;
    }

    public getCellBorderSegmentNeighbors = computedFn(function getCellBorderSegmentNeighbors(
        this: PuzzleCellsIndex<T>,
        top: number,
        left: number,
    ) {
        const result: Record<string, SetInterface<Position>> = {};

        const { borderLineDynamicInfoMap, allCells } = this;
        const info = allCells[top][left];

        for (const [lineKey, { line }] of Object.entries(info.borderSegments)) {
            const [start, branch] = line;
            const startKey = this.getPositionHash(start);
            const branchKey = this.getPositionHash(branch);

            result[lineKey] = borderLineDynamicInfoMap[startKey][branchKey].cells.remove(info.position);
        }

        return result;
    });

    constructor(public readonly puzzle: PuzzleDefinition<T>) {
        makeAutoObservable<typeof this, "realCellPointMap" | "borderLineMap" | "realCellCornerClones">(this, {
            // read-only fields:
            puzzle: false,
            allCells: false,
            realCellPointMap: false,
            borderLineMap: false,
            // dynamic fields:
            realCellCornerClones: computed({ equals: comparer.structural }),
        });

        const {
            typeManager: { transformCoords = (coords: Position) => coords, isNonLinearTransformCoords },
            gridSize: { rowsCount, columnsCount },
            customCellBounds = {},
        } = puzzle;

        const inactiveCellsIndex = new PositionSet(puzzle.inactiveCells ?? []);

        // Init all cell infos
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
                    ownCells: new PuzzlePositionSet(puzzle, [cellPosition]),
                    cell: cellPosition,
                    type: CellPart.center,
                };

                // Init corner points
                borders.forEach((border) =>
                    border.forEach((point) => {
                        const pointKey = this.getPositionHash(point);

                        const pointInfo = (this.realCellPointMap[pointKey] = this.realCellPointMap[pointKey] || {
                            position: point,
                            ownCells: new PuzzlePositionSet(puzzle),
                            cell: cellPosition,
                            type: (puzzle.mergeGridLines ?? areCustomBounds) ? CellPart.border : CellPart.corner,
                        });
                        pointInfo.ownCells = pointInfo.ownCells.add(cellPosition);
                    }),
                );

                // Init border lines
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
                                ownCells: new PuzzlePositionSet(puzzle),
                            });
                            borderLineInfo.ownCells = borderLineInfo.ownCells.add(cellPosition);
                        }

                        // TODO: adjust for clones
                        if (Object.keys(borderLineStartMap).length > 2) {
                            const pointInfo = this.realCellPointMap[pointKey];
                            pointInfo.type = CellPart.corner;
                        }
                    }),
                );
            }),
        );

        // Init cell border segments
        for (const [startKey, info] of Object.entries(this.realCellPointMap)) {
            const { type, position: start } = info;

            if (type !== CellPart.corner) {
                continue;
            }

            for (const [
                branchKey,
                {
                    line: { end: branch },
                    ownCells,
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

                    for (const cell of ownCells.items) {
                        this.allCells[cell.top][cell.left].borderSegments[lineKey] = {
                            line,
                            center,
                            halves: [
                                [...line.slice(0, centerIndex + 1), center],
                                [center, ...line.slice(centerIndex + 1)],
                            ],
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

    isOutsideCornerPoint(corner: Position): boolean {
        const key = this.getPositionHash(corner);

        // Point is outside when it has more connected lines than connected cells.
        return this.realCellCornerCellsMap[key]?.size !== this.realCellCornerNeighborsMap[key]?.neighbors.size;
    }

    getPath({ start, end }: Line, color?: CellColorValue): LineWithColor[] {
        const startKey = this.getPositionHash(start);
        const endKey = this.getPositionHash(end);

        interface Segment {
            point: Position;
            prevPoint: Position;
            lines: LineWithColor[];
        }

        const map: Record<string, Segment> = {
            [startKey]: {
                prevPoint: start,
                point: start,
                lines: [],
            },
        };
        const queue = new PrioritizedQueue([start]);
        while (!queue.isEmpty() && map[endKey] === undefined) {
            const position = queue.shift()!;
            const positionKey = this.getPositionHash(position);

            const info = this.realCellCenterNeighborsMap[positionKey] ?? this.realCellCornerNeighborsMap[positionKey];
            if (!info) {
                console.warn(`Didn't find point info by key: ${stringifyPosition(position)}`);
                continue;
            }

            for (const next of this.realCellCornerClones[positionKey] ?? []) {
                const nextKey = this.getPositionHash(next);

                if (map[nextKey] === undefined) {
                    map[nextKey] = {
                        prevPoint: position,
                        point: next,
                        lines: [],
                    };
                    queue.push(0, next);
                }
            }

            for (const next of info.neighbors.items) {
                const nextKey = this.getPositionHash(next);

                if (map[nextKey] === undefined) {
                    map[nextKey] = {
                        prevPoint: position,
                        point: next,
                        lines: next.connector?.map((line) => ({ ...line, color })) ?? [
                            {
                                start: position,
                                end: next,
                                color,
                            },
                        ],
                    };

                    const borderSegment = this.borderLineDynamicInfoMap[positionKey]?.[nextKey];
                    if (borderSegment?.clones?.length) {
                        map[nextKey].lines.push(...borderSegment.clones.map(({ line }) => ({ ...line, color })));
                    }

                    queue.push(2, next);
                }
            }

            for (const next of info.diagonalNeighbors.items) {
                const nextKey = this.getPositionHash(next);

                if (map[nextKey] === undefined) {
                    map[nextKey] = {
                        prevPoint: position,
                        point: next,
                        lines: next.connector?.map((line) => ({ ...line, color })) ?? [
                            {
                                start: position,
                                end: next,
                                color,
                            },
                        ],
                    };

                    queue.push(3, next);
                }
            }
        }

        const points: Segment[] = [];
        for (
            let position: Segment | undefined = map[endKey];
            position && !this.isSamePosition(position.point, start);
            position = map[this.getPositionHash(position.prevPoint)]
        ) {
            points.unshift(position);
        }

        return points.flatMap(({ lines }) => lines).map((line) => normalizePuzzleLine(line, this.puzzle));
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
            start: convertToCellPoints ? start.info!.cell : start.point,
            end: convertToCellPoints ? end.info!.cell : end.point,
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
            const borderSegmentNeighbors = this.getCellBorderSegmentNeighbors(currentCell.top, currentCell.left);
            let connectedNeighbors = this.allCellNeighbors[currentCell.top][currentCell.left].neighbors;

            for (const [key, { line }] of Object.entries(cellInfo.borderSegments)) {
                if (lines.contains({ start: line[0], end: line[line.length - 1] })) {
                    connectedNeighbors = connectedNeighbors.bulkRemove(borderSegmentNeighbors[key].items);
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

                    for (const { top: top2, left: left2 } of this.allCellNeighbors[top][left].neighbors.items) {
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

interface PositionWithConnector extends Position {
    connector?: Line[];
}

export interface PuzzleCellPointInfo {
    position: Position;
    ownCells: SetInterface<Position>;
    // The main cell of the point - relevant only for the center points
    cell: Position;
    type: CellPart;
}

export interface PuzzleCellPointNeighbors {
    neighbors: SetInterface<PositionWithConnector>;
    diagonalNeighbors: SetInterface<PositionWithConnector>;
}

export interface PuzzleCellBorderInfo {
    line: Line;
    ownCells: SetInterface<Position>;
}

export interface PuzzleCellBorderDynamicInfo {
    cells: SetInterface<Position>;
    clones: PuzzleCellBorderInfo[];
}

export interface PuzzleCellBorderSegmentInfo {
    line: Position[];
    center: Position;
    halves: [Position[], Position[]];
}

export interface CellInfo<T extends AnyPTM> {
    position: Position;
    bounds: CustomCellBounds;
    getTransformedBounds: (context: PuzzleContext<T>) => TransformedCustomCellBounds;
    areCustomBounds: boolean;
    center: Position;
    borderSegments: Record<string, PuzzleCellBorderSegmentInfo>;
    isActive: boolean;
    cellTypeProps: CellTypeProps<T>;
}

export interface CellNeighbors {
    neighbors: SetInterface<PositionWithConnector>;
    diagonalNeighbors: SetInterface<PositionWithConnector>;
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
