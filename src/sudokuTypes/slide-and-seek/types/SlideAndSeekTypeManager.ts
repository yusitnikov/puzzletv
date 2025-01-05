import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import { isEllipse, isRect } from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import { SlidableShapeConstraint } from "../constraints/SlidableShape";
import { PositionSet } from "../../../types/layout/Position";

export const SlideAndSeekTypeManager = <T extends AnyPTM>({
    ...baseTypeManager
}: SudokuTypeManager<T>): SudokuTypeManager<T> => ({
    ...baseTypeManager,

    postProcessPuzzle(puzzle: PuzzleDefinition<T>): typeof puzzle {
        puzzle = baseTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;

        const { items } = puzzle;

        if (!Array.isArray(items)) {
            throw new Error("Only array items are supported in SlideAndSeekTypeManager");
        }

        let allSlidableCells = new PositionSet();

        return {
            ...puzzle,
            digitsCount: 0,
            items: items.map((item) => {
                if (item.cells.length === 1) {
                    const [{ top, left }] = item.cells;
                    if (top % 1 === 0 && left % 1 === 0 && (isRect(item) || isEllipse(item))) {
                        allSlidableCells = allSlidableCells.add({ top: top + 0.5, left: left + 0.5 });
                        return SlidableShapeConstraint(item, () => allSlidableCells);
                    }
                }

                return item;
            }),
        };
    },
});
