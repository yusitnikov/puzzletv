import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {useMemo} from "react";

export const getReadOnlySafeOnStateChange = <CellType, ExType, ProcessedExType>(
    {state: {processed: {isReady}, lives}, onStateChange}: PuzzleContext<CellType, ExType, ProcessedExType>
): typeof onStateChange => (isReady && lives) ? onStateChange : () => {};

export const useReadOnlySafeContext = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>
): PuzzleContext<CellType, ExType, ProcessedExType> => useMemo(
    () => ({
        ...context,
        onStateChange: getReadOnlySafeOnStateChange(context),
    }),
    [context]
);
