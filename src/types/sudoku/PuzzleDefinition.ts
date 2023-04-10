import {GivenDigitsMap} from "./GivenDigitsMap";
import {ComponentType, ReactNode} from "react";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {FieldSize} from "./FieldSize";
import {PartiallyTranslatable} from "../translations/Translatable";
import {useTranslate} from "../../hooks/useTranslate";
import {gameStateGetCurrentFieldState, ProcessedGameStateEx} from "./GameState";
import {Constraint} from "./Constraint";
import {CellColorValue} from "./CellColor";
import {PuzzleContext, PuzzleContextProps} from "./PuzzleContext";
import {CustomCellBounds} from "./CustomCellBounds";
import {
    getLineVector,
    invertLine,
    invertPosition,
    isSameLine,
    isSamePosition,
    Line,
    Position,
    stringifyLine,
    stringifyPosition
} from "../layout/Position";
import {PuzzleResultCheck} from "./PuzzleResultCheck";
import {CellMark, getCenterMarksMap, parseCellMark} from "./CellMark";
import {loop} from "../../utils/math";
import {HashSet} from "../struct/Set";
import {LanguageCode} from "../translations/LanguageCode";

export interface PuzzleDefinition<CellType, ExType = {}, ProcessedExType = {}> {
    title: PartiallyTranslatable;
    slug: string;
    params?: {
        host?: string;
        room?: string;
        share?: boolean;
        [key: string]: any;
    };
    getNewHostedGameParams?: () => any;
    author?: PartiallyTranslatable<ReactNode>;
    rules?: (
        translate: ReturnType<typeof useTranslate>,
        context: PuzzleContext<CellType, ExType, ProcessedExType>
    ) => ReactNode;
    aboveRules?: (
        translate: ReturnType<typeof useTranslate>,
        context: PuzzleContext<CellType, ExType, ProcessedExType>
    ) => ReactNode;
    typeManager: SudokuTypeManager<CellType, ExType, ProcessedExType>;
    fieldSize: FieldSize;
    fieldMargin?: number;
    fieldWrapperComponent?: ComponentType<PuzzleContextProps<CellType, ExType, ProcessedExType>>;
    fieldFitsWrapper?: boolean;
    ignoreRowsColumnCountInTheWrapper?: boolean;
    customCellBounds?: GivenDigitsMap<CustomCellBounds>;
    digitsCount?: number;
    initialDigits?: GivenDigitsMap<CellType>;
    initialLetters?: GivenDigitsMap<string>;
    initialColors?: GivenDigitsMap<CellColorValue[]> | ((context: PuzzleContext<CellType, ExType, ProcessedExType>) => GivenDigitsMap<CellColorValue[]>);
    initialCellMarks?: CellMark[];
    allowOverridingInitialColors?: boolean;
    resultChecker?: (context: PuzzleContext<CellType, ExType, ProcessedExType>) => boolean | PuzzleResultCheck<PartiallyTranslatable>,
    forceAutoCheckOnFinish?: boolean;
    items?: Constraint<CellType, any, ExType, ProcessedExType>[]
        | ((state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>) => Constraint<CellType, any, ExType, ProcessedExType>[]);
    borderColor?: string;
    allowDrawing?: ("center-line" | "border-line" | "center-mark" | "border-mark" | "corner-mark")[];
    disableDiagonalCenterLines?: boolean;
    disableDiagonalBorderLines?: boolean;
    disableLineColors?: boolean;
    hideDeleteButton?: boolean;
    loopHorizontally?: boolean;
    loopVertically?: boolean;
    disableColoring?: boolean;
    enableShading?: boolean;
    lmdLink?: string;
    getLmdSolutionCode?: (
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>
    ) => string;
    noIndex?: boolean;
    saveState?: boolean;
    saveStateKey?: string;
    forceEnableConflictChecker?: boolean;
    prioritizeSelection?: boolean;
    initialLives?: number;
    decreaseOnlyOneLive?: boolean;
    solution?: (string | number | undefined)[][];
}

export const allDrawingModes: PuzzleDefinition<any, any, any>["allowDrawing"] = ["center-line", "border-line", "center-mark", "border-mark", "corner-mark"];

export interface PuzzleDefinitionLoader<CellType, ExType = {}, ProcessedExType = {}> {
    slug: string;
    noIndex?: boolean;
    fulfillParams: (params: any) => any;
    loadPuzzle: (params: any) => PuzzleDefinition<CellType, ExType, ProcessedExType>;
}

export const getDefaultDigitsCount = ({typeManager: {maxDigitsCount}, fieldSize: {fieldSize}}: PuzzleDefinition<any, any, any>) =>
    Math.min(maxDigitsCount || fieldSize, fieldSize);

export const normalizePuzzlePosition = (
    {top, left}: Position,
    {
        fieldSize: {rowsCount, columnsCount},
        loopHorizontally,
        loopVertically,
    }: PuzzleDefinition<any, any, any>
): Position => ({
    top: loopVertically
        ? loop(top, rowsCount)
        : top,
    left: loopHorizontally
        ? loop(left, columnsCount)
        : left,
});

