import { CellsMap, mergeCellsMaps, processCellsMaps } from "./CellsMap";
import { ReactNode } from "react";
import { PuzzleTypeManager } from "./PuzzleTypeManager";
import { GridSize } from "./GridSize";
import { PartiallyTranslatable } from "../translations/Translatable";
import { Constraint } from "./Constraint";
import { CellColorValue } from "./CellColor";
import { PuzzleContext } from "./PuzzleContext";
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
import { errorResultCheck, notFinishedResultCheck, PuzzleResultCheck, successResultCheck } from "./PuzzleResultCheck";
import { CellMark, getCenterMarksMap, parseCellMark } from "./CellMark";
import { loop } from "../../utils/math";
import { LanguageCode } from "../translations/LanguageCode";
import type { PuzzleImportOptions } from "./PuzzleImportOptions";
import { AnyPTM } from "./PuzzleTypeMap";
import { isSolutionCheckCell } from "./CellTypeProps";
import { profiler } from "../../utils/profiler";
import { ColorChecker, ColorMapChecker, ExactColorChecker } from "./ColorChecker";
import { settings } from "../layout/Settings";
import { translate } from "../../utils/translate";

/**
 * Puzzle page's availability parameters.
 */
export interface PuzzlePageParams {
    /**
     * The final part of the puzzle page's URL,
     * e.g. the puzzle with slug "astronavigation" can be accessed at https://site.name/#astronavigation
     * Note that in order to make the puzzle available, the puzzle definition must be added to the AllPuzzles array.
     */
    slug: string;
    /**
     * Exclude the puzzle from the "Puzzles" page
     * (by default, all puzzles from `AllPuzzles` are listed there).
     */
    noIndex?: boolean;
}

/**
 * An object that defines one concrete puzzle
 * (but not the puzzle solving state - see `GameState` for that).
 */
export interface PuzzleDefinition<T extends AnyPTM> extends PuzzlePageParams {
    // region Puzzle type/genre
    /**
     * Puzzle type/genre definition that controls all genre-specific aspects of the puzzle:
     * how to render a custom grid, how to handle keyboard navigation, how to render custom cell type, and much more.
     */
    typeManager: PuzzleTypeManager<T>;
    /**
     * Genre-specific information that defines the puzzle,
     * e.g. the initial cars positions for Rush Hour, or the player initial position for Sokoban.
     */
    extension: T["puzzleEx"];
    // endregion

    // region Puzzle metadata
    /**
     * Puzzle's title.
     */
    title: PartiallyTranslatable;
    /**
     * Puzzle's author and co-authors.
     */
    author?: PartiallyTranslatable<ReactNode>;
    /**
     * Puzzle's rules (might be dynamically rendered).
     */
    rules?: (context: PuzzleContext<T>) => ReactNode;
    /**
     * Link to the LMD page that contains this puzzle.
     */
    lmdLink?: string;
    /**
     * The solution code for the puzzle on LMD.
     *
     * Since the platform is open source,
     * it's recommended not to include the exact solution code as a string in the puzzle definition,
     * but to generate it dynamically based on the puzzle's state
     * (the function will be called only when the puzzle is solved).
     *
     * @see NorthOrSouth
     */
    getLmdSolutionCode?: (context: PuzzleContext<T>) => string;
    // endregion

    // region Puzzle grid's shape
    /**
     * Puzzle grid size - defines both the size of virtual cells array and of the rendered grid.
     */
    gridSize: GridSize;
    /**
     * The amount of extra space around the puzzle's grid, in cells (same in all directions).
     * The typical usage is to add space for outside clues like numbered rooms, little killers etc.
     */
    gridMargin?: number;
    /**
     * Custom cell shapes - a 2-dimensional map by cell coordinates.
     * See "docs/Puzzle rendering.md" and "docs/how-to/How to render custom grid.md" for more details.
     */
    customCellBounds?: CellsMap<CustomCellBounds>;
    /**
     * Treat a chain of lines in the cell border's polygon as a single line if it doesn't intersect with other cell borders,
     * for the purpose of the pen tool's lines and marks.
     * When disabled, each line segment of the cell border will be separate.
     *
     * In other words, each line segment will be treated as a cell's corner when the flag is disabled,
     * but only border intersections of more than one cell will be treated as cell corners when the flag is enabled.
     *
     * Default value: disabled for puzzles with regular cells, enabled for puzzles with custom cell shapes.
     */
    mergeGridLines?: boolean;
    /**
     * Puzzle cells that should be totally ignored when rendering the grid
     * and handling user input.
     *
     * Useful when a custom grid is imported from a setting platform (e.g. from Sudoku Maker),
     * and some source cells are not mapped into interactive cells in the custom grid.
     */
    inactiveCells?: Position[];
    /**
     * Loop the grid horizontally - the left and the right sides are connected.
     */
    loopHorizontally?: boolean;
    /**
     * Loop the grid vertically - the top and the bottom sides are connected.
     */
    loopVertically?: boolean;
    // endregion

