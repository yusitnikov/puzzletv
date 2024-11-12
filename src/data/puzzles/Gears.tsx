import {allDrawingModes, PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {RotatableCluesPTM} from "../../sudokuTypes/rotatable-clues/types/RotatableCluesPTM";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {FieldSize9, Regions9} from "../../types/sudoku/FieldSize";
import {RotatableCluesSudokuTypeManager} from "../../sudokuTypes/rotatable-clues/types/RotatableCluesSudokuTypeManager";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {blueColor, greenColor, redColor} from "../../components/app/globals";
import {createRotatableClue} from "../../sudokuTypes/rotatable-clues/types/RotatableCluesPuzzleExtension";
import {KropkiDotConstraint} from "../../components/sudoku/constraints/kropki-dot/KropkiDot";

export const Gears: PuzzleDefinition<RotatableCluesPTM<NumberPTM>> = {
    slug: "gears-test",
    noIndex: true,
    author: {
        [LanguageCode.en]: "Clocksmith",
    },
    title: {
        [LanguageCode.en]: "Gears test",
    },
    typeManager: RotatableCluesSudokuTypeManager({baseTypeManager: DigitSudokuTypeManager(), isEquivalentLoop: false}),
    fieldSize: FieldSize9,
    regions: Regions9,
    extension: {
        clues: [
            createRotatableClue(
                "R3C3",
                1,
                redColor,
                [
                    KropkiDotConstraint("R3C3", "R3C4", false),
                ],
                -1,
            ),
            createRotatableClue(
                "R6C6",
                1.5,
                redColor,
                [
                    KropkiDotConstraint("R6C6", "R7C6", false),
                ],
                1,
                [
                    createRotatableClue(
                        "R6C4",
                        0.5,
                        greenColor,
                        [
                            KropkiDotConstraint("R6C4", "R7C4", true),
                        ],
                        -3,
                    ),
                    createRotatableClue(
                        ["R4C7", "R4C8"],
                        1,
                        greenColor,
                        [
                            KropkiDotConstraint("R4C6", "R4C7", true),
                        ],
                        -1.5,
                    ),
                    createRotatableClue(
                        ["R2C7", "R3C8"],
                        0.5,
                        blueColor,
                        [
                            KropkiDotConstraint("R2C8", "R3C8", false),
                        ],
                        3,
                    ),
                ],
            ),
        ],
    },
    rules: () => <>
        <RulesParagraph>Normal Sudoku rules apply.</RulesParagraph>
    </>,
    items: [
    ],
    allowDrawing: allDrawingModes,
};
