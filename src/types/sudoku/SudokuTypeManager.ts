import {DigitComponentType} from "../../components/sudoku/digit/DigitComponentType";
import {CellDataComponentType} from "../../components/sudoku/cell/CellDataComponentType";
import {getLineVector, Position, PositionWithAngle} from "../layout/Position";
import {SetInterface} from "../struct/Set";
import {GameStateEx, PartialGameStateEx, ProcessedGameStateEx} from "./GameState";
import {ComponentType, ReactNode} from "react";
import {ControlsProps} from "../../components/sudoku/controls/Controls";
import {Translatable} from "../translations/Translatable";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {CellSelectionProps} from "../../components/sudoku/cell/CellSelection";
import {Rect} from "../layout/Rect";
import {Constraint} from "./Constraint";
import {PuzzleContext} from "./PuzzleContext";
import {CellStateEx} from "./CellState";
import {CellWriteMode, CellWriteModeInfo} from "./CellWriteMode";
import {GameStateAction, GameStateActionType} from "./GameStateAction";
import {useTranslate} from "../../hooks/useTranslate";
import {KeyInfo} from "./KeyInfo";
import {SettingsContentProps} from "../../components/sudoku/controls/settings/SettingsContent";

export interface SudokuTypeManager<CellType, ExType = {}, ProcessedExType = {}> {
    areSameCellData(
        data1: CellType,
        data2: CellType,
        state: ProcessedGameStateEx<CellType, ExType, ProcessedExType> | undefined,
        forConstraints: boolean
    ): boolean;

    compareCellData(
        data1: CellType,
        data2: CellType,
        state: ProcessedGameStateEx<CellType, ExType, ProcessedExType> | undefined,
        forConstraints: boolean
    ): number;

    getCellDataHash(data: CellType): string;

    cloneCellData(data: CellType): CellType;

    serializeCellData(data: CellType): any;

    unserializeCellData(data: any): CellType;

    serializeGameState(data: Partial<ExType>): any;

    unserializeGameState(data: any): Partial<ExType>;

    createCellDataByDisplayDigit(
        digit: number,
        gameState: ProcessedGameStateEx<CellType, ExType, ProcessedExType>
    ): CellType;

    createCellDataByTypedDigit(
        digit: number,
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        position?: Position
    ): CellType;

    getDigitByCellData(
        data: CellType,
        state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>
    ): number;

    getNumberByDigits?(digits: number[]): number | undefined;

    transformDigit?(
        digit: number,
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>
    ): number;

    processCellDataPosition?(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        basePosition: PositionWithAngle,
        dataSet: SetInterface<CellType>,
        dataIndex: number,
        positionFunction: (index: number) => PositionWithAngle | undefined,
        cellPosition?: Position,
        state?: ProcessedGameStateEx<CellType, ExType, ProcessedExType>
    ): PositionWithAngle | undefined;

    handleDigitGlobally?(
        isGlobal: boolean,
        clientId: string,
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        cellData: CellType,
        defaultResult: PartialGameStateEx<CellType, ExType>
    ): PartialGameStateEx<CellType, ExType>;

    handleDigitInCell?(
        isGlobal: boolean,
        clientId: string,
        cellWriteMode: CellWriteMode,
        cellState: CellStateEx<CellType>,
        cellData: CellType,
        position: Position,
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        defaultResult: Partial<CellStateEx<CellType>>,
        cache: any
    ): Partial<CellStateEx<CellType>>;

    extraCellWriteModes?: CellWriteModeInfo<CellType, ExType, ProcessedExType>[];

    initialCellWriteMode?: CellWriteMode;

    digitComponentType?: DigitComponentType;

    cellDataComponentType: CellDataComponentType<CellType>;

    initialGameStateExtension?: ExType;

    keepStateOnRestart?(state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>): PartialGameStateEx<CellType, ExType>;

    isReady?(state: GameStateEx<CellType, ExType>): boolean;

    useProcessedGameStateExtension?(state: GameStateEx<CellType, ExType>): Omit<ProcessedExType, keyof ExType>;

    getFieldAngle?(state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>): number;

    getCellTypeProps?(cell: Position, puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>): {
        isVisible?: boolean;
        isSelectable?: boolean;
        forceCellWriteMode?: CellWriteModeInfo<CellType, ExType, ProcessedExType>;
    };

    processArrowDirection?(
        currentCell: Position,
        xDirection: number,
        yDirection: number,
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        isMainKeyboard: boolean
    ): Position | undefined;

    transformCoords?(
        coords: Position,
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>,
        cellSize: number,
    ): Position;

    getRegionsWithSameCoordsTransformation?(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        cellSize: number,
    ): Rect[];

    items?: Constraint<CellType, any, ExType, ProcessedExType>[]
        | ((context: PuzzleContext<CellType, ExType, ProcessedExType>) => Constraint<CellType, any, ExType, ProcessedExType>[]);

    getRegionsForRowsAndColumns?(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>
    ): Constraint<CellType, any, ExType, ProcessedExType>[];

    getAdditionalNeighbors?(
        position: Position,
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    ): Position[];

    borderColor?: string;

    getCellSelectionType?(
        cell: Position,
        context: PuzzleContext<CellType, ExType, ProcessedExType>
    ): Required<Pick<CellSelectionProps, "color" | "strokeWidth">> | undefined;