    // region Puzzle grid's contents (initial digits, constraints, cosmetic clues)
    /**
     * Sudoku boxes/regions (lists of cells that must have unique values).
     */
    regions?: (Position[] | Constraint<T, any>)[];
    /**
     * Disable validating sudoku rows and columns
     * (by default, the platform will assume that the cell values must be unique in every row and column).
     */
    disableSudokuRules?: boolean;
    /**
     * Given digits in the cells
     * (or whatever the main cell content is).
     */
    initialDigits?: CellsMap<T["cell"]>;
    /**
     * Given letters in the cells
     * (it's usually a temporary storage for importing puzzles from setting platforms).
     * @see SafeCrackerTypeManager
     */
    initialLetters?: CellsMap<string>;
    /**
     * Given cell colors.
     */
    initialColors?: CellsMap<CellColorValue[]> | ((context: PuzzleContext<T>) => CellsMap<CellColorValue[]>);
    /**
     * Given cell marks.
     * @see SafeCrackerTypeManager
     */
    initialCellMarks?: CellMark[];
    /**
     * All constraints of the puzzle, including cosmetic elements.
     *
     * Note: the constraints for sudoku rows, columns and regions are built in, and don't have to be included here.
     * @see disableSudokuRules
     * @see regions
     */
    items?: Constraint<T, any>[] | ((context: PuzzleContext<T>) => Constraint<T, any>[]);
    // endregion

    // region Input modes and controls
    /**
     * Maximal digit that could be entered into a cell in the puzzle.
     *
     * Special values:
     * - `undefined` - auto-detect according to the grid's size.
     * - `0` - there's no entering digits into the cells in the puzzle.
     *
     * It's recommended not access this field directly from the puzzle definition object,
     * but from the puzzle context object instead,
     * because it takes default values and import option overrides into account.
     *
     * @see getDefaultDigitsCount
     * @see PuzzleImportOptions.digitsCount
     * @see PuzzleContext.digitsCount
     */
    digitsCount?: number;
    /**
     * Can zero be entered into the cell of the puzzle?
     * (by default, the available digits start from 1)
     */
    supportZero?: boolean;
    /**
     * Allow putting cell colors over given cell colors
     * (by default, it's not allowed).
     */
    allowOverridingInitialColors?: boolean;
    /**
     * Allowed features of the pen tool
     * (by default, the pen tool is disabled).
     *
     * @see allDrawingModes
     */
    allowDrawing?: ("center-line" | "border-line" | "center-mark" | "border-mark" | "corner-mark")[];
    /**
     * Don't allow to draw a diagonal lines that connects two cell centers with the pen tool.
     */
    disableDiagonalCenterLines?: boolean;
    /**
     * Don't allow to draw a diagonal lines that connects two cell corners with the pen tool.
     */
    disableDiagonalBorderLines?: boolean;
    /**
     * Don't allow the user to choose the line colors for the pen tool.
     */
    disableLineColors?: boolean;
    /**
     * Don't render the delete button and don't handle the Delete key.
     *
     * Useful when the only available input mode for the puzzle is the pen tool
     * (because it doesn't support the delete button).
     */
    hideDeleteButton?: boolean;
    /**
     * Don't allow to color the cells.
     */
    disableColoring?: boolean;
    /**
     * Allow to shade the cells
     * (same as the color input mode, but dedicated and optimized to support only 2 colors).
     */
    enableShading?: boolean;
    // endregion

