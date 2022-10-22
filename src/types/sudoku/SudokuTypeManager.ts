import {DigitComponentType} from "../../components/sudoku/digit/DigitComponentType";
import {CellDataComponentType} from "../../components/sudoku/cell/CellDataComponentType";
import {getLineVector, Position, PositionWithAngle} from "../layout/Position";
import {SetInterface} from "../struct/Set";
import {GameState, ProcessedGameState} from "./GameState";
import {ComponentType, ReactNode} from "react";
import {ControlsProps} from "../../components/sudoku/controls/Controls";
import {Translatable} from "../translations/Translatable";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {CellSelectionProps} from "../../components/sudoku/cell/CellSelection";
import {Rect} from "../layout/Rect";
import {Constraint, ConstraintOrComponent} from "./Constraint";
import {PuzzleContext} from "./PuzzleContext";
import {CellStateEx} from "./CellState";
import {CellWriteMode, CellWriteModeInfo} from "./CellWriteMode";
import {GameStateAction, GameStateActionType} from "./GameStateAction";
import {useTranslate} from "../../hooks/useTranslate";
import {KeyInfo} from "./KeyInfo";
import {SettingsContentProps} from "../../components/sudoku/controls/settings/SettingsContent";

export interface SudokuTypeManager<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    areSameCellData(
        data1: CellType,
        data2: CellType,
        gameState: (ProcessedGameState<CellType> & ProcessedGameStateExtensionType) | undefined,
        forConstraints: boolean
    ): boolean;

    compareCellData(
        data1: CellType,
        data2: CellType,
        gameState: (ProcessedGameState<CellType> & ProcessedGameStateExtensionType) | undefined,
        forConstraints: boolean
    ): number;

    getCellDataHash(data: CellType): string;

    cloneCellData(data: CellType): CellType;

    serializeCellData(data: CellType): any;

    unserializeCellData(data: any): CellType;

    serializeGameState(data: GameState<CellType> & GameStateExtensionType): any;

    unserializeGameState(data: any): Partial<GameStateExtensionType>;

    createCellDataByDisplayDigit(
        digit: number,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): CellType;

    createCellDataByTypedDigit(
        digit: number,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): CellType;

    getDigitByCellData(
        data: CellType,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): number;

    getNumberByDigits?(digits: number[]): number | undefined;

    transformDigit?(
        digit: number,
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): number;

    processCellDataPosition?(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        basePosition: PositionWithAngle,
        dataSet: SetInterface<CellType>,
        dataIndex: number,
        positionFunction: (index: number) => PositionWithAngle | undefined,
        cellPosition?: Position,
        state?: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): PositionWithAngle | undefined;

    handleDigitGlobally?(
        isGlobal: boolean,
        clientId: string,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        cellData: CellType,
        defaultResult: Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>
    ): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>;

    handleDigitInCell?(
        isGlobal: boolean,
        clientId: string,
        cellWriteMode: CellWriteMode,
        cellState: CellStateEx<CellType>,
        cellData: CellType,
        position: Position,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        defaultResult: Partial<CellStateEx<CellType>>,
        cache: any
    ): Partial<CellStateEx<CellType>>;

    extraCellWriteModes?: CellWriteModeInfo<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>[];

    initialCellWriteMode?: CellWriteMode;

    digitComponentType?: DigitComponentType;

    cellDataComponentType: CellDataComponentType<CellType, ProcessedGameStateExtensionType>;

    initialGameStateExtension?: GameStateExtensionType;

    keepStateOnRestart?(gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType): Partial<GameState<CellType> & GameStateExtensionType>;

    isReady?(gameState: GameState<CellType> & GameStateExtensionType): boolean;

    useProcessedGameStateExtension?(gameState: GameState<CellType> & GameStateExtensionType): Omit<ProcessedGameStateExtensionType, keyof GameStateExtensionType>;

    getFieldAngle?(gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType): number;

    isValidCell?(cell: Position, puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>): boolean;

    processArrowDirection?(
        currentCell: Position,
        xDirection: number,
        yDirection: number,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        isMainKeyboard: boolean
    ): Position | undefined;

    transformCoords?(
        coords: Position,
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType,
        cellSize: number,
    ): Position;

    getRegionsWithSameCoordsTransformation?(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        cellSize: number,
    ): Rect[];

    items?: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]
        | ((context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>) => ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]);

    getRegionsForRowsAndColumns?(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): Constraint<any>[];

    getAdditionalNeighbors?(
        position: Position,
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    ): Position[];

    borderColor?: string;

    getCellSelectionType?(
        cell: Position,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
    ): Required<Pick<CellSelectionProps, "color" | "strokeWidth">> | undefined;

    hasBottomRowControls?: boolean;

    mainControlsComponent?: ComponentType<ControlsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>>;

    settingsComponents?: ComponentType<SettingsContentProps<CellType, ProcessedGameStateExtensionType>>[];

    maxDigitsCount?: number;

    disableCellModeLetterShortcuts?: boolean;
    disableArrowLetterShortcuts?: boolean;
    disableDigitShortcuts?: boolean;

    digitShortcuts?: (string | KeyInfo)[][];

    digitShortcutTips?: (Translatable|undefined)[];

    disableConflictChecker?: boolean;

    getSharedState?(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        state: GameState<CellType> & GameStateExtensionType
    ): any;

    setSharedState?(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        state: GameState<CellType> & GameStateExtensionType,
        newState: any
    ): GameState<CellType> & GameStateExtensionType;

    getInternalState?(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        state: GameState<CellType> & GameStateExtensionType
    ): any;

    unserializeInternalState?(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        newState: any
    ): Partial<GameState<CellType> & GameStateExtensionType>;

    supportedActionTypes?: GameStateActionType<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>[];

    handleClearAction?(
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        clientId: string
    ): Partial<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>;

    isGlobalAction?(
        action: GameStateAction<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
    ): boolean;

    applyStateDiffEffect?(
        state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType,
        prevState: (ProcessedGameState<CellType> & ProcessedGameStateExtensionType) | undefined,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
    ): void;

    getPlayerScore?(
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        clientId: string
    ): string | number;

    getAboveRules?(
        translate: ReturnType<typeof useTranslate>,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
    ): ReactNode;
}

