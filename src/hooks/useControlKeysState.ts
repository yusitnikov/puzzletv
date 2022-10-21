import {usePureState} from "./usePureState";
import {useEventListener} from "./useEventListener";
import {useState} from "react";

export interface ControlKeysState {
    isCtrlDown: boolean;
    isAltDown: boolean;
    isShiftDown: boolean;
    isAnyKeyDown: boolean;
    keysStr: string;
}

export const useControlKeysState = () => {
    const [shiftTimeout, setShiftTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
    const [state, setState] = usePureState<ControlKeysState>({
        isCtrlDown: false,
        isAltDown: false,
        isShiftDown: false,
        isAnyKeyDown: false,
        keysStr: "",
    });

    const handleKeyboardEvent = ({ctrlKey, altKey, shiftKey}: KeyboardEvent) => {
        const doSet = () => setState({
            isCtrlDown: ctrlKey,
            isAltDown: altKey,
            isShiftDown: shiftKey,
            isAnyKeyDown: ctrlKey || altKey || shiftKey,
            keysStr: [ctrlKey ? "Ctrl" : "", altKey ? "Alt" : "", shiftKey ? "Shift" : ""].filter(s => s).join("+"),
        });
        if (shiftTimeout) {
            clearTimeout(shiftTimeout);
        }
        if (state.isShiftDown && !shiftKey) {
            setShiftTimeout(setTimeout(doSet, 100));
        } else {
            setShiftTimeout(undefined);
            doSet();
        }
    };

    useEventListener(window, "keydown", handleKeyboardEvent);
    useEventListener(window, "keyup", handleKeyboardEvent);
    useEventListener(window, "blur", () => setState({
        isCtrlDown: false,
        isAltDown: false,
        isShiftDown: false,
        isAnyKeyDown: false,
        keysStr: "",
    }));

    return state;
};
