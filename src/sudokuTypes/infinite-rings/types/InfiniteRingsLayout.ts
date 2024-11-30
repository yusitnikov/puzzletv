import { localStorageManager } from "../../../utils/localStorage";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";

export const showAllRingsSetting = localStorageManager.getBoolManager("infiniteRingsShowAllRings");
export const focusRingsSetting = localStorageManager.getBoolManager("infiniteRingsFocusRings", true);

export const isShowingAllInfiniteRingsAllowed = (visibleRingsCount: number) => visibleRingsCount <= 2;

const calcIsShowingAllInfiniteRings = <T extends AnyPTM>(
    { isReadonlyContext }: PuzzleContext<T>,
    isShowingBySettings: boolean,
    visibleRingsCount: number,
) => !isReadonlyContext && isShowingAllInfiniteRingsAllowed(visibleRingsCount) && isShowingBySettings;

export const isShowingAllInfiniteRings = <T extends AnyPTM>(context: PuzzleContext<T>, visibleRingsCount: number) =>
    calcIsShowingAllInfiniteRings(context, showAllRingsSetting.get(), visibleRingsCount);
