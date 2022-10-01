import {getLineVector, getVectorLength, Line, Position, stringifyPosition} from "../layout/Position";
import {
    getIsSamePuzzlePosition,
    getPuzzleLineHasher,
    getPuzzlePositionHasher,
    normalizePuzzleLine, normalizePuzzlePosition,
    PuzzleDefinition
} from "./PuzzleDefinition";
import {indexes} from "../../utils/indexes";
import {getRectPoints, Rect, transformRect} from "../layout/Rect";
import {CustomCellBounds, TransformedCustomCellBounds} from "./CustomCellBounds";
import {CellPart} from "./CellPart";
import {PlainValueSet, SetInterface} from "../struct/Set";
import {gameStateGetCurrentFieldState, ProcessedGameState} from "./GameState";
import {PuzzlePositionSet} from "./PuzzlePositionSet";
import {PuzzleLineSet} from "./PuzzleLineSet";
import {lazy} from "../../utils/lazy";
import {FieldState} from "./FieldState";

export class SudokuCellsIndex<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
    public readonly allCells: CellInfo[][];

    private readonly realCellPointMap: Record<string, SudokuCellPointInfo> = {};
    private readonly borderLineMap: Record<string, Record<string, SudokuCellBorderInfo>> = {};

    constructor(private readonly puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>) {
        const {
            typeManager: {
                transformCoords = coords => coords,
                getAdditionalNeighbors = () => [],
            },
            fieldSize: {rowsCount, columnsCount},
            customCellBounds = {},
        } = puzzle;

        // Init all cell infos (neighbors and border segments are empty at this point)
        this.allCells = indexes(rowsCount).map(top => indexes(columnsCount).map(left => {
            const naiveRect: Rect = {
                top,
                left,
                width: 1,
                height: 1,
            };

            const customBounds = customCellBounds?.[top]?.[left];
            const bounds: CustomCellBounds = customBounds || {
                borders: [getRectPoints(naiveRect)],
                userArea: naiveRect,
            };
            bounds.borders = bounds.borders.map(
                border => this.isSamePosition(border[0], border[border.length - 1])
                    ? border.slice(0, border.length - 1)
                    : border
            );

            return {
                position: {top, left},
                bounds,
                getTransformedBounds: (state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType) => {
                    const transformCoordsBound = (point: Position) => transformCoords(point, puzzle, state);

                    return {
                        borders: bounds.borders.map(border => border.map(transformCoordsBound)),
                        userArea: transformRect(bounds.userArea, transformCoordsBound),
                    };
                },
                areCustomBounds: customBounds !== undefined,
                center: {
                    top: bounds.userArea.top + bounds.userArea.height / 2,
                    left: bounds.userArea.left + bounds.userArea.width / 2,
                },
                neighbors: new PuzzlePositionSet(puzzle),
                borderSegments: {},
            };
        }));

        // Init all point infos (neighbors are empty at this point) and border lines
        this.allCells.forEach((row) => row.forEach((info) => {
            const {
                position: cellPosition,
                center,
                bounds: {borders},
                areCustomBounds,
            } = info;

            this.realCellPointMap[this.getPositionHash(center)] = {
                position: center,
                cells: new PuzzlePositionSet(puzzle, [cellPosition]),
                type: CellPart.center,
                neighbors: new PuzzlePositionSet(puzzle),
            };

            borders.forEach((border) => border.forEach((point, index) => {
                const pointKey = this.getPositionHash(point);

                const next = border[(index + 1) % border.length];
                const prev = border[(index + border.length - 1) % border.length];

                const borderLineStartMap = (this.borderLineMap[pointKey] = this.borderLineMap[pointKey] || {});
                for (const end of [next, prev]) {
                    const endKey = this.getPositionHash(end);
                    const borderLineInfo = (borderLineStartMap[endKey] = borderLineStartMap[endKey] || {
                        line: {start: point, end},
                        cells: new PuzzlePositionSet(puzzle),
                    });
                    borderLineInfo.cells = borderLineInfo.cells.add(cellPosition);
                }

                const pointInfo = (this.realCellPointMap[pointKey] = this.realCellPointMap[pointKey] || {
                    position: point,
                    cells: new PuzzlePositionSet(puzzle),
                    type: areCustomBounds ? CellPart.border : CellPart.corner,
                    neighbors: new PuzzlePositionSet(puzzle),
                });
                pointInfo.cells = pointInfo.cells.add(cellPosition);
                if (Object.keys(borderLineStartMap).length > 2) {
                    pointInfo.type = CellPart.corner;
                }
            }));
        }));

        // Calculate neighbors for cells and cell center points
        this.allCells.forEach((row) => row.forEach((info) => {
            const {
                position: cellPosition,
                center,
                bounds: {borders},
            } = info;

            info.neighbors = info.neighbors.toggleAll(
                getAdditionalNeighbors(cellPosition, puzzle),
                true
            );

            borders.forEach((border) => border.forEach((point, index) => {
                const next = border[(index + 1) % border.length];

                info.neighbors = info.neighbors.toggleAll(
                    this.borderLineMap[this.getPositionHash(point)][this.getPositionHash(next)]
                        .cells
                        .remove(cellPosition)
                        .items,
                    true
                );
            }));

            const centerInfo = this.realCellPointMap[this.getPositionHash(center)];
            centerInfo.neighbors = centerInfo.neighbors.set(
                info.neighbors.items.map(({top, left}) => this.allCells[top][left].center)
            );
        }));

        // Calculate neighbors for corners and cell border segments
        for (const [startKey, info] of Object.entries(this.realCellPointMap)) {
            const {type, position: start} = info;

            if (type !== CellPart.corner) {
                continue;
            }

            for (const [branchKey, {line: {end: branch}, cells}] of Object.entries(this.borderLineMap[startKey])) {
                let nextKey: string | undefined = branchKey;
                let next: Position | undefined = branch;
                const lineKeys = [startKey, branchKey];
                const line = [start, branch];

                while (nextKey !== undefined && this.realCellPointMap[nextKey].type === CellPart.border) {
                    const nextBorders: Record<string, SudokuCellBorderInfo> = this.borderLineMap[nextKey];
                    nextKey = new PlainValueSet(Object.keys(nextBorders))
                        .toggleAll(lineKeys, false)
                        .first();
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

                    const multiLine = indexes(line.length - 1).map(index => {
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
                    for (const {lineLength} of multiLine) {
                        length += lineLength;
                    }

                    let remainingLength = length / 2;
                    let center = start;
                    for (const {lineStart, lineVector, lineLength} of multiLine) {
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
                        break;
                    }

                    const lineKey = this.getLineHash({start, end: next});

                    for (const cell of cells.items) {
                        this.allCells[cell.top][cell.left].borderSegments[lineKey] = {
                            line,
                            center,
                            neighbors: cells.remove(cell),
                        };
                    }
                } else {
                    console.warn(`Failed to finish border: ${stringifyPosition(start)}->${stringifyPosition(branch)}`);
                }
            }
        }
    }

    getPointInfo(point: Position): SudokuCellPointInfo | undefined {
        return this.realCellPointMap[this.getPositionHash(point)];
    }

    getPath({start, end}: Line): Line[] {
        const startKey = this.getPositionHash(start);
        const endKey = this.getPositionHash(end);

        const map: Record<string, Position> = {[startKey]: start};
        const queue = [start];
        while (queue.length && map[endKey] === undefined) {
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
                    queue.push(next);
                }
            }
        }

        const points: Position[] = [];
        for (let position: Position | undefined = end; position && !this.isSamePosition(position, start); position = map[this.getPositionHash(position)]) {
            points.unshift(position);
        }

        return points.map((position, index) => normalizePuzzleLine({
            start: index ? points[index - 1] : start,
            end: position,
        }, this.puzzle));
    }

    getCenterLineSegments(lines: Line[]): SudokuMultiLine[] {
        const map: Record<string, SetInterface<Position>> = {};
        let remainingPoints: SetInterface<Position> = new PuzzlePositionSet(this.puzzle);

        for (const {start, end} of lines) {
            if (this.getPointInfo(start)?.type !== CellPart.center) {
                continue;
            }

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
                .map(({position}) => position)
        );

        const result: SudokuMultiLine[] = [];

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
                lines = lines.add({start: position, end: next});
                points.push(next);
                remainingPoints = remainingPoints.remove(next);
                position = next;
            }

            const queue = [position];
            while (queue.length) {
                const current = queue.shift()!;

                for (const next of map[this.getPositionHash(current)].items) {
                    lines = lines.add({start: current, end: next});
                    if (remainingPoints.contains(next)) {
                        points.push(next);
                        remainingPoints = remainingPoints.remove(next);
                        queue.push(next);
                    }
                }
            }

            result.push({
                lines: lines.items.map(line => normalizePuzzleLine(line, this.puzzle)),
                points: points.map(point => normalizePuzzlePosition(point, this.puzzle)),
                isLoop,
                isBranching,
            });
        }

        return result;
    }

    // region Custom regions
    getCustomRegionsByBorderLines(state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType) {
        const map: SudokuCustomRegionsMap = {
            regions: [],
            map: {},
        };

        const {lines} = gameStateGetCurrentFieldState(state);

        for (const [top, row] of this.allCells.entries()) {
            for (const left of row.keys()) {
                const cell: Position = {top, left};

                if (map.map[this.getPositionHash(cell)] === undefined) {
                    this.getCustomRegionByBorderLinesAtInternal(lines, cell, map);
                }
            }
        }

        return {
            regions: map.regions,
            getRegionByCell: (cell: Position) => {
                return map.map[this.getPositionHash(cell)];
            },
        };
    }

    getCustomRegionByBorderLinesAt(state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType, cell: Position) {
        const map: SudokuCustomRegionsMap = {
            regions: [],
            map: {},
        };

        const {lines} = gameStateGetCurrentFieldState(state);

        return this.getCustomRegionByBorderLinesAtInternal(lines, cell, map);
    }

    private getCustomRegionByBorderLinesAtInternal(
        lines: SetInterface<Line>,
        cell: Position,
        {regions, map}: SudokuCustomRegionsMap
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

            for (const {line, neighbors} of Object.values(cellInfo.borderSegments)) {
                if (lines.contains({start: line[0], end: line[line.length - 1]})) {
                    connectedNeighbors = connectedNeighbors.toggleAll(neighbors.items, false);
                }
            }

            queue = queue.toggleAll(connectedNeighbors.items.filter(neighbor => map[this.getPositionHash(neighbor)] === undefined), true);
        }

        return newRegion;
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