    hasBottomRowControls?: boolean;

    mainControlsComponent?: ComponentType<ControlsProps<CellType, ExType, ProcessedExType>>;

    settingsComponents?: ComponentType<SettingsContentProps<CellType, ProcessedExType>>[];

    maxDigitsCount?: number;

    disableCellModeLetterShortcuts?: boolean;
    disableArrowLetterShortcuts?: boolean;
    disableDigitShortcuts?: boolean;

    digitShortcuts?: (string | KeyInfo)[][];

    digitShortcutTips?: (Translatable|undefined)[];

    disableConflictChecker?: boolean;

    getSharedState?(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        state: GameStateEx<CellType, ExType>
    ): any;

    setSharedState?(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        state: GameStateEx<CellType, ExType>,
        newState: any
    ): GameStateEx<CellType, ExType>;

    getInternalState?(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        state: GameStateEx<CellType, ExType>
    ): any;

    unserializeInternalState?(
        puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
        newState: any
    ): PartialGameStateEx<CellType, ExType>;

    supportedActionTypes?: GameStateActionType<any, CellType, ExType, ProcessedExType>[];

    handleClearAction?(
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        clientId: string
    ): PartialGameStateEx<CellType, ExType>;

    isGlobalAction?(
        action: GameStateAction<any, CellType, ExType, ProcessedExType>,
        context: PuzzleContext<CellType, ExType, ProcessedExType>
    ): boolean;

    applyStateDiffEffect?(
        state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>,
        prevState: ProcessedGameStateEx<CellType, ExType, ProcessedExType> | undefined,
        context: PuzzleContext<CellType, ExType, ProcessedExType>
    ): void;

    getPlayerScore?(
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        clientId: string
    ): string | number;

    getAboveRules?(
        translate: ReturnType<typeof useTranslate>,
        context: PuzzleContext<CellType, ExType, ProcessedExType>
    ): ReactNode;
}

export const defaultProcessArrowDirectionForRegularCellBounds = (
    {left, top}: Position,
    xDirection: number,
    yDirection: number,
    {puzzle}: PuzzleContext<any, any, any>
): Position | undefined => {
    const {
        fieldSize: {rowsCount, columnsCount},
        typeManager: {getCellTypeProps},
    } = puzzle;

    const isTotallyValidCell = (position: Position) => {
        const {top, left} = position;
        if (top < 0 || top >= rowsCount || left < 0 || left >= columnsCount) {
            return false;
        }
        const cellTypeProps = getCellTypeProps?.(position, puzzle);
        return cellTypeProps?.isVisible !== false && cellTypeProps?.isSelectable !== false;
    };

    // Try moving in the requested direction naively
    let newPosition = {
        left: left + xDirection,
        top: top + yDirection,
    };

    if (isTotallyValidCell(newPosition)) {
        return newPosition;
    }

    // If the naive new position is not valid then go in the reverse direction while it's possible
    do {
        newPosition.left -= xDirection;
        newPosition.top -= yDirection;
    } while (isTotallyValidCell({
        left: newPosition.left - xDirection,
        top: newPosition.top - yDirection,
    }));

    return newPosition;
};

export const defaultProcessArrowDirectionForCustomCellBounds = (
    {left, top}: Position,
    xDirection: number,
    yDirection: number,
    {puzzle, cellsIndex}: PuzzleContext<any, any, any>,
    isMainKeyboard?: boolean,
    enableBackwardSteps = true,
): Position | undefined => {
    const {typeManager: {getCellTypeProps}} = puzzle;

    const {center, neighbors} = cellsIndex.allCells[top][left];

    let bestDist: number | undefined = undefined;
    let bestCell: Position | undefined = undefined;

    for (const neighbor of neighbors.items) {
        const cellTypeProps = getCellTypeProps?.(neighbor, puzzle);
        if (cellTypeProps?.isVisible === false || cellTypeProps?.isSelectable === false) {
            continue;
        }

        const center2 = cellsIndex.allCells[neighbor.top][neighbor.left].center;
        const vector = getLineVector({start: center, end: center2});

        const straightDist = vector.left * xDirection + vector.top * yDirection;
        if (!enableBackwardSteps && straightDist < 0) {
            continue;
        }
        const errorDist = Math.abs(vector.left * yDirection) + Math.abs(vector.top * xDirection);
        const dist = Math.abs(Math.atan2(errorDist, straightDist));
        if (bestDist === undefined || dist < bestDist) {
            bestDist = dist;
            bestCell = neighbor;
        }
    }

    return bestCell;
};

export const defaultProcessArrowDirection = (
    position: Position,
    xDirection: number,
    yDirection: number,
    context: PuzzleContext<any, any, any>,
    isMainKeyboard?: boolean,
    enableBackwardSteps?: boolean,
): Position | undefined => {
    return context.puzzle.customCellBounds
        ? defaultProcessArrowDirectionForCustomCellBounds(position, xDirection, yDirection, context, isMainKeyboard, enableBackwardSteps)
        : defaultProcessArrowDirectionForRegularCellBounds(position, xDirection, yDirection, context);
};

export const defaultGetDefaultNumberByDigits = (digits: number[]) => {
    let num = 0;

    for (const digit of digits) {
        num *= 10;
        num += digit;
    }

    return num;
};
