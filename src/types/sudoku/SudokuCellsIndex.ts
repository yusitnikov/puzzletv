import {Line, Position, stringifyPosition} from "../layout/Position";
import {
    getIsSamePuzzleLine,
    getIsSamePuzzlePosition,
    getPuzzleLineHasher,
    getPuzzlePositionHasher,
    normalizePuzzleLine,
    PuzzleDefinition
} from "./PuzzleDefinition";
import {indexes} from "../../utils/indexes";
import {getRectPoints, Rect} from "../layout/Rect";
import {CustomCellBounds} from "./CustomCellBounds";
import {CellPart} from "./CellPart";
import {HashSet, SetInterface} from "../struct/Set";

export class SudokuCellsIndex<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
    private readonly allCells: CellInfo[][];

    private readonly realCellPointMap: Record<string, SudokuCellPointInfo> = {};
    private readonly borderLineMap: Record<string, Record<string, SudokuCellBorderInfo>> = {};

    constructor(private readonly puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>) {
        const {
            fieldSize: {rowsCount, columnsCount},
            customCellBounds = {},
        } = puzzle;

        // Init all cell infos (neighbors are empty at this point)
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
                areCustomBounds: customBounds !== undefined,
                center: {
                    top: bounds.userArea.top + bounds.userArea.height / 2,
                    left: bounds.userArea.left + bounds.userArea.width / 2,
                },
                neighbors: new HashSet<Position>([], this.positionHasher),
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
                cells: new HashSet<Position>([cellPosition], this.positionHasher),
                type: CellPart.center,
                neighbors: new HashSet<Position>([], this.positionHasher),
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
                        cells: new HashSet<Position>([], this.positionHasher),
                    });
                    borderLineInfo.cells = borderLineInfo.cells.add(cellPosition);
                }

                const pointInfo = (this.realCellPointMap[pointKey] = this.realCellPointMap[pointKey] || {
                    position: point,
                    cells: new HashSet<Position>([], this.positionHasher),
                    type: areCustomBounds ? CellPart.border : CellPart.corner,
                    neighbors: new HashSet<Position>([], this.positionHasher),
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

        // Calculate neighbors for corners
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
                    nextKey = new HashSet(Object.keys(nextBorders))
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
                } else {
                    console.warn(`Failed to finish border: ${stringifyPosition(start)}->${stringifyPosition(branch)}`);
                }
            }
        }
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

    private get lineHasher() {
        return getPuzzleLineHasher(this.puzzle);
    }

    private getLineHash(line: Line) {
        return this.lineHasher(line);
    }

    private get isSameLine() {
        return getIsSamePuzzleLine(this.puzzle);
    }
    //endregion
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

export interface CellInfo {
    position: Position;
    bounds: CustomCellBounds;
    areCustomBounds: boolean;
    center: Position;
    neighbors: SetInterface<Position>;
}
