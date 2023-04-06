import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {getAbsoluteScaleByLog, PartialGameStateEx} from "../../../types/sudoku/GameState";

export const setInfiniteRingOffset = <CellType, ExType, ProcessedExType>(
    {puzzle: {typeManager: {scaleStep}}, state: {selectedCells}, onStateChange}: PuzzleContext<CellType, ExType, ProcessedExType>,
    ringOffset: number,
    resetSelectedCells = true,
): PartialGameStateEx<CellType, ExType> => ({
    scale: getAbsoluteScaleByLog(ringOffset, scaleStep),
    animatingScale: true,
    ...(resetSelectedCells && {selectedCells: selectedCells.clear()}),
});
