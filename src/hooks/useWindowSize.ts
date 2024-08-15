import {usePureState} from "./usePureState";
import {useEventListener} from "./useEventListener";
import {headerHeight} from "../components/app/globals";

export interface WindowSize {
    width: number;
    height: number;
}

const calculateWindowSize = (withHeader = true): WindowSize => ({
    width: window.innerWidth,
    height: window.innerHeight - (withHeader ? headerHeight : 0),
})

export const useWindowSize = (withHeader = true): WindowSize => {
    const [windowSize, setWindowSize] = usePureState(() => calculateWindowSize(withHeader));

    useEventListener(window, "resize", () => setWindowSize(calculateWindowSize(withHeader)));

    return windowSize;
};
