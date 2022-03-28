import {usePureState} from "./usePureState";
import {useEventListener} from "./useEventListener";

const calculateWindowSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
})

export const useWindowSize = () => {
    const [windowSize, setWindowSize] = usePureState(calculateWindowSize);

    useEventListener(window, "resize", () => setWindowSize(calculateWindowSize()));

    return windowSize;
};
