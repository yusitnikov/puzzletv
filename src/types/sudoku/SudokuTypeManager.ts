import {DigitComponentType} from "../../components/sudoku/digit/DigitComponentType";
import {CellDataComponentType} from "../../components/sudoku/cell/CellDataComponentType";
import {Position, PositionWithAngle} from "../layout/Position";
import {Set} from "../struct/Set";
import {GameState, ProcessedGameState} from "./GameState";
import {ComponentType} from "react";
import {ControlsProps} from "../../components/sudoku/controls/Controls";
import {Translatable} from "../translations/Translatable";
import {FieldSize} from "./FieldSize";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {CellSelectionProps} from "../../components/sudoku/cell/CellSelection";
import {Rect} from "../layout/Rect";
import {Constraint} from "./Constraint";

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
        fieldSize: FieldSize,
        isMainKeyboard: boolean,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
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
    {rowsCount, columnsCount}: FieldSize
): Position => ({
    left: (left + xDirection + columnsCount) % columnsCount,
    top: (top + yDirection + rowsCount) % rowsCount,
});
