import {useState} from "react";
import {useEventListener} from "./useEventListener";
import {isFullScreen} from "../utils/fullScreen";

export const useIsFullScreen = () => {
    const [isFullScreenState, setIsFullScreenState] = useState(isFullScreen);

    useEventListener(window, "fullscreenchange", () => setIsFullScreenState(isFullScreen));

    return isFullScreenState;
};
