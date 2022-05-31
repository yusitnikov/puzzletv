import {usePureState} from "./usePureState";
import {useEventListener} from "./useEventListener";

export interface ControlKeysState {
    isCtrlDown: boolean;
    isAltDown: boolean;
    isShiftDown: boolean;
    isAnyKeyDown: boolean;
    keysStr: string;
}

export const useControlKeysState = () => {
    const [state, setState] = usePureState<ControlKeysState>({
        isCtrlDown: false,
        isAltDown: false,
        isShiftDown: false,
        isAnyKeyDown: false,
        keysStr: "",
    });

    const handleKeyboardEvent = ({ctrlKey, altKey, shiftKey}: KeyboardEvent) => setState({
        isCtrlDown: ctrlKey,
        isAltDown: altKey,
        isShiftDown: shiftKey,
        isAnyKeyDown: ctrlKey || altKey || shiftKey,
        keysStr: [ctrlKey ? "Ctrl" : "", altKey ? "Alt" : "", shiftKey ? "Shift" : ""].filter(s => s).join("+"),
    });

    useEventListener(window, "keydown", handleKeyboardEvent);
    useEventListener(window, "keyup", handleKeyboardEvent);

    return state;
};
