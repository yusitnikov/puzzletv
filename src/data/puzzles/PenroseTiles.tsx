import { isValidFinishedPuzzleByEmbeddedSolution, PuzzleDefinition } from "../../types/sudoku/PuzzleDefinition";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { DigitSudokuTypeManager } from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import { CustomCellBounds } from "../../types/sudoku/CustomCellBounds";
import { Rect } from "../../types/layout/Rect";
import { Position } from "../../types/layout/Position";
import { RulesParagraph } from "../../components/sudoku/rules/RulesParagraph";
import { createGivenDigitsMapFromArray } from "../../types/sudoku/GivenDigitsMap";
import { NonRepeatingNeighborsConstraint } from "../../components/sudoku/constraints/consecutive-neighbors/ConsecutiveNeighbors";
import { lighterBlueColor } from "../../components/app/globals";
import { NumberPTM } from "../../types/sudoku/PuzzleTypeMap";
import { roundToStep } from "../../utils/math";
import { CellTypeProps } from "../../types/sudoku/CellTypeProps";
import { translate } from "../../utils/translate";

const coeff = Math.sqrt(3) / 2;
const areaRadius = 1 / 3;
const gridSize = Math.ceil(11 * coeff);
const exampleColor = lighterBlueColor;

const round = (value: number) => roundToStep(value, 0.001);

const point = (x: number, y: number): Position => ({
    left: round(gridSize / 2 + (x + 0.5) * coeff),
    top: round(gridSize / 2 + y - 1.75),
});

const area = ({ top, left }: Position): Rect => ({
    top: top - areaRadius,
    left: left - areaRadius,
    width: areaRadius * 2,
    height: areaRadius * 2,
});

const N = -1000;

const triangle = (
    x: number,
    y: number,
    dir: number,
    digits: [number, number, number],
): (CustomCellBounds & { digit: number })[] => {
    /*
     * 5
     *  9 4
     * 0 6 8 3
     *  7 2
     * 1
     */
    const points: Position[] = [
        point(x, y),
        point(x, y + 1),
        point(x + dir, y + 0.5),
        point(x + dir * 2, y),
        point(x + dir, y - 0.5),
        point(x, y - 1),
        point(x + (dir * 2) / 3, y),
        point(x + (dir * 5) / 12, y + 3 / 8),
        point(x + (dir * 7) / 6, y),
        point(x + (dir * 5) / 12, y - 3 / 8),
    ];

    return [
        {
            borders: [[0, 1, 2, 6].map((index) => points[index])],
            userArea: area(points[7]),
            digit: digits[0],
        },
        {
            borders: [[2, 3, 4, 6].map((index) => points[index])],
            userArea: area(points[8]),
            digit: digits[1],
        },
        {
            borders: [[4, 5, 0, 6].map((index) => points[index])],
            userArea: area(points[9]),
            digit: digits[2],
        },
    ].filter(({ digit }) => digit !== N);
};

const cells = [
    ...triangle(-4, -2, -1, [-3, N, N]),
    ...triangle(-6, -1, 1, [N, 8, N]),
    ...triangle(-4, 0, -1, [-4, -6, -1]),
    ...triangle(-6, 1, 1, [N, 6, 7]),
    ...triangle(-4, 2, -1, [N, N, 7]),

    ...triangle(-4, -2, 1, [-8, N, N]),
    ...triangle(-2, -1, -1, [-4, 3, -2]),
    ...triangle(-4, 0, 1, [-5, 6, -2]),
    ...triangle(-2, 1, -1, [-2, 4, 7]),
    ...triangle(-4, 2, 1, [8, -1, -5]),
    ...triangle(-2, 3, -1, [N, 3, 2]),

    ...triangle(0, -2, -1, [-8, N, 4]),
    ...triangle(-2, -1, 1, [5, -3, -1]),
    ...triangle(0, 0, -1, [-5, 7, 2]),
    ...triangle(-2, 1, 1, [8, -7, -6]),
    ...triangle(0, 2, -1, [-4, 3, -6]),
    ...triangle(-2, 3, 1, [N, N, 1]),

    ...triangle(2, -3, -1, [-2, N, N]),
    ...triangle(0, -2, 1, [-7, -8, -5]),
    ...triangle(2, -1, -1, [4, 6, 3]),
    ...triangle(0, 0, 1, [4, 2, 1]),
    ...triangle(2, 1, -1, [6, 3, -1]),
    ...triangle(0, 2, 1, [5, -7, -8]),

    ...triangle(2, -3, 1, [1, N, N]),
    ...triangle(2, -1, 1, [-5, N, N]),
    ...triangle(4, 0, -1, [8, -7, 2]),
    ...triangle(2, 1, 1, [-4, -3, -6]),
    ...triangle(4, 2, -1, [N, -5, N]),

    ...triangle(4, 0, 1, [N, N, -1]),

    ...triangle(0, 4, 1, [N, 0, N]),
    ...triangle(2, 5, -1, [N, N, 0]),
    ...triangle(4, 4, -1, [0, 0, N]),
    ...triangle(2, 5, 1, [0, 0, 0]),
    ...triangle(4, 6, -1, [N, 0, N]),
];

export const PenroseTiles: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    slug: "penrose-tiles",
    title: {
        [LanguageCode.en]: "A Nightmare On\nThe Penrose Tiles",
        [LanguageCode.ru]: "Кошмар на плитке Пенроуза",
    },
    author: {
        [LanguageCode.en]: "HilariousHappystar",
    },
    rules: () => (
        <>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Divide the unshaded cells into eight regions of eight cells each",
                })}
                .{" "}
                {translate({
                    [LanguageCode.en]:
                        "Each region must be identical to the shaded (blue) Penrose tile in the bottom-right part of the grid (up to rotation and reflection)",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "Each region must contain the digits 1 to 8 once each",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: "No two orthogonally adjacent cells can contain the same digit",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]:
                        "No two cells in the same “relative position” of different regions can have the same digit",
                })}
                .
            </RulesParagraph>
        </>
    ),
    typeManager: {
        ...DigitSudokuTypeManager(),
        ignoreRowsColumnCountInTheWrapper: true,
        getCellTypeProps: ({ left }): CellTypeProps<NumberPTM> => ({ noInteraction: left >= 64 }),
    },
    gridSize: {
        gridSize,
        rowsCount: 1,
        columnsCount: 72,
    },
    digitsCount: 8,
    initialDigits: {
        0: Object.fromEntries(cells.map(({ digit }, index) => [index, digit]).filter(([, digit]) => digit > 0)),
    },
    solution: createGivenDigitsMapFromArray([cells.slice(0, 64).map(({ digit }) => Math.abs(digit))]),
    initialColors: {
        0: {
            64: [exampleColor],
            65: [exampleColor],
            66: [exampleColor],
            67: [exampleColor],
            68: [exampleColor],
            69: [exampleColor],
            70: [exampleColor],
            71: [exampleColor],
        },
    },
    customCellBounds: createGivenDigitsMapFromArray([cells]),
    allowDrawing: ["center-mark", "center-line"],
    items: [NonRepeatingNeighborsConstraint()],
    resultChecker: isValidFinishedPuzzleByEmbeddedSolution,
};