    // region Conflict checker and solution checker
    /**
     * Callback that checks the puzzle solving state:
     * did the user already finish the puzzle successfully, is the solve process still in progress,
     * is the puzzle already broken according to the entered digits, colors and other user inputs.
     */
    resultChecker?: (context: PuzzleContext<T>) => PuzzleResultCheck;
    /**
     * The message to show to the user when they successfully finish solving the puzzle.
     */
    successMessage?: ReactNode;
    /**
     * Automatically notify the user when they solve the puzzle,
     * disregarding the relevant user setting.
     */
    forceAutoCheckOnFinish?: boolean;
    /**
     * Embedded solution for digits in the cells.
     *
     * Note: use isValidFinishedPuzzleByEmbeddedSolution() in resultChecker for this field to take effect.
     * @see isValidFinishedPuzzleByEmbeddedSolution
     * @see resultChecker
     */
    solution?: CellsMap<string | number>;
    /**
     * Embedded solution for cell colors.
     *
     * Note: use isValidFinishedPuzzleByEmbeddedSolution() in resultChecker for this field to take effect.
     * @see isValidFinishedPuzzleByEmbeddedSolution
     * @see resultChecker
     */
    solutionColors?: CellsMap<CellColorValue[]>;
    /**
     * Don't require to enter digits into every cell to finish the puzzle - allow some cells to remain empty.
     */
    allowEmptyCells?: boolean;
    /**
     * When the flag is disabled, the user must use the same exact colors as in the embedded solution for colors.
     *
     * When the flag is enabled, the user can use any colors,
     * as long as the same groups of cells are colored the same as in the embedded solution for colors.
     * In other words, the embedded solution for colors will not define which exact colors to use,
     * but it will define which groups of cells must be colored the same
     * and which groups of cells must be colored differently.
     *
     * The flag is disabled by default.
     */
    allowMappingSolutionColors?: boolean;
    /**
     * Controls how to treat cells with no colors in the embedded solution for colors:
     * - When the flag is enabled, it will mean that the cell can have any colors or no colors.
     * - When the flag is disabled, it will mean that the solution for the cell is having no colors.
     *
     * The flag is disabled by default.
     */
    ignoreEmptySolutionColors?: boolean;
    // endregion

    /**
     * Preserve puzzle solve state between page loads.
     * Default: true.
     */
    saveState?: boolean;
    /**
     * Puzzle solve state will be saved under this key in the local storage.
     * By default, the key is auto-calculated based on puzzle's slug.
     *
     * It makes sense to use a custom key only if
     * another version of the puzzle was published under the same slug earlier,
     * and you don't want to preserve the solving state of the previous version of the puzzle.
     *
     * Note: there's a similar field on PuzzleTypeManager - saveStateKeySuffix.
     * It allows to change the save state key for all puzzles that use this type manager,
     * in case the implementation of the type manager was changed so much that
     * trying to load the puzzle solving state that was saved before the change will cause bugs.
     * @see PuzzleTypeManager.saveStateKeySuffix
     */
    saveStateKey?: string;

    /**
     * For puzzles with lives, the amount of lives at the start.
     */
    initialLives?: number;
    /**
     * For puzzles with lives, decrease only one live when entering many wrong digits at once.
     * By default, the lives count will decrease by amount of entered wrong digits.
     */
    decreaseOnlyOneLive?: boolean;

    /**
     * Options that were selected while importing the puzzle from a setting platform (e.g. from Sudoku Maker).
     */
    importOptions?: Partial<PuzzleImportOptions>;

    // region UI tweaks
    /**
     * Render the grid lines (cell borders) with dashed lines.
     */
    dashedGrid?: boolean;
    /**
     * Don't render grid lines (cell borders).
     */
    noGridLines?: boolean;
    /**
     * The color of the grid lines (cell borders)
     */
    gridLineColor?: string;
    /**
     * The size of pen tool mark ("X" and "O") on the cell border, in cells.
     * The default is 15% of the cell size.
     *
     * This field could be useful for puzzles with custom cell bounds.
     * @see ElephantSlitherlink
     */
    borderMarkSize?: number;
    /**
     * Force disable blurred fog rendering for the puzzle
     * (in favor of simplified fog graphics that cover the exact "fogged" cell shapes with no blur effect).
     *
     * Use this flag when there are visual clues near to the cell border that must be not covered by fog.
     *
     * Note: not using this flag will not guarantee that the blurred fog rendering will be used for the puzzle,
     * because the user could control it in the settings with the "simplified graphics" checkbox.
     */
    disableFancyFog?: boolean;
    /**
     * Draw cell selection indicators on top of the "regular" grid layers.
     * In particular, they would be rendered on top of the fog.
     *
     * @see GridLayer
     * @see FogConstraint
     */
    prioritizeSelection?: boolean;
    // endregion

