import {PuzzleDefinition} from "./PuzzleDefinition";
import {calculateProcessedGameState, getEmptyGameState, ProcessedGameStateEx} from "./GameState";
import {emptyUseMultiPlayerResult, UseMultiPlayerResult} from "../../hooks/useMultiPlayer";
import {Dispatch} from "react";
import {GameStateActionOrCallback} from "./GameStateAction";
import {SudokuCellsIndex, SudokuCellsIndexForState} from "./SudokuCellsIndex";
import {AnyPTM} from "./PuzzleTypeMap";

// It's not a React context! Just a regular type.
export interface PuzzleContext<T extends AnyPTM> {
    puzzle: PuzzleDefinition<T>;
    cellsIndex: SudokuCellsIndex<T>;
    cellsIndexForState: SudokuCellsIndexForState<T>;
    state: ProcessedGameStateEx<T>
    onStateChange: Dispatch<
        GameStateActionOrCallback<any, T> |
        GameStateActionOrCallback<any, T>[]
    >;
    cellSize: number;
    cellSizeForSidePanel: number;
    multiPlayer: UseMultiPlayerResult;
    isReadonlyContext: boolean;
}

export interface PuzzleContextProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
}

export const createEmptyContextForPuzzle = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    cellSize = 1,
): PuzzleContext<T> => {
    const cellsIndex = new SudokuCellsIndex(puzzle);
    const state = getEmptyGameState(puzzle, false, true);

    const contextNoIndex: Omit<PuzzleContext<T>, "cellsIndexForState"> = {
        puzzle,
        state: calculateProcessedGameState(
            puzzle,
            emptyUseMultiPlayerResult,
            state,
            puzzle.typeManager.getProcessedGameStateExtension?.(state) ?? ({} as T["processedStateEx"]),
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
        cellsIndexForState: new SudokuCellsIndexForState(cellsIndex, contextNoIndex),
    };
};
