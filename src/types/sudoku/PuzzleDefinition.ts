import { GivenDigitsMap, mergeGivenDigitsMaps, processGivenDigitsMaps } from "./GivenDigitsMap";
import { ComponentType, ReactNode } from "react";
import { SudokuTypeManager } from "./SudokuTypeManager";
import { FieldSize } from "./FieldSize";
import { PartiallyTranslatable } from "../translations/Translatable";
import { useTranslate } from "../../hooks/useTranslate";
import { Constraint } from "./Constraint";
import { CellColorValue } from "./CellColor";
import { PuzzleContext, PuzzleContextProps } from "./PuzzleContext";
import { CustomCellBounds } from "./CustomCellBounds";
import {
    getLineVector,
    invertLine,
    invertPosition,
    isSameLine,
    isSamePosition,
    Line,
    Position,
    stringifyCellCoords,
    stringifyLine,
    stringifyPosition,
} from "../layout/Position";
import { PuzzleResultCheck } from "./PuzzleResultCheck";
import { CellMark, getCenterMarksMap, parseCellMark } from "./CellMark";
import { loop } from "../../utils/math";
import { LanguageCode } from "../translations/LanguageCode";
import type { PuzzleImportOptions } from "./PuzzleImportOptions";
import { AnyPTM } from "./PuzzleTypeMap";
import { isSolutionCheckCell } from "./CellTypeProps";
import { profiler } from "../../utils/profiler";
import { ColorChecker, ColorMapChecker, ExactColorChecker } from "./ColorChecker";
import { settings } from "../layout/Settings";

export interface PuzzleDefinition<T extends AnyPTM> {
    // The field is required. Marking it as optional here only to avoid adding empty object to each puzzle.
    extension?: T["puzzleEx"];
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
    rules?: (translate: ReturnType<typeof useTranslate>, context: PuzzleContext<T>) => ReactNode;
    aboveRules?: (
        translate: ReturnType<typeof useTranslate>,
        context: PuzzleContext<T>,
        isPortrait: boolean,
    ) => ReactNode;
    successMessage?: string;
    typeManager: SudokuTypeManager<T>;
    fieldSize: FieldSize;
    regions?: (Position[] | Constraint<T, any>)[];
    disableSudokuRules?: boolean;
    fieldMargin?: number;
    fieldWrapperComponent?: ComponentType<PuzzleContextProps<T>>;
    fieldFitsWrapper?: boolean;
    ignoreRowsColumnCountInTheWrapper?: boolean;
    customCellBounds?: GivenDigitsMap<CustomCellBounds>;
    digitsCount?: number;
    supportZero?: boolean;
    initialDigits?: GivenDigitsMap<T["cell"]>;
    initialLetters?: GivenDigitsMap<string>;
    initialColors?:
        | GivenDigitsMap<CellColorValue[]>
        | ((context: PuzzleContext<T>) => GivenDigitsMap<CellColorValue[]>);
    initialCellMarks?: CellMark[];
    allowOverridingInitialColors?: boolean;
    disableBackgroundColorOpacity?: boolean;
    resultChecker?: (
        context: PuzzleContext<T>,
    ) => boolean | PuzzleResultCheck<ReactNode | PartiallyTranslatable<ReactNode>>;
    allowEmptyCells?: boolean;
    forceAutoCheckOnFinish?: boolean;
    items?: Constraint<T, any>[] | ((context: PuzzleContext<T>) => Constraint<T, any>[]);
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
    getLmdSolutionCode?: (context: PuzzleContext<T>) => string;
    noIndex?: boolean;
    saveState?: boolean;
    saveStateKey?: string;
    forceEnableConflictChecker?: boolean;
    prioritizeSelection?: boolean;
    initialLives?: number;
    decreaseOnlyOneLive?: boolean;
    solution?: GivenDigitsMap<string | number>;
    solutionColors?: GivenDigitsMap<CellColorValue[]>;
    allowMappingSolutionColors?: boolean;
    ignoreEmptySolutionColors?: boolean;
    importOptions?: Partial<PuzzleImportOptions>;
    inactiveCells?: Position[];
    dashedGrid?: boolean;
    noGridLines?: boolean;
    mergeGridLines?: boolean;
    borderMarkSize?: number;
}

