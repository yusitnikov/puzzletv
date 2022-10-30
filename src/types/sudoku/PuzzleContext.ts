import {PuzzleDefinition} from "./PuzzleDefinition";
import {ProcessedGameStateEx} from "./GameState";
import {UseMultiPlayerResult} from "../../hooks/useMultiPlayer";
import {Dispatch} from "react";
import {GameStateActionOrCallback} from "./GameStateAction";
import {SudokuCellsIndex, SudokuCellsIndexForState} from "./SudokuCellsIndex";

// It's not a React context! Just a regular type.
export interface PuzzleContext<CellType, ExType = {}, ProcessedExType = {}> {
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>;
    cellsIndex: SudokuCellsIndex<CellType, ExType, ProcessedExType>;
    cellsIndexForState: SudokuCellsIndexForState<CellType, ExType, ProcessedExType>;
    state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>
    onStateChange: Dispatch<
        GameStateActionOrCallback<any, CellType, ExType, ProcessedExType> |
        GameStateActionOrCallback<any, CellType, ExType, ProcessedExType>[]
    >;
    cellSize: number;
    cellSizeForSidePanel: number;
    multiPlayer: UseMultiPlayerResult;
}

export interface PuzzleContextProps<CellType, ExType = {}, ProcessedExType = {}> {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
}
