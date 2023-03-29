import {loadBoolFromLocalStorage, useBoolFromLocalStorage} from "../../../utils/localStorage";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

const localStorageKey = "infiniteRingsShowAllRings";

export const isShowingAllInfiniteRingsAllowed = (visibleRingsCount: number) => visibleRingsCount <= 2;

const calcIsShowingAllInfiniteRings = <CellType, ExType, ProcessedExType>(
    {isReadonlyContext}: PuzzleContext<CellType, ExType, ProcessedExType>,
    isShowingBySettings: boolean,
    visibleRingsCount: number,
) => !isReadonlyContext && isShowingAllInfiniteRingsAllowed(visibleRingsCount) && isShowingBySettings;

// TODO: make it part of the state extension
export const isShowingAllInfiniteRings = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    visibleRingsCount: number,
) => calcIsShowingAllInfiniteRings(context, loadBoolFromLocalStorage(localStorageKey, false), visibleRingsCount);

export const useIsShowingAllInfiniteRings = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    visibleRingsCount: number,
): [boolean, (isShowing: boolean) => void] => {
    const [isShowingBySettings, setIsShowingBySettings] = useBoolFromLocalStorage(localStorageKey, false);
    return [calcIsShowingAllInfiniteRings(context, isShowingBySettings, visibleRingsCount), setIsShowingBySettings];
};
