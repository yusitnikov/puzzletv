import {useState} from "react";
import {useEventListener} from "./useEventListener";

const calculateWindowSize = () => ({
    width: window.innerWidth,
    height: window.innerHeight,
})

export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState(calculateWindowSize);

    useEventListener(window, "resize", () => setWindowSize(calculateWindowSize()));

    return windowSize;
};