    // region Network game play - currently the feature is disabled
    params?: {
        host?: string;
        room?: string;
        share?: boolean;
        [key: string]: any;
    };
    getNewHostedGameParams?: () => any;
    // endregion
}

/**
 * All possible drawing modes of the pen tool.
 */
export const allDrawingModes: PuzzleDefinition<AnyPTM>["allowDrawing"] = [
    // Line that connects cell centers
    "center-line",
    // Line that connects cell corners
    "border-line",
    // X/O mark in the cell center
    "center-mark",
    // X mark on a cell border
    "border-mark",
    // X mark in a cell corner
    "corner-mark",
];

/**
 * Object that describes puzzle's parameters relevant for puzzle page's availability,
 * and allows to lazy-load the full puzzle definition later.
 *
 * Use it when the puzzle definition depends on the page URL parameters,
 * or just to save some CPU and memory while loading the list of all puzzles.
 */
export interface PuzzleDefinitionLoader<T extends AnyPTM> extends PuzzlePageParams {
    /**
     * Load the full puzzle definition based on the page URL parameters.
     */
    loadPuzzle: (params: any, isPreview?: boolean) => Omit<PuzzleDefinition<T>, "noIndex" | "slug">;
    /**
     * Process page URL parameters that should be saved on the puzzle definition.
     */
    fulfillParams?: (params: any) => any;
}

export type PuzzleDefinitionOrLoader<T extends AnyPTM> = PuzzleDefinition<T> | PuzzleDefinitionLoader<T>;

/**
 * Load the final puzzle definition from a partial puzzle definition or a loader:
 * - Apply loader's callback.
 * - Apply puzzle post-processing defined on the type manager.
 *
 * @see PuzzleDefinitionLoader.loadPuzzle
 * @see PuzzleTypeManager.postProcessPuzzle
 */
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
    gridSize: { gridSize },
    importOptions: { stickyRegion } = {},
}: PuzzleDefinition<T>) => {
    if (stickyRegion) {
        gridSize = Math.min(gridSize, Math.max(stickyRegion.width, stickyRegion.height));
    }

    return Math.min(maxDigitsCount || gridSize, gridSize);
};

export const normalizePuzzlePosition = <T extends AnyPTM>(
    { top, left }: Position,
    { gridSize: { rowsCount, columnsCount }, loopHorizontally, loopVertically }: PuzzleDefinition<T>,
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
        gridSize: { rowsCount, columnsCount },
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
): PuzzleResultCheck => {
    const timer = profiler.track("isValidFinishedPuzzleByEmbeddedSolution");

    const {
        puzzle,
        puzzleIndex,
        userDigits,
        currentGridStateWithFogDemo: { cells, marks },
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

    let finished = true;
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
                if (actualData !== undefined) {
                    timer.stop();
                    return errorResultCheck();
                }
                finished = false;
            }

            let expectedColor = [...(solutionColors[top]?.[left] ?? [])].sort().join(",");
            const actualColor = colors.sorted().items.join(",");

            if (!expectedData) {
                areCorrectColorsByDigits = false;
            } else if (typeof expectedData === "number") {
                areCorrectColorsByDigits &&= colorsByDigitsChecker.isValidData(actualColor, expectedData);
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
                    if (!actualColor) {
                        finished = false;
                    } else {
                        timer.stop();
                        return errorResultCheck();
                    }
                }
            }
        }
    }

    if (hasSolutionColors && !colorsBySolutionChecker.isValidPuzzle()) {
        timer.stop();
        return errorResultCheck();
    }

    if (finished) {
        timer.stop();
        return successResultCheck(puzzle);
    }

    if (areCorrectColorsByDigits) {
        if (colorsByDigitsChecker.isValidPuzzle()) {
            timer.stop();
            return {
                isCorrectResult: true,
                isPending: false,
                resultPhrase: translate({
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
                }),
            };
        }
    }

    timer.stop();
    return notFinishedResultCheck();
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

    puzzle.solutionColors = mergeCellsMaps(
        solutionColors,
        processCellsMaps(([colors], position) => (isRegionCell(position) ? colors : undefined), [initialColors]),
    );
    puzzle.initialColors = processCellsMaps(
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

    puzzle.initialColors = mergeCellsMaps(
        initialColors,
        processCellsMaps(
            ([colors], position) => (isRegionCell(position) && colors.length ? colors : undefined),
            [solutionColors],
        ),
    );
    puzzle.solutionColors = processCellsMaps(
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
