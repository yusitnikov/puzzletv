import {useEventListener} from "./useEventListener";
import {useRef} from "react";
import {makeAutoObservable} from "mobx";
import {profiler} from "../utils/profiler";

interface ControlKeysStateOptions {
    isCtrlDown: boolean;
    isAltDown: boolean;
    isShiftDown: boolean;
}

export class ControlKeysState implements ControlKeysStateOptions {
    isCtrlDown = false;
    isAltDown = false;
    isShiftDown = false;

    get isAnyKeyDown() {
        profiler.trace();

        return this.isCtrlDown || this.isAltDown || this.isShiftDown;
    }

    get keysStr() {
        profiler.trace();

        return [
            this.isCtrlDown ? "Ctrl" : "",
            this.isAltDown ? "Alt" : "",
            this.isShiftDown ? "Shift" : "",
        ]
            .filter(s => s)
            .join("+");
    }

    constructor() {
        makeAutoObservable(this);
    }

    update({isCtrlDown, isAltDown, isShiftDown}: ControlKeysStateOptions) {
        this.isCtrlDown = isCtrlDown;
        this.isAltDown = isAltDown;
        this.isShiftDown = isShiftDown;
    }

    reset() {
        this.update({
            isCtrlDown: false,
            isAltDown: false,
            isShiftDown: false,
        });
    }
}

export const controlKeysState = new ControlKeysState();

export const useUpdateControlKeysState = () => {
    const shiftTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const handleKeyboardEvent = ({ctrlKey: winCtrlKey, metaKey: macCtrlKey, altKey: isAltDown, shiftKey: isShiftDown}: KeyboardEvent) => {
        const isCtrlDown = winCtrlKey || macCtrlKey;
        const doSet = () => controlKeysState.update({
            isCtrlDown: isCtrlDown,
            isAltDown: isAltDown,
            isShiftDown: isShiftDown,
        });
        if (shiftTimeoutRef.current) {
            clearTimeout(shiftTimeoutRef.current);
        }
        if (controlKeysState.isShiftDown && !isShiftDown) {
            shiftTimeoutRef.current = setTimeout(doSet, 100);
        } else {
            shiftTimeoutRef.current = undefined;
            doSet();
        }
    };

    useEventListener(window, "keydown", handleKeyboardEvent);
    useEventListener(window, "keyup", handleKeyboardEvent);
    useEventListener(window, "blur", () => controlKeysState.reset());
};
