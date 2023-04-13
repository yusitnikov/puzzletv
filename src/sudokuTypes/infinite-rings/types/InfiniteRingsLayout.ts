import {loadBoolFromLocalStorage, useBoolFromLocalStorage} from "../../../utils/localStorage";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

const localStorageKey = "infiniteRingsShowAllRings";

export const isShowingAllInfiniteRingsAllowed = (visibleRingsCount: number) => visibleRingsCount <= 2;

const calcIsShowingAllInfiniteRings = <T extends AnyPTM>(
    {isReadonlyContext}: PuzzleContext<T>,
    isShowingBySettings: boolean,
    visibleRingsCount: number,
) => !isReadonlyContext && isShowingAllInfiniteRingsAllowed(visibleRingsCount) && isShowingBySettings;

// TODO: make it part of the state extension
export const isShowingAllInfiniteRings = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    visibleRingsCount: number,
) => calcIsShowingAllInfiniteRings(context, loadBoolFromLocalStorage(localStorageKey, false), visibleRingsCount);

export const useIsShowingAllInfiniteRings = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    visibleRingsCount: number,
): [boolean, (isShowing: boolean) => void] => {
    const [isShowingBySettings, setIsShowingBySettings] = useBoolFromLocalStorage(localStorageKey, false);
    return [calcIsShowingAllInfiniteRings(context, isShowingBySettings, visibleRingsCount), setIsShowingBySettings];
};
