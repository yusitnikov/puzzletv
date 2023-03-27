import {loadBoolFromLocalStorage, useBoolFromLocalStorage} from "../../../utils/localStorage";

const localStorageKey = "infiniteRingsShowAllRings";

// TODO: make it part of the state extension
export const isShowingAllInfiniteRings = () => loadBoolFromLocalStorage(localStorageKey, false);

export const useIsShowingAllInfiniteRings = (): [boolean, (isShowing: boolean) => void] =>
    useBoolFromLocalStorage(localStorageKey, false);
