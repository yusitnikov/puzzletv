import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {CustomCellBounds} from "../../types/sudoku/CustomCellBounds";
import {Rect} from "../../types/layout/Rect";
import {indexes} from "../../utils/indexes";
import {Position} from "../../types/layout/Position";
import {LoopLineConstraint} from "../../components/sudoku/constraints/loop-line/LoopLine";
import {TapaCellConstraint} from "../../components/sudoku/constraints/tapa-cell/TapaCell";

const fieldSize = 6.7;
const scale = 1;

const round = (value: number) => Math.round(value * 1000) / 1000;

const point = (y: number, angle: number): Position => {
    angle *= 2 * Math.PI / 7;

    return {
        top: round(fieldSize / 2 - scale * y * Math.cos(angle)),
        left: round(fieldSize / 2 + scale * y * Math.sin(angle)),
    };
};

const area = (centerY: number, centerAngle: number, radius: number): Rect => {
    const {top, left} = point(centerY, centerAngle);
    radius *= scale;

    return {
        top: top - radius,
        left: left - radius,
        width: radius * 2,
        height: radius * 2,
    };
};

const bounds: CustomCellBounds[] = [
    {
        borders: [indexes(7).map(i => point(1, i))],
        userArea: area(0, 0, 0.8),
    },
    ...indexes(7).map(i => ({
        borders: [[
            point(1, i),
            point(1.8, i),
            point(2.2, i + 0.25),
            point(2.3, i + 0.5),
            point(2.2, i + 0.75),
            point(1.8, i + 1),
            point(1, i + 1),
        ]],
        userArea: area(1.55, i + 0.5, 0.6),
    })),
    ...indexes(7).flatMap(i => [
        {
            borders: [[
                point(1.8, i),
                point(2.2, i - 0.25),
                point(2.6, i - 0.18),
                point(2.75, i - 0.07),
                point(2.75, i + 0.07),
                point(2.6, i + 0.18),
                point(2.2, i + 0.25),
            ]],
            userArea: area(2.35, i, 0.38),
        },
        {
            borders: [[
                point(2.2, i + 0.25),
                point(2.6, i + 0.18),
                point(2.85, i + 0.25),
                point(2.95, i + 0.33),
                point(2.9, i + 0.42),
                point(2.7, i + 0.5),
                point(2.3, i + 0.5),
            ]],
            userArea: area(2.57, i + 0.35, 0.33),
        },
        {
            borders: [[
                point(2.3, i + 0.5),
                point(2.7, i + 0.5),
                point(2.9, i + 0.58),
                point(2.95, i + 0.67),
                point(2.85, i + 0.75),
                point(2.6, i + 0.82),
                point(2.2, i + 0.75),
            ]],
            userArea: area(2.57, i + 0.65, 0.33),
        },
    ]),
    ...indexes(7).flatMap(i => [
        {
            borders: [[
                point(2.75, i - 0.07),
                point(3.3, i - 1 / 16),
                point(3.3, i + 1 / 16),
                point(2.75, i + 0.07),
            ]],
            userArea: area(3.025, i, 0.15),
        },
        {
            borders: [[
                point(2.75, i + 0.07),
                point(3.3, i + 1 / 16),
                point(3.3, i + 3 / 16),
                point(2.85, i + 0.25),
                point(2.6, i + 0.18),
            ]],
            userArea: area(3, i + 0.145, 0.2),
        },
        {
            borders: [[
                point(2.85, i + 0.25),
                point(3.3, i + 3 / 16),
                point(3.3, i + 5 / 16),
                point(2.95, i + 0.33),
            ]],
            userArea: area(3.1, i + 0.27, 0.14),
        },
        {
            borders: [[
                point(2.95, i + 0.33),
                point(3.3, i + 5 / 16),
                point(3.3, i + 7 / 16),
                point(2.9, i + 0.42),
            ]],
            userArea: area(3.125, i + 0.37, 0.14),
        },
        {
            borders: [[
                point(2.9, i + 0.42),
                point(3.3, i + 7 / 16),
                point(3.3, i + 9 / 16),
                point(2.9, i + 0.58),
                point(2.7, i + 0.5),
            ]],
            userArea: area(3.05, i + 0.5, 0.2),
        },
        {
            borders: [[
                point(2.9, i + 0.58),
                point(3.3, i + 9 / 16),
                point(3.3, i + 11 / 16),
                point(2.95, i + 0.67),
            ]],
            userArea: area(3.125, i + 0.63, 0.14),
        },
        {
            borders: [[
                point(2.95, i + 0.67),
                point(3.3, i + 11 / 16),
                point(3.3, i + 13 / 16),
                point(2.85, i + 0.75),
            ]],
            userArea: area(3.1, i + 0.73, 0.14),
        },
        {
            borders: [[
                point(2.6, i + 0.82),
                point(2.85, i + 0.75),
                point(3.3, i + 13 / 16),
                point(3.3, i + 15 / 16),
                point(2.75, i + 0.93),
            ]],
            userArea: area(3, i + 0.855, 0.2),
        },
    ]),
];

export const TapaLikeLoop: PuzzleDefinition<number> = {
    noIndex: true,
    slug: "tapa-like-loop",
    title: {
        [LanguageCode.en]: "Tapa-like loop",
    },
    author: {
        [LanguageCode.en]: "BenceJoful",
    },
    typeManager: DigitSudokuTypeManager(),
    fieldSize: {
        fieldSize,
        rowsCount: 1,
        columnsCount: bounds.length,
        regions: [],
    },
    ignoreRowsColumnCountInTheWrapper: true,
    digitsCount: 0,
    disableColoring: true,
    hideDeleteButton: true,
    customCellBounds: {
        0: Object.fromEntries(bounds.entries()),
    },
    allowDrawing: [
        "center-mark",
        "center-line",
        "border-mark",
    ],
    items: [
        LoopLineConstraint(),
        TapaCellConstraint("R1C9", 7),
        TapaCellConstraint("R1C12", 5, undefined),
        TapaCellConstraint("R1C15", 3, 3),
        TapaCellConstraint("R1C18", 1, 1, 1),
        TapaCellConstraint("R1C21", 2, 2),
        TapaCellConstraint("R1C24", 4, undefined),
        TapaCellConstraint("R1C27", 6),
        TapaCellConstraint("R1C51", undefined),
        TapaCellConstraint("R1C74", undefined),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
};
