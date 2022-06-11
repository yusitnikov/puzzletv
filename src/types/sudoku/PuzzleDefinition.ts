import {GivenDigitsMap} from "./GivenDigitsMap";
import {ComponentType, ReactNode} from "react";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {FieldSize} from "./FieldSize";
import {PartiallyTranslatable} from "../translations/Translatable";
import {useTranslate} from "../../contexts/LanguageCodeContext";
import {ProcessedGameState} from "./GameState";
import {ConstraintOrComponent} from "./Constraint";
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

export interface PuzzleDefinition<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
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
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
    ) => ReactNode;
    aboveRules?: (
        translate: ReturnType<typeof useTranslate>,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
    ) => ReactNode;
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    fieldSize: FieldSize;
    fieldMargin?: number;
    fieldWrapperComponent?: ComponentType<PuzzleContextProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>>;
    fieldFitsWrapper?: boolean;
    ignoreRowsColumnCountInTheWrapper?: boolean;
    customCellBounds?: GivenDigitsMap<CustomCellBounds>;
    digitsCount?: number;
    initialDigits?: GivenDigitsMap<CellType>;
    initialColors?: GivenDigitsMap<CellColorValue[]> | ((context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>) => GivenDigitsMap<CellColorValue[]>);
    allowOverridingInitialColors?: boolean;
    resultChecker?: (context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>) => boolean,
    forceAutoCheckOnFinish?: boolean;
    items?: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]
        | ((gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType) => ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]);
    borderColor?: string;
    allowDrawing?: ("center-line" | "border-line" | "center-mark" | "border-mark" | "corner-mark")[];
    hideDeleteButton?: boolean;
    loopHorizontally?: boolean;
    loopVertically?: boolean;
    enableDragMode?: boolean;
    disableColoring?: boolean;
    lmdLink?: string;
    getLmdSolutionCode?: (
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ) => string;
    noIndex?: boolean;
    saveState?: boolean;
    saveStateKey?: string;
}

export interface PuzzleDefinitionLoader<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    slug: string;
    noIndex?: boolean;
    fulfillParams: (params: any) => any;
    loadPuzzle: (params: any) => PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
}

export const isPuzzleHasBottomRowControls = (
    {
        typeManager: {
            hasBottomRowControls = false,
        },
        allowDrawing = [],
        loopHorizontally = false,
        loopVertically = false,
        enableDragMode = false,
    }: PuzzleDefinition<any, any, any>
): boolean => hasBottomRowControls || (allowDrawing.length !== 0 && (loopHorizontally || loopVertically || enableDragMode));

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
        ? (top % rowsCount + rowsCount) % rowsCount
        : top,
    left: loopHorizontally
        ? (left % columnsCount + columnsCount) % columnsCount
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

export const normalizePuzzleLine = (
    line: Line,
    puzzle: PuzzleDefinition<any, any, any>
): Line => {
    let vector = normalizePuzzleVector(getLineVector(line), puzzle);
    if (vector.top < 0 || (vector.top === 0 && vector.left < 0)) {
        vector = invertPosition(vector);
        line = invertLine(line);
    }

    const start = normalizePuzzlePosition(line.start, puzzle);

    return {
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
