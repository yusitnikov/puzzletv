import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { Constraint } from "../../../types/puzzle/Constraint";
import { SlideAndSeekPTM } from "../types/SlideAndSeekPTM";
import { CellsMap, processCellsMaps } from "../../../types/puzzle/CellsMap";
import { SlideAndSeekShape } from "../types/SlideAndSeekShape";
import { indexes } from "../../../utils/indexes";
import { Line, PositionSet } from "../../../types/layout/Position";
import { settings } from "../../../types/layout/Settings";
import { loop } from "../../../utils/math";
import { errorResultCheck, notFinishedResultCheck, successResultCheck } from "../../../types/puzzle/PuzzleResultCheck";

const debug = (...args: any[]) => {
    if (settings.debugSolutionChecker.get()) {
        console.log("slide & seek debug:", ...args);
    }
};

interface ShapeInfo extends SlideAndSeekShape {
    type: "shape";
    actualLength: number;
}
interface PathInfo {
    type: "path";
}

export const SlideAndSeekValidationConstraint = <T extends AnyPTM>(
    givenShapes: CellsMap<SlideAndSeekShape>,
    givenBorders: PositionSet,
    emptyCells: PositionSet,
): Constraint<SlideAndSeekPTM<T>> => ({
    name: "slide & seek",
    cells: [],
    props: undefined,
    isValidPuzzle(_lines, _digits, _regionCells, context) {
        const { rowsCount, columnsCount } = context.puzzle.gridSize;

        const finalShapes = processCellsMaps<SlideAndSeekShape, ShapeInfo | PathInfo>(
            ([constraint]) => ({ type: "shape", ...constraint, actualLength: 0 }),
            [givenShapes],
        );

        for (const segment of context.centerLineSegments) {
            if (segment.isBranching || segment.isLoop) {
                debug("branch/loop");
                return errorResultCheck();
            }

            const normalizedPoints = segment.points.map(({ top, left }) => ({ top: top - 0.5, left: left - 0.5 }));

            const shapePoints = normalizedPoints
                .map((point, index) => ({ point, index }))
                .filter(({ point: { top, left } }) => givenShapes[top]?.[left]);

            if (shapePoints.length !== 1) {
                debug(`line touching wrong number of shapes - ${shapePoints.length}`);
                return errorResultCheck();
            }

            const [{ index: startIndex, point: start }] = shapePoints;
            const endIndex = normalizedPoints.length - 1 - startIndex;
            const end = normalizedPoints[endIndex];
            if (startIndex !== 0 && endIndex !== 0) {
                debug("line touching a shape mid-path");
                return errorResultCheck();
            }

            const constraint = finalShapes[start.top][start.left] as ShapeInfo;
            for (const { top, left } of normalizedPoints) {
                finalShapes[top] ??= {};
                finalShapes[top][left] = { type: "path" };
            }
            finalShapes[end.top][end.left] = {
                ...constraint,
                actualLength: normalizedPoints.length - 1,
            };
        }

        let finished = true;
        let broken = false;

        for (const top of indexes(rowsCount)) {
            for (const left of indexes(columnsCount)) {
                const cellName = `R${top + 1}C${left + 1}`;

                const shape = finalShapes[top]?.[left];
                if (!shape) {
                    if (!emptyCells.contains({ top, left })) {
                        debug(`empty cell ${cellName}`);
                        finished = false;
                    }

                    continue;
                }

                if (shape.type === "path") {
                    continue;
                }

                if (shape.pathLength !== undefined && shape.actualLength !== shape.pathLength) {
                    debug(`wrong path length at ${cellName}: expected ${shape.pathLength}, got ${shape.actualLength}`);
                    if (shape.actualLength > shape.pathLength) {
                        return errorResultCheck();
                    }
                    broken = true;
                    continue;
                }

                if (shape.mustMove && shape.actualLength === 0) {
                    debug(`shape at ${cellName} must move`);
                    broken = true;
                    continue;
                }

                for (const [dx, dy] of [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                ]) {
                    for (
                        let top2 = top + dy, left2 = left + dx;
                        top2 >= 0 && top2 < rowsCount && left2 >= 0 && left2 < columnsCount;
                        top2 += dy, left2 += dx
                    ) {
                        const shape2 = finalShapes[top2]?.[left2];
                        if (shape2?.type === "shape") {
                            if (shape2.shapeKey === shape.shapeKey) {
                                debug(`shape at ${cellName} sees same shape at R${top2 + 1}C${left2 + 1}`);
                                broken = true;
                                continue;
                            }
                            break;
                        }
                    }
                }
            }
        }

        return !finished ? notFinishedResultCheck() : broken ? errorResultCheck() : successResultCheck(context);
    },
    getInvalidUserLines(lines, _digits, _regionCells, context, isFinalCheck): Line[] {
        const { fogVisibleCells } = context;

        return lines.items.filter(({ start, end }) => {
            if (Math.abs(end.top - start.top) + Math.abs(end.left - start.left) !== 1) {
                return true;
            }

            if (
                loop(start.top, 1) !== 0.5 ||
                loop(start.left, 1) !== 0.5 ||
                loop(end.top, 1) !== 0.5 ||
                loop(end.left, 1) !== 0.5
            ) {
                return false;
            }

            if (
                !isFinalCheck &&
                fogVisibleCells !== undefined &&
                !fogVisibleCells[start.top - 0.5]?.[start.left - 0.5] &&
                !fogVisibleCells[end.top - 0.5]?.[end.left - 0.5]
            ) {
                return false;
            }

            return givenBorders.contains({
                top: (start.top + end.top) / 2,
                left: (start.left + end.left) / 2,
            });
        });
    },
});
