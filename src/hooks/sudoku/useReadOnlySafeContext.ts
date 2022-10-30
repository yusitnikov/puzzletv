import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {useMemo} from "react";

export const useReadOnlySafeContext = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>
): PuzzleContext<CellType, ExType, ProcessedExType> => useMemo(
    () => ({
        ...context,
        onStateChange: (context.state.processed.isReady && context.state.lives) ? context.onStateChange : () => {}
    }),
    [context]
);
