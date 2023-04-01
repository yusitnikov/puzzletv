import {AnimatableState} from "../../../types/sudoku/AnimationSpeed";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

export interface InfiniteRingsGameState extends AnimatableState {
    ringOffset: number;
}

export interface InfiniteRingsProcessedGameState {
    ringOffset: number;
}

export const setInfiniteRingOffset = <CellType, ExType extends InfiniteRingsGameState, ProcessedExType>(
    {state: {selectedCells}, onStateChange}: PuzzleContext<CellType, ExType, ProcessedExType>,
    ringOffset: number
) => onStateChange({
    extension: {ringOffset, isAnimating: true} as Partial<ExType>,
    selectedCells: selectedCells.clear(),
});