export const defaultProcessArrowDirection = (
    {left, top}: Position,
    xDirection: number,
    yDirection: number,
    {puzzle, cellsIndex}: PuzzleContext<any, any, any>
): Position | undefined => {
    const {
        fieldSize: {rowsCount, columnsCount},
        customCellBounds,
        typeManager: {isValidCell = () => true},
    } = puzzle;

    if (!customCellBounds) {
        const isTotallyValidCell = (position: Position) => {
            const {top, left} = position;
            return top >= 0 && top < rowsCount && left >= 0 && left < columnsCount && isValidCell(position, puzzle);
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
    }

    const {center, neighbors} = cellsIndex.allCells[top][left];

    let bestDist: number | undefined = undefined;
    let bestCell: Position | undefined = undefined;

    for (const neighbor of neighbors.items) {
        const center2 = cellsIndex.allCells[neighbor.top][neighbor.left].center;
        const vector = getLineVector({start: center, end: center2});

        const straightDist = vector.left * xDirection + vector.top * yDirection;
        const errorDist = Math.abs(vector.left * yDirection) + Math.abs(vector.top * xDirection);
        const dist = Math.abs(Math.atan2(errorDist, straightDist));
        if (bestDist === undefined || dist < bestDist) {
            bestDist = dist;
            bestCell = neighbor;
        }
    }

    return bestCell;
};

export const defaultGetDefaultNumberByDigits = (digits: number[]) => {
    let num = 0;

    for (const digit of digits) {
        num *= 10;
        num += digit;
    }

    return num;
};
