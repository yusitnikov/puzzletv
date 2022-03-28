import {usePureState} from "./usePureState";
import {useEventListener} from "./useEventListener";

export const useControlKeysState = () => {
    const [state, setState] = usePureState({
        isCtrlDown: false,
        isShiftDown: false,
        isAnyKeyDown: false,
    });

    const handleKeyboardEvent = ({ctrlKey, shiftKey}: KeyboardEvent) => setState({
        isCtrlDown: ctrlKey,
        isShiftDown: shiftKey,
        isAnyKeyDown: ctrlKey || shiftKey,
    });

    useEventListener(window, "keydown", handleKeyboardEvent);
    useEventListener(window, "keyup", handleKeyboardEvent);

    return state;
};
