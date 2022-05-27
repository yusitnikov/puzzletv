import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {useMemo} from "react";

export const useReadOnlySafeContext = <CellType, GameStateExtensionType, ProcessedGameStateExtensionType>(
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
): PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> => useMemo(
    () => ({
        ...context,
        onStateChange: context.state.isReady ? context.onStateChange : () => {}
    }),
    [context]
);