export class SudokuCellsIndexForState<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
    private currentFieldState: FieldState<CellType>;

    public readonly getCenterLineSegments = lazy(
        () => this.puzzleIndex.getCenterLineSegments(this.currentFieldState.lines.items)
    );

    public readonly getAllCells = lazy(
        () => this.puzzleIndex.allCells.map(row => row.map(({getTransformedBounds, ...cell}): CellInfoForState => ({
            ...cell,
            transformedBounds: getTransformedBounds(this.state),
        })))
    );

    constructor(
        private puzzleIndex: SudokuCellsIndex<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        private state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType,
    ) {
        this.currentFieldState = gameStateGetCurrentFieldState(state);
    }
}

export interface SudokuCellPointInfo {
    position: Position;
    cells: SetInterface<Position>;
    type: CellPart;
    neighbors: SetInterface<Position>;
}

export interface SudokuCellBorderInfo {
    line: Line;
    cells: SetInterface<Position>;
}

export interface SudokuCellBorderSegmentInfo {
    line: Position[];
    center: Position;
    neighbors: SetInterface<Position>;
}

export interface CellInfo {
    position: Position;
    bounds: CustomCellBounds;
    getTransformedBounds: (state: any) => TransformedCustomCellBounds;
    areCustomBounds: boolean;
    center: Position;
    neighbors: SetInterface<Position>;
    borderSegments: Record<string, SudokuCellBorderSegmentInfo>;
}

export interface CellInfoForState extends Omit<CellInfo, "getTransformedBounds"> {
    transformedBounds: TransformedCustomCellBounds;
}

interface SudokuCustomRegionsMap {
    regions: Position[][];
    map: Record<string, number>;
}

export interface SudokuMultiLine {
    lines: Line[];
    points: Position[];
    isLoop: boolean;
    isBranching: boolean;
}
