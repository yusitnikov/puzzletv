import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { AnyNumberPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import {
    DecorativeShapeProps,
    isEllipse,
    isRect,
} from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import { SlidableShapeConstraint } from "../constraints/SlidableShape";
import { PositionSet } from "../../../types/layout/Position";
import { Constraint } from "../../../types/sudoku/Constraint";
import { SlideAndSeekPTM } from "./SlideAndSeekPTM";
import { givenDigitsMapToArray } from "../../../types/sudoku/GivenDigitsMap";
import { TextConstraint } from "../../../components/sudoku/constraints/text/Text";
import { SlideAndSeekDigit, SlideAndSeekDigitSvgContent } from "../components/SlideAndSeekDigit";
import { DigitCellDataComponentType } from "../../default/components/DigitCellData";

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

            let allSlidableCells = new PositionSet();
            const shapesMap: Record<string, Constraint<SlideAndSeekPTM<T>, DecorativeShapeProps>> = {};

            const newItems = items.map((item) => {
                if (item.cells.length === 1) {
                    const [{ top, left }] = item.cells;
                    if (top % 1 === 0 && left % 1 === 0 && (isRect(item) || isEllipse(item))) {
                        allSlidableCells = allSlidableCells.add({ top: top + 0.5, left: left + 0.5 });
                        const key = JSON.stringify([
                            item.tags,
                            item.props,
                            item.color,
                            isEllipse(item) && item.props.width === item.props.height ? 0 : item.angle,
                        ]);
                        shapesMap[key] = item;
                        return SlidableShapeConstraint(item, () => allSlidableCells);
                    }
                }

                return item;
            });

            for (const { data, position } of givenDigitsMapToArray(puzzle.initialDigits ?? {})) {
                newItems.push(TextConstraint([position], String(data)));
            }
            puzzle.initialDigits = undefined;

            const shapes = Object.values(shapesMap);

            return {
                ...puzzle,
                supportZero: false,
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
