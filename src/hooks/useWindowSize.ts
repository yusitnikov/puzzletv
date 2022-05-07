import {usePureState} from "./usePureState";
import {useEventListener} from "./useEventListener";
import {headerHeight} from "../components/app/globals";

const calculateWindowSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight - headerHeight,
})

export const useWindowSize = () => {
    const [windowSize, setWindowSize] = usePureState(calculateWindowSize);

    useEventListener(window, "resize", () => setWindowSize(calculateWindowSize()));

    return windowSize;
};
