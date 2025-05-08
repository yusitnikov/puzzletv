import {
    allDrawingModes,
    isValidFinishedPuzzleByEmbeddedSolution,
    PuzzleDefinition,
} from "../../types/puzzle/PuzzleDefinition";
import { RotatableCluesPTM } from "../../puzzleTypes/rotatable-clues/types/RotatableCluesPTM";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { RotatableCluesTypeManager } from "../../puzzleTypes/rotatable-clues/types/RotatableCluesTypeManager";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { createWheel } from "../../components/puzzle/constraints/wheel/Wheel";
import { createCellsMapFromArray } from "../../types/puzzle/CellsMap";
import { indexes } from "../../utils/indexes";
import { DisjointGroupsConstraint } from "../../types/puzzle/constraints/DisjointGroups";
import { translate } from "../../utils/translate";
import { errorResultCheck } from "../../types/puzzle/PuzzleResultCheck";

const U = undefined;

export const WheelsOnTheBus: PuzzleDefinition<RotatableCluesPTM<NumberPTM>> = {
    slug: "wheels-on-the-bus",
    noIndex: true,
    author: {
        [LanguageCode.en]: "Alaric Taqi A. (Crusader175)",
        [LanguageCode.ru]: "Аларик Таки А. (Crusader175)",
    },
    title: {
        [LanguageCode.en]: "Wheels on the Bus",
    },
    typeManager: RotatableCluesTypeManager({ baseTypeManager: DigitPuzzleTypeManager(), isEquivalentLoop: true }),
    gridSize: GridSize9,
    regions: Regions9,
    extension: {
        clues: [
            createWheel("R2C2", 3, U, 7),
            createWheel("R2C5", 2, 6, U, 1),
            createWheel("R2C8", 4, U, U, 8),
            createWheel("R5C2", 4, 5, 8),
            createWheel("R5C5", 3, 7),
            createWheel("R5C8", 2, U, 6),
            createWheel("R8C2", 2, U, U, 6),
            createWheel("R8C5", 4, 8),
            createWheel("R8C8", 3, 9, U, 7),
        ],
    },
    rules: () => (
        <>
            <RulesParagraph>Normal sudoku rules apply.</RulesParagraph>
            <RulesParagraph>
                Disjoint Groups: Cells in the same relative position in different boxes cannot contain the same digits.
            </RulesParagraph>
            <RulesParagraph>
                Wheels: Digits in a circle have to be placed in the same circular order in the four cells that are
                touched by the circle. The circle have to be rotated 90° clockwise N times from the current position. N
                is the digit in the cell inside the circle. Example: R2C8=6, then R1C8=8 and R2C9=4.
            </RulesParagraph>
        </>
    ),
    items: [DisjointGroupsConstraint(3)],
    allowDrawing: allDrawingModes,
    solution: createCellsMapFromArray([
        [8, 1, 5, 7, 6, 3, 9, 4, 2],
        [7, 6, 3, 2, 4, 9, 8, 5, 1],
        [2, 9, 4, 5, 1, 8, 6, 3, 7],
        [6, 8, 7, 4, 3, 1, 5, 2, 9],
        [5, 3, 2, 6, 9, 7, 4, 1, 8],
        [9, 4, 1, 8, 5, 2, 7, 6, 3],
        [3, 5, 8, 1, 7, 6, 2, 9, 4],
        [1, 7, 6, 9, 2, 4, 3, 8, 5],
        [4, 2, 9, 3, 8, 5, 1, 7, 6],
    ]),
    resultChecker: (context) => {
        const result = isValidFinishedPuzzleByEmbeddedSolution(context);
        if (result.isCorrectResult) {
            return result;
        }

        // The puzzle is wrong if all cells are fulfilled, but the digits are not right
        if (indexes(9).every((top) => indexes(9).every((left) => context.getCell(top, left)?.usersDigit))) {
            return errorResultCheck();
        }

        const {
            puzzle: { solution },
        } = context;
        if (
            [1, 4, 7].every((top) =>
                [1, 4, 7].every((left) => context.getCell(top, left)?.usersDigit === solution?.[top]?.[left]),
            )
        ) {
            return {
                isCorrectResult: false,
                isPending: true,
                forceShowResult: true,
                resultPhrase: translate({
                    [LanguageCode.en]: "Congratulations! You resolved the wheels correctly!",
                }),
            };
        }

        return result;
    },
};