export const allDrawingModes: PuzzleDefinition<AnyPTM>["allowDrawing"] = [
    "center-line",
    "border-line",
    "center-mark",
    "border-mark",
    "corner-mark",
];

export interface PuzzleDefinitionLoader<T extends AnyPTM> {
    slug: string;
    noIndex?: boolean;
    fulfillParams?: (params: any) => any;
    loadPuzzle: (params: any, isPreview?: boolean) => Omit<PuzzleDefinition<T>, "noIndex" | "slug"> & { slug?: string };
}

export type PuzzleDefinitionOrLoader<T extends AnyPTM> = PuzzleDefinition<T> | PuzzleDefinitionLoader<T>;

export const loadPuzzle = <T extends AnyPTM>(
    puzzleOrLoader: PuzzleDefinitionOrLoader<T>,
    params: any = {},
    isPreview = false,
): PuzzleDefinition<T> => {
    const { loadPuzzle, fulfillParams = (params) => params } = puzzleOrLoader as PuzzleDefinitionLoader<T>;

    const fulfilledParams = typeof loadPuzzle === "function" ? fulfillParams(params) : params;

    const basePuzzle =
        typeof loadPuzzle === "function"
            ? loadPuzzle(fulfilledParams, isPreview)
            : (puzzleOrLoader as PuzzleDefinition<T>);

    const puzzle: PuzzleDefinition<T> = {
        ...basePuzzle,
        noIndex: puzzleOrLoader.noIndex,
        slug: puzzleOrLoader.slug,
        params: {
            ...basePuzzle.params,
            ...fulfilledParams,
        },
    };

    return puzzle.typeManager.postProcessPuzzle?.(puzzle) ?? puzzle;
};

export const getDefaultDigitsCount = <T extends AnyPTM>({
    typeManager: { maxDigitsCount },
    fieldSize: { fieldSize },
    importOptions: { stickyRegion } = {},
}: PuzzleDefinition<T>) => {
    if (stickyRegion) {
        fieldSize = Math.min(fieldSize, Math.max(stickyRegion.width, stickyRegion.height));
    }

    return Math.min(maxDigitsCount || fieldSize, fieldSize);
};

export const normalizePuzzlePosition = <T extends AnyPTM>(
    { top, left }: Position,
    { fieldSize: { rowsCount, columnsCount }, loopHorizontally, loopVertically }: PuzzleDefinition<T>,
): Position => ({
    top: loopVertically ? loop(top, rowsCount) : top,
    left: loopHorizontally ? loop(left, columnsCount) : left,
});

export const getIsSamePuzzlePosition =
    <T extends AnyPTM>(puzzle: PuzzleDefinition<T>) =>
    (a: Position, b: Position) =>
        isSamePosition(normalizePuzzlePosition(a, puzzle), normalizePuzzlePosition(b, puzzle));

export const getPuzzlePositionHasher =
    <T extends AnyPTM>(puzzle: PuzzleDefinition<T>) =>
    (position: Position) =>
        stringifyPosition(normalizePuzzlePosition(position, puzzle));

export const normalizePuzzleVector = <T extends AnyPTM>(vector: Position, puzzle: PuzzleDefinition<T>): Position => {
    const {
        fieldSize: { rowsCount, columnsCount },
        loopHorizontally,
        loopVertically,
    } = puzzle;

    const { top, left } = normalizePuzzlePosition(vector, puzzle);

    return {
        top: loopVertically && top * 2 > rowsCount ? top - rowsCount : top,
        left: loopHorizontally && left * 2 > columnsCount ? left - columnsCount : left,
    };
};

