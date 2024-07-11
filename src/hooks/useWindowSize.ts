import {usePureState} from "./usePureState";
import {useEventListener} from "./useEventListener";
import {headerHeight} from "../components/app/globals";

const calculateWindowSize = (withHeader = true) => ({
    width: window.innerWidth,
    height: window.innerHeight - (withHeader ? headerHeight : 0),
})

export const useWindowSize = (withHeader = true) => {
    const [windowSize, setWindowSize] = usePureState(() => calculateWindowSize(withHeader));

    useEventListener(window, "resize", () => setWindowSize(calculateWindowSize(withHeader)));

    return windowSize;
};
