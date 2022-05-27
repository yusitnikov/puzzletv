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
import {Constraint} from "./Constraint";
import {PuzzleContext} from "./PuzzleContext";
import {CellStateEx} from "./CellState";

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

    handleMainDigit?(cellState: CellStateEx<CellType>, cellData: CellType, position: Position, defaultUpdatedCellState: Partial<CellStateEx<CellType>>): Partial<CellStateEx<CellType>>;
    handleCenterDigit?(cellState: CellStateEx<CellType>, cellData: CellType, position: Position, defaultUpdatedCellState: Partial<CellStateEx<CellType>>): Partial<CellStateEx<CellType>>;
    handleCornerDigit?(cellState: CellStateEx<CellType>, cellData: CellType, position: Position, defaultUpdatedCellState: Partial<CellStateEx<CellType>>): Partial<CellStateEx<CellType>>;
    handleColor?(cellState: CellStateEx<CellType>, cellData: CellType, position: Position, defaultUpdatedCellState: Partial<CellStateEx<CellType>>): Partial<CellStateEx<CellType>>;

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
