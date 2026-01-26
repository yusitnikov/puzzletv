import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { mergePuzzleItems, PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { LoopLineConstraint } from "../../../components/puzzle/constraints/loop-line/LoopLine";
import { CellPart } from "../../../types/puzzle/CellPart";
import { isEllipse } from "../../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { getAveragePosition } from "../../../types/layout/Position";
import { colorStrToRgb } from "../../../utils/color";
import { MasyuCircleConstraint } from "../constraints/MasyuCircle";

export const MasyuTypeManager = <T extends AnyPTM>(baseTypeManager: PuzzleTypeManager<T>): PuzzleTypeManager<T> => {
    const baseTypeManagerCast = baseTypeManager;

    return {
        ...baseTypeManagerCast,

        postProcessPuzzle(puzzle: PuzzleDefinition<T>): PuzzleDefinition<T> {
            puzzle = baseTypeManagerCast.postProcessPuzzle?.(puzzle) ?? puzzle;

            const { items } = puzzle;

            if (!Array.isArray(items)) {
                throw new Error("Only array items are supported in MasyuTypeManager");
            }

            return {
                ...puzzle,
                maxDigit: 0,
                disableColoring: true,
                hideDeleteButton: true,
                items: mergePuzzleItems<T>(items, [
                    ...items
                        .filter(isEllipse)
                        .map(({ color = "#000", cells }) => ({
                            white: colorStrToRgb(color).red > 128,
                            position: getAveragePosition(cells),
                        }))
                        .filter(({ position: { top, left } }) => top % 1 === 0 && left % 1 === 0)
                        .map(({ white, position }) => MasyuCircleConstraint<T>(position, white)),
                    LoopLineConstraint<T>(CellPart.center),
                ]),
            };
        },
    };
};
