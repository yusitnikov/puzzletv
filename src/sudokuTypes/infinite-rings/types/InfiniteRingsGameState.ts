import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {getAbsoluteScaleByLog, PartialGameStateEx} from "../../../types/sudoku/GameState";

export const gameStateSetScaleLog = <CellType, ExType, ProcessedExType>(
    {puzzle: {typeManager: {scaleStep}}, state: {selectedCells}, onStateChange}: PuzzleContext<CellType, ExType, ProcessedExType>,
    scaleLog: number,
    resetSelectedCells = true,
): PartialGameStateEx<CellType, ExType> => ({
    scale: getAbsoluteScaleByLog(scaleLog, scaleStep),
    animatingScale: true,
    ...(resetSelectedCells && {selectedCells: selectedCells.clear()}),
});
