import {useState} from "react";
import {useEventListener} from "./useEventListener";

const calculateWindowSize = (noTime?: boolean) => ({
    width: window.innerWidth,
    height: window.innerHeight,
    lastResize: noTime ? 0 : Date.now(),
})

export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState(() => calculateWindowSize(true));

    useEventListener(window, "resize", () => setWindowSize(calculateWindowSize()));

    return windowSize;
};
