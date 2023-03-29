import {loadBoolFromLocalStorage, useBoolFromLocalStorage} from "../../../utils/localStorage";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

const localStorageKey = "infiniteRingsShowAllRings";

// TODO: make it part of the state extension
const calcIsShowingAllInfiniteRings = <CellType, ExType, ProcessedExType>(
    {isReadonlyContext}: PuzzleContext<CellType, ExType, ProcessedExType>,
    isShowingBySettings: boolean,
) => !isReadonlyContext && isShowingBySettings;

export const isShowingAllInfiniteRings = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>
) => calcIsShowingAllInfiniteRings(context, loadBoolFromLocalStorage(localStorageKey, false));

export const useIsShowingAllInfiniteRings = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>
): [boolean, (isShowing: boolean) => void] => {
    const [isShowingBySettings, setIsShowingBySettings] = useBoolFromLocalStorage(localStorageKey, false);
    return [calcIsShowingAllInfiniteRings(context, isShowingBySettings), setIsShowingBySettings];
};
