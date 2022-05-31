import {DigitComponentType} from "../../components/sudoku/digit/DigitComponentType";
import {CellDataComponentType} from "../../components/sudoku/cell/CellDataComponentType";
import {Position, PositionWithAngle} from "../layout/Position";
import {Set} from "../struct/Set";
import {GameState, ProcessedGameState} from "./GameState";
import {ComponentType} from "react";
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

    transformDigit?(
        digit: number,
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): number;

    processCellDataPosition?(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        basePosition: PositionWithAngle,
        dataSet: Set<CellType>,
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
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): Position;

    getRegionsWithSameCoordsTransformation?(puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>): Rect[];

    items?: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]
        | ((context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>) => ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]);

    getRegionsForRowsAndColumns?(
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): Constraint<any>[];

    borderColor?: string;

    getCellSelectionType?(
        cell: Position,
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): Required<Pick<CellSelectionProps, "color" | "strokeWidth">> | undefined;

    hasBottomRowControls?: boolean;

    mainControlsComponent?: ComponentType<ControlsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>>;

    maxDigitsCount?: number;

    digitShortcuts?: string[];

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
}

export const defaultProcessArrowDirection = (
    {left, top}: Position,
    xDirection: number,
    yDirection: number,
    {puzzle: {fieldSize: {rowsCount, columnsCount}}}: PuzzleContext<any, any, any>
): Position => ({
    left: (left + xDirection + columnsCount) % columnsCount,
    top: (top + yDirection + rowsCount) % rowsCount,
});
