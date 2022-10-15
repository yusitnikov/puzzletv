import {PuzzleDefinition} from "./PuzzleDefinition";
import {ProcessedGameState} from "./GameState";
import {UseMultiPlayerResult} from "../../hooks/useMultiPlayer";
import {Dispatch} from "react";
import {GameStateActionOrCallback} from "./GameStateAction";
import {SudokuCellsIndex, SudokuCellsIndexForState} from "./SudokuCellsIndex";

// It's not a React context! Just a regular type.
export interface PuzzleContext<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    cellsIndex: SudokuCellsIndex<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    cellsIndexForState: SudokuCellsIndexForState<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: Dispatch<
        GameStateActionOrCallback<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType> |
        GameStateActionOrCallback<any, CellType, GameStateExtensionType, ProcessedGameStateExtensionType>[]
    >;
    cellSize: number;
    cellSizeForSidePanel: number;
    multiPlayer: UseMultiPlayerResult;
}

export interface PuzzleContextProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
}
