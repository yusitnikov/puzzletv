import {PuzzleContext} from "../../types/sudoku/PuzzleContext";
import {useMemo} from "react";
import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";

export const getReadOnlySafeOnStateChange = <T extends AnyPTM>(
    {state: {processed: {isReady}, lives}, onStateChange}: PuzzleContext<T>
): typeof onStateChange => (isReady && lives) ? onStateChange : () => {};

export const useReadOnlySafeContext = <T extends AnyPTM>(context: PuzzleContext<T>): PuzzleContext<T> => useMemo(
    () => ({
        ...context,
        onStateChange: getReadOnlySafeOnStateChange(context),
    }),
    [context]
);
