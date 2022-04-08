import {DigitComponentType} from "../../components/sudoku/digit/DigitComponentType";
import {CellDataComponentType} from "../../components/sudoku/cell/CellDataComponentType";
import {Position} from "../layout/Position";
import {Set} from "../struct/Set";
import {GameState, ProcessedGameState} from "./GameState";
import {ComponentType} from "react";
import {ControlsProps} from "../../components/sudoku/controls/Controls";

export interface SudokuTypeManager<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    areSameCellData(data1: CellType, data2: CellType): boolean;

    compareCellData(data1: CellType, data2: CellType): number;

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

    processCellDataPosition?(
        basePosition: Position,
        dataSet: Set<CellType>,
        dataIndex: number,
        positionFunction: (index: number) => Position | undefined,
        state?: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): Position | undefined;

    digitComponentType?: DigitComponentType;

    cellDataComponentType: CellDataComponentType<CellType, ProcessedGameStateExtensionType>;

    initialGameStateExtension?: GameStateExtensionType;

    isReady?(gameState: GameState<CellType> & GameStateExtensionType): boolean;

    useProcessedGameStateExtension?(gameState: GameState<CellType> & GameStateExtensionType): Omit<ProcessedGameStateExtensionType, keyof GameStateExtensionType>;

    getFieldAngle?(gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType): number;

    processArrowDirection?(
        xDirection: number,
        yDirection: number,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): [number, number];

    mainControlsCount?: number;

    mainControlsComponent?: ComponentType<ControlsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>>;

    secondaryControlsCount?: number;

    secondaryControlsComponent?: ComponentType<ControlsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>>;

    maxDigitsCount?: number;

    digitShortcuts?: string[];

    digitShortcutTips?: (string|undefined)[];
}