export const normalizePuzzleLine = <T extends AnyPTM, LineT extends Line = Line>(
    line: LineT,
    puzzle: PuzzleDefinition<T>,
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

// noinspection JSUnusedGlobalSymbols
export const getIsSamePuzzleLine =
    <T extends AnyPTM>(puzzle: PuzzleDefinition<T>) =>
    (a: Line, b: Line) =>
        isSameLine(normalizePuzzleLine(a, puzzle), normalizePuzzleLine(b, puzzle));

export const getPuzzleLineHasher =
    <T extends AnyPTM>(puzzle: PuzzleDefinition<T>) =>
    (line: Line) =>
        stringifyLine(normalizePuzzleLine(line, puzzle));

export const isValidFinishedPuzzleByEmbeddedSolution = <T extends AnyPTM>(
    context: PuzzleContext<T>,
): boolean | PuzzleResultCheck<PartiallyTranslatable<ReactNode>> => {
    const timer = profiler.track("isValidFinishedPuzzleByEmbeddedSolution");

    const {
        puzzle,
        puzzleIndex,
        userDigits,
        currentFieldStateWithFogDemo: { cells, marks },
    } = context;
    const {
        typeManager: { getDigitByCellData },
        initialCellMarks = [],
        solution = {},
        solutionColors = {},
        allowMappingSolutionColors,
        ignoreEmptySolutionColors,
        importOptions: { stickyRegion, noStickyRegionValidation } = {},
    } = puzzle;

    const hasSolutionColors = Object.keys(solutionColors).length !== 0;

    const initialCenterMarks = getCenterMarksMap(initialCellMarks, puzzleIndex);
    const userCenterMarks = getCenterMarksMap(marks.items, puzzleIndex);

    let areCorrectDigits = true;
    let areCorrectColorsByDigits = true;
    const colorsByDigitsChecker: ColorChecker<number> = new ColorMapChecker<number>();
    const colorsBySolutionChecker: ColorChecker<string> = allowMappingSolutionColors
        ? new ColorMapChecker()
        : new ExactColorChecker();
    let loggedEmptyDigits = false;
    let loggedEmptyColors = false;
    for (const [top, row] of cells.entries()) {
        for (const [left, { colors }] of row.entries()) {
            if (!isSolutionCheckCell(puzzleIndex.getCellTypeProps({ top, left }))) {
                continue;
            }

            if (stickyRegion && noStickyRegionValidation) {
                const stickyTop = top - stickyRegion.top;
                const stickyLeft = left - stickyRegion.left;
                if (
                    stickyTop >= 0 &&
                    stickyLeft >= 0 &&
                    stickyTop < stickyRegion.height &&
                    stickyLeft < stickyRegion.width
                ) {
                    continue;
                }
            }

            let expectedData = solution[top]?.[left] ?? undefined;
            if (typeof expectedData === "string") {
                const expectedMark = parseCellMark(expectedData);
                if (expectedMark !== undefined) {
                    expectedData = expectedMark.toString();
                }
            }
            const actualMark = (initialCenterMarks?.[top]?.[left] ?? userCenterMarks?.[top]?.[left])?.type;
            const actualDigit = userDigits[top]?.[left];
            const actualData =
                actualDigit !== undefined ? getDigitByCellData(actualDigit, context, { top, left }) : actualMark;
            if (actualData !== expectedData) {
                if (settings.debugSolutionChecker.get()) {
                    if (actualData !== undefined || !loggedEmptyDigits) {
                        console.warn(
                            "Wrong digit at",
                            stringifyCellCoords({ top, left }),
                            "expected",
                            expectedData,
                            "got",
                            actualData,
                        );
                    }
                    if (actualData === undefined) {
                        loggedEmptyDigits = true;
                    }
                }
                areCorrectDigits = false;
            }

            let expectedColor = [...(solutionColors[top]?.[left] ?? [])].sort().join(",");
            const actualColor = colors.sorted().items.join(",");

            if (!expectedData) {
                areCorrectColorsByDigits = false;
            } else if (typeof expectedData === "number") {
                areCorrectColorsByDigits =
                    areCorrectColorsByDigits && colorsByDigitsChecker.isValidData(actualColor, expectedData);
            }

            if (hasSolutionColors && (expectedColor || !ignoreEmptySolutionColors)) {
                if (!colorsBySolutionChecker.isValidData(actualColor, expectedColor)) {
                    if (settings.debugSolutionChecker.get()) {
                        if (actualColor || !loggedEmptyColors) {
                            console.warn(
                                "Wrong color at",
                                stringifyCellCoords({ top, left }),
                                "expected",
                                expectedColor,
                                "got",
                                actualColor,
                            );
                        }
                        if (!actualColor) {
                            loggedEmptyColors = true;
                        }
                    }
                    timer.stop();
                    return false;
                }
            }

            if (!areCorrectDigits && !areCorrectColorsByDigits) {
                timer.stop();
                return false;
            }
        }
    }

    if (hasSolutionColors && !colorsBySolutionChecker.isValidPuzzle()) {
        timer.stop();
        return false;
    }

    if (areCorrectDigits) {
        timer.stop();
        return true;
    }

    if (areCorrectColorsByDigits) {
        if (colorsByDigitsChecker.isValidPuzzle()) {
            timer.stop();
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

    timer.stop();
    return false;
};

export const getRegionCells = <T extends AnyPTM>(region: Position[] | Constraint<T, any>) =>
    Array.isArray(region) ? region : region.cells;

export const isStickyRegionCell = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>, { top, left }: Position) => {
    const stickyRegion = puzzle.importOptions?.stickyRegion;
    if (!stickyRegion) {
        return false;
    }

    top -= stickyRegion.top;
    left -= stickyRegion.left;
    return top >= 0 && left >= 0 && top < stickyRegion.height && left < stickyRegion.width;
};

export const importGivenColorsAsSolution = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    isRegionCell: (cell: Position) => boolean = () => true,
) => {
    const { initialColors = {}, solutionColors = {} } = puzzle;
    if (typeof initialColors !== "object" || typeof solutionColors !== "object") {
        throw new Error("puzzle.initialColors and puzzle.solutionColors are expected to be objects");
    }

    puzzle.solutionColors = mergeGivenDigitsMaps(
        solutionColors,
        processGivenDigitsMaps(([colors], position) => (isRegionCell(position) ? colors : undefined), [initialColors]),
    );
    puzzle.initialColors = processGivenDigitsMaps(
        ([colors], position) => (isRegionCell(position) ? undefined : colors),
        [initialColors],
    );
};

export const importSolutionColorsAsGiven = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    isRegionCell: (cell: Position) => boolean = () => true,
) => {
    const { initialColors = {}, solutionColors = {} } = puzzle;
    if (typeof initialColors !== "object" || typeof solutionColors !== "object") {
        throw new Error("puzzle.initialColors and puzzle.solutionColors are expected to be objects");
    }

    puzzle.initialColors = mergeGivenDigitsMaps(
        initialColors,
        processGivenDigitsMaps(
            ([colors], position) => (isRegionCell(position) && colors.length ? colors : undefined),
            [solutionColors],
        ),
    );
    puzzle.solutionColors = processGivenDigitsMaps(
        ([colors], position) => (isRegionCell(position) ? undefined : colors),
        [solutionColors],
    );
};

export const processPuzzleItems = <T extends AnyPTM>(
    processor: (...itemsArray: Constraint<T, any>[][]) => Constraint<T, any>[],
    ...itemsArrays: PuzzleDefinition<T>["items"][]
): PuzzleDefinition<T>["items"] => {
    if (itemsArrays.some((items) => typeof items === "function")) {
        return (context) =>
            processor(...itemsArrays.map((items = []) => (typeof items === "function" ? items(context) : items)));
    } else {
        return processor(...itemsArrays.map((items = []) => items as Constraint<T, any>[]));
    }
};

export const mergePuzzleItems = <T extends AnyPTM>(...itemsArrays: PuzzleDefinition<T>["items"][]) =>
    processPuzzleItems((...itemsArray) => itemsArray.flat(), ...itemsArrays);
