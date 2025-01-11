import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { AnyNumberPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import {
    DecorativeShapeProps,
    isEllipse,
    isRect,
} from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import { SlidableShapeConstraint } from "../constraints/SlidableShape";
import { Constraint } from "../../../types/sudoku/Constraint";
import { SlideAndSeekPTM } from "./SlideAndSeekPTM";
import { GivenDigitsMap, givenDigitsMapToArray } from "../../../types/sudoku/GivenDigitsMap";
import { TextConstraint } from "../../../components/sudoku/constraints/text/Text";
import { SlideAndSeekDigit, SlideAndSeekDigitSvgContent } from "../components/SlideAndSeekDigit";
import { DigitCellDataComponentType } from "../../default/components/DigitCellData";
import { SlideAndSeekValidationConstraint } from "../constraints/SlideAndSeekValidation";
import { SlideAndSeekShape } from "./SlideAndSeekShape";
import { isLine } from "../../../components/sudoku/constraints/line/Line";
import { PositionSet } from "../../../types/layout/Position";
import { indexes } from "../../../utils/indexes";

export const SlideAndSeekTypeManager = <T extends AnyNumberPTM>(
    baseTypeManager: SudokuTypeManager<T>,
): SudokuTypeManager<SlideAndSeekPTM<T>> => {
    const baseTypeManagerCast = baseTypeManager as unknown as SudokuTypeManager<SlideAndSeekPTM<T>>;

    return {
        ...baseTypeManagerCast,

        postProcessPuzzle(puzzle: PuzzleDefinition<SlideAndSeekPTM<T>>): typeof puzzle {
            puzzle = baseTypeManagerCast.postProcessPuzzle?.(puzzle) ?? puzzle;

            const { items } = puzzle;

            if (!Array.isArray(items)) {
                throw new Error("Only array items are supported in SlideAndSeekTypeManager");
            }

            type ShapeConstraint = Constraint<SlideAndSeekPTM<T>, DecorativeShapeProps>;
            const givenShapes: GivenDigitsMap<SlideAndSeekShape> = {};
            let givenBorders = new PositionSet();
            const shapesMap: Record<string, ShapeConstraint> = {};

            const getShapeKey = (item: ShapeConstraint, ignoreColor: boolean) =>
                JSON.stringify([
                    item.tags,
                    item.props,
                    ignoreColor ? "" : item.color,
                    isEllipse(item) && item.props.width === item.props.height ? 0 : item.angle,
                ]);

            const newItems = items.map((item) => {
                if (isLine(item)) {
                    for (let index = 0; index < item.cells.length - 1; index++) {
                        const start = item.cells[index],
                            end = item.cells[index + 1];
                        if (
                            start.top % 1 === 0.5 &&
                            end.left % 1 === 0.5 &&
                            Math.abs(end.top - start.top) + Math.abs(end.left - start.left) === 1
                        ) {
                            givenBorders = givenBorders.add({
                                top: (start.top + end.top) / 2 + 0.5,
                                left: (start.left + end.left) / 2 + 0.5,
                            });
                        }
                    }
                }

                if (item.cells.length === 1) {
                    const [{ top, left }] = item.cells;
                    if (top % 1 === 0 && left % 1 === 0 && (isRect(item) || isEllipse(item))) {
                        givenShapes[top] ??= {};
                        givenShapes[top][left] = {
                            shapeKey: getShapeKey(item, true),
                            mustMove: item.color?.startsWith("#000"),
                        };

                        shapesMap[getShapeKey(item, false)] = item;
                        return SlidableShapeConstraint(item, givenShapes);
                    }
                }

                return item;
            });

            for (const { data, position } of givenDigitsMapToArray(puzzle.initialDigits ?? {})) {
                newItems.push(TextConstraint([position], String(data)));

                const constraint = givenShapes[position.top]?.[position.left];
                if (constraint) {
                    constraint.pathLength = data;
                }
            }
            puzzle.initialDigits = undefined;

            // Find regions isolated by given borders
            const { rowsCount, columnsCount } = puzzle.fieldSize;
            const graph = indexes(rowsCount).map((top) =>
                indexes(columnsCount).map((left) => ({
                    top,
                    left,
                    cells: [{ top, left }],
                    hasConstraint: givenShapes[top]?.[left] !== undefined,
                })),
            );
            for (const [top, row] of graph.entries()) {
                for (const [left, region] of row.entries()) {
                    for (const [top2, left2] of [
                        [top + 1, left],
                        [top - 1, left],
                        [top, left + 1],
                        [top, left - 1],
                    ]) {
                        const region2 = graph[top2]?.[left2];
                        if (
                            region2 !== undefined &&
                            region2 !== region &&
                            !givenBorders.contains({ top: (top + top2) / 2 + 0.5, left: (left + left2) / 2 + 0.5 })
                        ) {
                            for (const cell of region2.cells) {
                                graph[cell.top][cell.left] = region;
                            }
                            region.cells.push(...region2.cells);
                            region.hasConstraint ||= region2.hasConstraint;
                        }
                    }
                }
            }

            const emptyCells = new PositionSet(
                graph.flatMap((row, top) =>
                    row
                        .filter((region, left) => region.top === top && region.left === left && !region.hasConstraint)
                        .flatMap(({ cells }) => cells),
                ),
            );

            const shapes = Object.values(shapesMap);

            newItems.push(SlideAndSeekValidationConstraint(givenShapes, givenBorders, emptyCells));

            return {
                ...puzzle,
                supportZero: true,
                allowEmptyCells: true,
                digitsCount: shapes.length,
                items: newItems,
                extension: {
                    ...puzzle.extension!,
                    shapes,
                },
            };
        },

        cellDataComponentType: DigitCellDataComponentType(1),
        cellDataDigitComponentType: {
            component: SlideAndSeekDigit,
            svgContentComponent: SlideAndSeekDigitSvgContent,
            widthCoeff: 1,
        },
    };
};
