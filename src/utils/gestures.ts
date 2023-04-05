import {useEventListener} from "../hooks/useEventListener";
import {EventHandlerProps} from "./mergeEventHandlerProps";

export const useGesturesGlobalEvents = () => {
    // Make sure that the gesture that starts in one element can continue outside of this element
    useEventListener(window, "pointerdown", ({target, pointerId}) => {
        const element = target as Element;
        if (element?.hasPointerCapture?.(pointerId)) {
            element?.releasePointerCapture?.(pointerId);
        }
    });
};

export const useOutsideClick = (handler: () => void) => useEventListener(window, "mousedown", handler);
export const cancelOutsideClickProps: Pick<EventHandlerProps<any>, "onMouseDown"> = {
    onMouseDown: (ev) => ev.stopPropagation(),
};