export const getIsSamePuzzlePosition = (puzzle: PuzzleDefinition<any, any, any>) =>
    (a: Position, b: Position) => isSamePosition(normalizePuzzlePosition(a, puzzle), normalizePuzzlePosition(b, puzzle));

export const getPuzzlePositionHasher = (puzzle: PuzzleDefinition<any, any, any>) =>
    (position: Position) => stringifyPosition(normalizePuzzlePosition(position, puzzle));

export const normalizePuzzleVector = (
    vector: Position,
    puzzle: PuzzleDefinition<any, any, any>
): Position => {
    const {
        fieldSize: {rowsCount, columnsCount},
        loopHorizontally,
        loopVertically,
    } = puzzle;

    const {top, left} = normalizePuzzlePosition(vector, puzzle);

    return {
        top: loopVertically && top * 2 > rowsCount
            ? top - rowsCount
            : top,
        left: loopHorizontally && left * 2 > columnsCount
            ? left - columnsCount
            : left,
    };
};

export const normalizePuzzleLine = <LineT extends Line = Line>(
    line: LineT,
    puzzle: PuzzleDefinition<any, any, any>
): LineT => {
    let vector = normalizePuzzleVector(getLineVector(line), puzzle);
    if (vector.top < 0 || (vector.top === 0 && vector.left < 0)) {
        vector = invertPosition(vector);
        line = invertLine(line);
    }

    const start = normalizePuzzlePosition(line.start, puzzle);

    return {
        ...line,
        start,
        end: {
            top: start.top + vector.top,
            left: start.left + vector.left,
        },
    };
};

export const getIsSamePuzzleLine = (puzzle: PuzzleDefinition<any, any, any>) =>
    (a: Line, b: Line) => isSameLine(normalizePuzzleLine(a, puzzle), normalizePuzzleLine(b, puzzle));

export const getPuzzleLineHasher = (puzzle: PuzzleDefinition<any, any, any>) =>
    (line: Line) => stringifyLine(normalizePuzzleLine(line, puzzle));

export const resolvePuzzleInitialColors = (context: PuzzleContext<any, any, any>): GivenDigitsMap<CellColorValue[]> => {
    const {puzzle: {initialColors = {}}} = context;

    return typeof initialColors === "function"
        ? initialColors(context)
        : initialColors;
};

export const isValidFinishedPuzzleByEmbeddedSolution = <CellType, ExType, ProcessedExType>(
    {puzzle, state, cellsIndex}: PuzzleContext<CellType, ExType, ProcessedExType>
): boolean | PuzzleResultCheck<PartiallyTranslatable> => {
    const {typeManager: {getCellTypeProps, getDigitByCellData}, initialDigits, initialCellMarks = []} = puzzle;

    const {cells, marks} = gameStateGetCurrentFieldState(state, true);

    const initialCenterMarks = getCenterMarksMap(initialCellMarks, cellsIndex);
    const userCenterMarks = getCenterMarksMap(marks.items, cellsIndex);

    let areCorrectDigits = true;
    let areCorrectColors = true;
    const digitToColorMap: Record<number, string> = {};
    for (const [top, row] of cells.entries()) {
        for (const [left, {usersDigit, colors}] of row.entries()) {
            const cellTypeProps = getCellTypeProps?.({top, left}, puzzle);
            if (cellTypeProps?.isVisible === false) {
                continue;
            }
            let expectedData = puzzle.solution?.[top]?.[left] ?? undefined;
            if (typeof expectedData === "string") {
                const expectedMark = parseCellMark(expectedData);
                if (expectedMark !== undefined) {
                    expectedData = expectedMark.toString();
                }
            }
            const actualMark = (initialCenterMarks?.[top]?.[left] ?? userCenterMarks?.[top]?.[left])?.type;
            const actualDigit = initialDigits?.[top]?.[left] ?? usersDigit;
            const actualData = actualDigit !== undefined ? getDigitByCellData(actualDigit, state) : actualMark;
            if (actualData !== expectedData) {
                areCorrectDigits = false;
            }

            if (!expectedData) {
                areCorrectColors = false;
            } else if (typeof expectedData === "number") {
                const expectedColor = digitToColorMap[expectedData];
                const actualColor = colors.sorted().items.join(",");
                if (!expectedColor) {
                    digitToColorMap[expectedData] = actualColor;
                } else if (actualColor !== expectedColor) {
                    areCorrectColors = false;
                }
            }

            if (!areCorrectDigits && !areCorrectColors) {
                return false;
            }
        }
    }

    if (areCorrectDigits) {
        return true;
    }

    if (areCorrectColors) {
        const allColors = Object.values(digitToColorMap);
        if (new HashSet(allColors).size === allColors.length) {
            return {
                isCorrectResult: true,
                resultPhrase: {
                    [LanguageCode.en]: [
                        "Congratulations, you solved the puzzle!",
                        "No-one cares about the digits.",
                        "Fully-colored grid is just enough.",
                    ].join("\n"),
                    [LanguageCode.ru]: [
                        "Поздравляю, Вы решили судоку!",
                        "Никого не интересуют цифры.",
                        "Полностью разукрашенного поля вполне достаточно.",
                    ].join("\n"),
                },
            };
        }
    }

    return false;
};
