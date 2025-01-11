import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { Constraint } from "../../../types/sudoku/Constraint";
import { SlideAndSeekPTM } from "../types/SlideAndSeekPTM";
import { GivenDigitsMap, processGivenDigitsMaps } from "../../../types/sudoku/GivenDigitsMap";
import { SlideAndSeekShape } from "../types/SlideAndSeekShape";
import { indexes } from "../../../utils/indexes";
import { Line, PositionSet } from "../../../types/layout/Position";
import { settings } from "../../../types/layout/Settings";

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
    givenShapes: GivenDigitsMap<SlideAndSeekShape>,
    givenBorders: PositionSet,
    emptyCells: PositionSet,
): Constraint<SlideAndSeekPTM<T>> => ({
    name: "slide & seek",
    cells: [],
    props: undefined,
    isValidPuzzle(_lines, _digits, _regionCells, context): boolean {
        const { rowsCount, columnsCount } = context.puzzle.fieldSize;

        const finalShapes = processGivenDigitsMaps<SlideAndSeekShape, ShapeInfo | PathInfo>(
            ([constraint]) => ({ type: "shape", ...constraint, actualLength: 0 }),
            [givenShapes],
        );

        for (const segment of context.centerLineSegments) {
            if (segment.isBranching || segment.isLoop) {
                debug("branch/loop");
                return false;
            }

            const normalizedPoints = segment.points.map(({ top, left }) => ({ top: top - 0.5, left: left - 0.5 }));

            const shapePoints = normalizedPoints
                .map((point, index) => ({ point, index }))
                .filter(({ point: { top, left } }) => givenShapes[top]?.[left]);

            if (shapePoints.length !== 1) {
                debug(`line touching wrong number of shapes - ${shapePoints.length}`);
                return false;
            }

            const [{ index: startIndex, point: start }] = shapePoints;
            const endIndex = normalizedPoints.length - 1 - startIndex;
            const end = normalizedPoints[endIndex];
            if (startIndex !== 0 && endIndex !== 0) {
                debug("line touching a shape mid-path");
                return false;
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

        for (const top of indexes(rowsCount)) {
            for (const left of indexes(columnsCount)) {
                const cellName = `R${top + 1}C${left + 1}`;

                const shape = finalShapes[top]?.[left];
                if (!shape) {
                    if (emptyCells.contains({ top, left })) {
                        continue;
                    }

                    debug(`empty cell ${cellName}`);
                    return false;
                }

                if (shape.type === "path") {
                    continue;
                }

                if (shape.pathLength !== undefined && shape.actualLength !== shape.pathLength) {
                    debug(`wrong path length at ${cellName}: expected ${shape.pathLength}, got ${shape.actualLength}`);
                    return false;
                }

                if (shape.mustMove && shape.actualLength === 0) {
                    debug(`shape at ${cellName} must move`);
                    return false;
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
                                return false;
                            }
                            break;
                        }
                    }
                }
            }
        }

        return true;
    },
    getInvalidUserLines(lines): Line[] {
        return lines.items.filter(({ start, end }) => {
            if (Math.abs(end.top - start.top) + Math.abs(end.left - start.left) !== 1) {
                return true;
            }
            return (
                start.top % 1 === 0.5 &&
                start.left % 1 === 0.5 &&
                end.top % 1 === 0.5 &&
                end.left % 1 === 0.5 &&
                givenBorders.contains({
                    top: (start.top + end.top) / 2,
                    left: (start.left + end.left) / 2,
                })
            );
        });
    },
});
