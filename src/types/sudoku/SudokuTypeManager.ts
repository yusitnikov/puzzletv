import {ProcessedGameState} from "../../hooks/sudoku/useGame";
import {DigitComponentType} from "../../components/sudoku/digit/DigitComponentType";
import {CellDataComponentType} from "../../components/sudoku/cell/CellDataComponentType";
import {Position} from "../layout/Position";
import {Set} from "../struct/Set";

export interface SudokuTypeManager<CellType> {
    areSameCellData(data1: CellType, data2: CellType): boolean;

    compareCellData(data1: CellType, data2: CellType): number;

    getCellDataHash(data: CellType): string;

    cloneCellData(data: CellType): CellType;

    createCellDataByDisplayDigit(digit: number, gameState: ProcessedGameState<CellType>): CellType;

    createCellDataByTypedDigit(digit: number, gameState: ProcessedGameState<CellType>): CellType;

    processCellDataPosition?(
        basePosition: Position,
        dataSet: Set<CellType>,
        dataIndex: number,
        positionFunction: (index: number) => Position | undefined,
        state?: ProcessedGameState<CellType>
    ): Position | undefined;

    digitComponentType: DigitComponentType;

    cellDataComponentType: CellDataComponentType<CellType>;
}
