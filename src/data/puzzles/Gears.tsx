import { allDrawingModes, PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { RotatableCluesPTM } from "../../puzzleTypes/rotatable-clues/types/RotatableCluesPTM";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { RotatableCluesTypeManager } from "../../puzzleTypes/rotatable-clues/types/RotatableCluesTypeManager";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { blueColor, darkPurpleColor, greenColor, pinkColor, purpleColor } from "../../components/app/globals";
import { createRotatableClue } from "../../puzzleTypes/rotatable-clues/types/RotatableCluesPuzzleExtension";
import { KropkiDotConstraint } from "../../components/puzzle/constraints/kropki-dot/KropkiDot";
import { ArrowConstraint } from "../../components/puzzle/constraints/arrow/Arrow";
import { rgba } from "../../utils/color";
import { toDecorativeConstraint } from "../../types/puzzle/Constraint";
import { loop } from "../../utils/math";

const lighten = (color: string) => rgba(color, 0.5);

export const Gears: PuzzleDefinition<RotatableCluesPTM<NumberPTM>> = {
    slug: "gears-test",
    noIndex: true,
    author: {
        [LanguageCode.en]: "Clocksmith",
    },
    title: {
        [LanguageCode.en]: "Gears test",
    },
    typeManager: RotatableCluesTypeManager({
        baseTypeManager: DigitPuzzleTypeManager(),
        isEquivalentLoop: false,
    }),
    gridSize: GridSize9,
    regions: Regions9,
    extension: {
        clues: [
            createRotatableClue(
                "R3C3",
                0.5,
                lighten(greenColor),
                [ArrowConstraint("R2C3", ["R3C3", "R2C2"], true)],
                -4,
                [
                    createRotatableClue(["R4C3", "R5C3"], 1, lighten(blueColor), [], 2),
                    createRotatableClue(
                        "R7C3",
                        1.5,
                        lighten(purpleColor),
                        [
                            // Arrow UI
                            toDecorativeConstraint(
                                ArrowConstraint({ top: 6, left: -0.2 }, ["R7C3"], true, undefined, false, false),
                            ),
                            // Arrow validation
                            {
                                ...ArrowConstraint("R7C1", ["R7C3"], true),
                                component: undefined,
                                processRotatableCellsCoords: ({ pivot: { top, left } }, angle, cells) => {
                                    const isCircle = cells.length === 1;

                                    switch (loop(angle, 360)) {
                                        case 120:
                                            return isCircle
                                                ? [{ top: top - 2, left: left + 1 }]
                                                : [
                                                      { top: top - 1, left: left + 1 },
                                                      { top: top - 1, left },
                                                      { top, left },
                                                  ];
                                        case 240:
                                            return isCircle
                                                ? [{ top: top + 2, left: left + 1 }]
                                                : [
                                                      { top: top + 1, left: left + 1 },
                                                      { top: top + 1, left },
                                                      { top, left },
                                                  ];
                                        case 0:
                                        default:
                                            return cells;
                                    }
                                },
                            },
                        ],
                        -4 / 3,
                    ),
                    createRotatableClue("R7C5", 0.5, lighten(darkPurpleColor), [], 4),
                ],
            ),
            createRotatableClue("R2C4", 0.5, lighten(greenColor), [], -4, [
                createRotatableClue(
                    "R2C6",
                    1.5,
                    lighten(purpleColor),
                    [
                        ...[1, -1].flatMap((sign) => [
                            // Arrow UI
                            toDecorativeConstraint(
                                ArrowConstraint(
                                    { top: 1 - sign * 1.35, left: 5 },
                                    [
                                        { top: 1, left: 5 - sign * 0.75 },
                                        { top: 1 + sign * 0.8, left: 5 - sign * 0.75 },
                                    ],
                                    true,
                                    undefined,
                                    false,
                                    false,
                                ),
                            ),
                            // Arrow validation
                            {
                                ...ArrowConstraint(
                                    { top: 1 - sign * 1.3, left: 5 },
                                    [
                                        { top: 1 - sign * 0.4, left: 5 - sign * 0.6 },
                                        { top: 1 + sign, left: 5 - sign },
                                    ],
                                    true,
                                    undefined,
                                    false,
                                    false,
                                ),
                                component: undefined,
                            },
                        ]),
                        {
                            ...KropkiDotConstraint("R2C5", "R2C6", true),
                            processRotatableCellsCoords: ({ pivot: { top, left } }, angle, cells) => {
                                switch (loop(angle, 360)) {
                                    case 120:
                                        return [
                                            { top, left },
                                            {
                                                top: top - 1,
                                                left,
                                            },
                                        ];
                                    case 240:
                                        return [
                                            { top, left },
                                            {
                                                top: top + 1,
                                                left,
                                            },
                                        ];
                                    // case 0:
                                    default:
                                        return cells;
                                }
                            },
                        },
                    ],
                    4 / 3,
                ),
            ]),
            createRotatableClue("R9C7", 0.5, lighten(greenColor), [ArrowConstraint("R9C7", ["R8C6"], true)], -4, [
                createRotatableClue(
                    ["R7C7", "R8C7"],
                    1,
                    lighten(blueColor),
                    [ArrowConstraint("R6C6", ["R6C8"], true)],
                    2,
                ),
                createRotatableClue(
                    ["R4C7", "R5C7"],
                    2,
                    lighten(pinkColor),
                    [
                        ArrowConstraint("R3C9", ["R6C9"], true),
                        KropkiDotConstraint("R3C7", "R3C8", true),
                        KropkiDotConstraint("R5C5", "R6C5", true),
                    ],
                    -1,
                ),
            ]),
        ],
    },
    rules: () => (
        <>
            <RulesParagraph>Normal Sudoku rules apply.</RulesParagraph>
        </>
    ),
    initialDigits: {
        1: {
            8: 4,
        },
    },
    items: [
        KropkiDotConstraint("R3C1", "R4C1", true),
        KropkiDotConstraint("R5C1", "R5C2", true),
        KropkiDotConstraint("R8C8", "R8C9", true),
        KropkiDotConstraint("R7C1", "R8C1", true),
        ArrowConstraint("R9C8", ["R7C8"], true),
    ],
    allowDrawing: allDrawingModes,
};
