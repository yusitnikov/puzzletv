import {PuzzleDefinition} from "./PuzzleDefinition";
import {calculateProcessedGameState, getEmptyGameState, ProcessedGameStateEx} from "./GameState";
import {emptyUseMultiPlayerResult, UseMultiPlayerResult} from "../../hooks/useMultiPlayer";
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
    isReadonlyContext: boolean;
}

export interface PuzzleContextProps<CellType, ExType = {}, ProcessedExType = {}> {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
}

export const createEmptyContextForPuzzle = <CellType, ExType, ProcessedExType>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    cellSize = 1,
): PuzzleContext<CellType, ExType, ProcessedExType> => {
    const cellsIndex = new SudokuCellsIndex(puzzle);
    const state = getEmptyGameState(puzzle, false, true);

    const contextNoIndex: Omit<PuzzleContext<CellType, ExType, ProcessedExType>, "cellsIndexForState"> = {
        puzzle,
        state: calculateProcessedGameState(
            puzzle,
            emptyUseMultiPlayerResult,
            state,
            puzzle.typeManager.getProcessedGameStateExtension?.(state) ?? ({} as ProcessedExType),
            undefined,
            true,
        ),
        cellsIndex,
        cellSize,
        cellSizeForSidePanel: cellSize,
        onStateChange: () => {},
        isReadonlyContext: true,
        multiPlayer: emptyUseMultiPlayerResult,
    };

    return {
        ...contextNoIndex,
        cellsIndexForState: new SudokuCellsIndexForState<CellType, ExType, ProcessedExType>(cellsIndex, contextNoIndex),
    };
};
