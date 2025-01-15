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
import { GivenDigitsMap, givenDigitsMapToArray, processGivenDigitsMaps } from "../../../types/sudoku/GivenDigitsMap";
import { TextConstraint } from "../../../components/sudoku/constraints/text/Text";
import { SlideAndSeekDigit, SlideAndSeekDigitSvgContent } from "../components/SlideAndSeekDigit";
import { DigitCellDataComponentType } from "../../default/components/DigitCellData";
import { SlideAndSeekValidationConstraint } from "../constraints/SlideAndSeekValidation";
import { SlideAndSeekShape } from "./SlideAndSeekShape";
import { isLine } from "../../../components/sudoku/constraints/line/Line";
import { Position, PositionSet } from "../../../types/layout/Position";
import { indexes } from "../../../utils/indexes";
import { ColorsImportMode } from "../../../types/sudoku/PuzzleImportOptions";
import { PortalConstraint } from "../constraints/Portal";
import { resolveCellColorValue } from "../../../types/sudoku/CellColor";
import { PuzzleLine } from "../../../types/sudoku/PuzzleLine";

export const SlideAndSeekTypeManager = <T extends AnyNumberPTM>(
    baseTypeManager: SudokuTypeManager<T>,
): SudokuTypeManager<SlideAndSeekPTM<T>> => {
    const baseTypeManagerCast = baseTypeManager as unknown as SudokuTypeManager<SlideAndSeekPTM<T>>;

    const extraPuzzleLines: PuzzleLine[] = [];

    return {
        ...baseTypeManagerCast,

        colorsImportMode: ColorsImportMode.Initials,

        postProcessPuzzle(puzzle: PuzzleDefinition<SlideAndSeekPTM<T>>): typeof puzzle {
            puzzle = baseTypeManagerCast.postProcessPuzzle?.(puzzle) ?? puzzle;

            const { items, initialColors = {} } = puzzle;

            if (!Array.isArray(items)) {
                throw new Error("Only array items are supported in SlideAndSeekTypeManager");
            }
            if (typeof initialColors !== "object") {
                throw new Error("Only object initialColors are supported in SlideAndSeekTypeManager");
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

            const portalsByPosition = processGivenDigitsMaps(
                ([colors]) => (colors.length === 1 ? resolveCellColorValue(colors[0]) : undefined),
                [initialColors],
            );
            let letterChar = "A".charCodeAt(0);
            const portalsByColor: Record<string, { cells: Position[]; letter: string }> = {};
            for (const { data: color, position } of givenDigitsMapToArray(portalsByPosition)) {
                const portals = (portalsByColor[color] ??= { cells: [], letter: String.fromCharCode(letterChar++) });
                portals.cells.push({ top: position.top + 0.5, left: position.left + 0.5 });
                if (portals.cells.length === 2) {
                    extraPuzzleLines.push({
                        start: portals.cells[0],
                        end: portals.cells[1],
                    });
                }

                newItems.unshift(PortalConstraint(position, color, portals.letter));
            }

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
                initialDigits: undefined,
                initialColors: undefined,
                items: newItems,
                extension: {
                    ...puzzle.extension!,
                    shapes,
                },
            };
        },

        getHiddenLines: () => extraPuzzleLines,

        cellDataComponentType: DigitCellDataComponentType(1),
        cellDataDigitComponentType: {
            component: SlideAndSeekDigit,
            svgContentComponent: SlideAndSeekDigitSvgContent,
            widthCoeff: 1,
        },
    };
};
