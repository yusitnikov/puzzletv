import {useEventListener} from "../hooks/useEventListener";
import {EventHandlerProps, NativeEventHandlerProps, wrapNativeEventHandlerProps} from "../types/dom/EventHandlerProps";
import {useAutoIncrementId} from "../hooks/useAutoIncrementId";
import {useEffect, useMemo} from "react";
import {useLastValueRef} from "../hooks/useLastValueRef";
import {average} from "./math";
import {usePureMemo} from "../hooks/usePureMemo";
import {useDiffEffect} from "../hooks/useDiffEffect";

const releasePointerCapture = ({target, pointerId}: PointerEvent) => {
    const element = target as Element;
    if (element?.hasPointerCapture?.(pointerId)) {
        element?.releasePointerCapture?.(pointerId);
    }
};

export const useGesturesGlobalEvents = () => {
    // Make sure that the gesture that starts in one element can continue outside of this element
    useEventListener(window, "pointerdown", releasePointerCapture);

    const gestureHandler = getGestureHandlerPropsNative();
    useEventListener(window, "pointerdown", gestureHandler.onPointerDown);
    useEventListener(window, "pointerup", gestureHandler.onPointerUp);
    useEventListener(window, "pointermove", gestureHandler.onPointerMove);
    useEventListener(window, "mousemove", gestureHandler.onMouseMove);
};

export const useOutsideClick = (handler: () => void) => useEventListener(window, "mousedown", handler);
export const cancelOutsideClickProps: Pick<EventHandlerProps<any>, "onMouseDown"> = {
    onMouseDown: (ev) => ev.stopPropagation(),
};

export interface BasePointerStateExtraData {
    tags: string[];
}

export interface PointerState<EventT = PointerEvent> {
    event: EventT;
    time: number;
    extraData?: BasePointerStateExtraData;
}

export interface PointerMovementInfo {
    pointerId: number;
    start: PointerState;
    current: PointerState;
    length: number;
}

export enum GestureFinishReason {
    pointerUp,
    startNewGesture,
    stalePointer,
    staleContext,
}

export interface GestureIsValidProps extends PointerState {
    gesture: GestureInfo;
}

export interface GestureOnStartProps extends PointerState {
    gesture: GestureInfo;
}

export interface GestureOnContinueProps {
    gesture: GestureInfo;
    startMetrics: GestureMetrics;
    prevMetrics: GestureMetrics;
    currentMetrics: GestureMetrics;
    prevData: PointerState;
    currentData: PointerState;
}

export interface GestureOnEndProps {
    gesture: GestureInfo;
    reason: GestureFinishReason;
}

export type GestureOnDoubleClickProps = PointerState<MouseEvent>;

export type GestureOnContextMenuProps = PointerState<MouseEvent>;

export interface GestureHandler {
    contextId: string | number;
    isValidGesture?(props: GestureIsValidProps): boolean;
    onStart?(props: GestureOnStartProps): void;
    onContinue?(props: GestureOnContinueProps): void;
    onEnd?(props: GestureOnEndProps): void;
    onDoubleClick?(props: GestureOnDoubleClickProps): boolean;
    onContextMenu?(props: GestureOnContextMenuProps): boolean;
}

export interface GestureMetrics {
    x: number;
    y: number;
    scale: number;
    rotation: number;
}

export class GestureInfo {
    private pointersMap: Record<number, PointerMovementInfo> = {};
    public get pointers() { return Object.values(this.pointersMap); }
    public isClick = true;
    public handler?: GestureHandler;

    public getPointer(pointerId: number): PointerMovementInfo | undefined {
        return this.pointersMap[pointerId];
    }

    public addPointer(pointer: PointerMovementInfo) {
        this.pointersMap[pointer.pointerId] = pointer;
    }

    public removePointer(pointerId: number) {
        delete this.pointersMap[pointerId];
    }

    private getMetrics(type: "start" | "current"): GestureMetrics {
        const pointers = this.pointers.map(value => value[type].event);
        const isMultiTouch = pointers.length > 1;
        const x = average(pointers.map(({screenX}) => screenX));
        const y = average(pointers.map(({screenY}) => screenY));
        const relative = pointers.map(({screenX, screenY}) => ({
            dx: screenX - x,
            dy: screenY - y,
        }));

        return {
            x,
            y,
            scale: isMultiTouch
                ? average(relative.map(({dx, dy}) => Math.hypot(dx, dy)))
                : 1,
            rotation: isMultiTouch
                ? Math.atan2(relative[0].dy, relative[0].dx) * 180 / Math.PI
                : 0,
        };
    }

    public getStartMetrics() {
        return this.getMetrics("start");
    }

    public getCurrentMetrics() {
        return this.getMetrics("current");
    }
}

let currentGesture: GestureInfo | undefined = undefined;

const finalizeGesture = (reason: GestureFinishReason) => {
    if (!currentGesture) {
        return;
    }

    currentGesture?.handler?.onEnd?.({gesture: currentGesture, reason});

    for (const pointer of currentGesture.pointers) {
        pointer.start = pointer.current;
        pointer.length = 0;
    }
};

const releasePointer = (pointerId: number, reason: GestureFinishReason) => {
    finalizeGesture(reason);

    if (!currentGesture) {
        return;
    }

    currentGesture.removePointer(pointerId);
    if (currentGesture.pointers.length === 0) {
        currentGesture = undefined;
    }
};

const releaseStalePointers = () => {
    const now = Date.now();
    for (const {pointerId, current: {time}} of currentGesture?.pointers ?? []) {
        // Assume that the gesture is stale if it's more than 60 seconds old
        if (now - time > 60000) {
            releasePointer(pointerId, GestureFinishReason.stalePointer);
        }
    }
};

export const getGestureHandlerPropsNative = (handlers?: GestureHandler[], getExtraDataByEvent?: (ev: PointerEvent | MouseEvent) => (BasePointerStateExtraData | undefined))
    : Required<NativeEventHandlerProps<"onPointerDown" | "onPointerUp" | "onPointerMove" | "onMouseMove" | "onDoubleClick" | "onContextMenu">> => ({
    onPointerDown: (ev) => {
        releasePointerCapture(ev);

        // pointerId is always the same on desktop, so make sure to release the previous gesture if new gesture started
        releasePointer(ev.pointerId, GestureFinishReason.startNewGesture);

        releaseStalePointers();

        finalizeGesture(GestureFinishReason.startNewGesture);
        if (ev.isPrimary) {
            // If it's the new primary pointer then all previous pointers are already released
            currentGesture = undefined;
        } else if (!currentGesture) {
            // If it's not the new primary pointer, but the current gesture is empty, then secondary pointer should be ignored
            return;
        }

        currentGesture = currentGesture ?? new GestureInfo();
        const state: PointerState = {
            event: ev,
            time: Date.now(),
            extraData: getExtraDataByEvent?.(ev),
        };
        currentGesture.addPointer({
            pointerId: ev.pointerId,
            start: state,
            current: state,
            length: 0,
        });
        if (currentGesture.pointers.length > 1) {
            currentGesture.isClick = false;
        }

        const isValidGestureProps = {
            gesture: currentGesture,
            ...state,
        };
        if (!currentGesture.handler || currentGesture.handler.isValidGesture?.(isValidGestureProps) === false) {
            currentGesture.handler = undefined;
            for (const handler of handlers ?? []) {
                if (handler && handler.isValidGesture?.(isValidGestureProps) !== false) {
                    currentGesture.handler = handler;
                    break;
                }
            }
        }

        if (currentGesture.handler) {
            currentGesture.handler.onStart?.({gesture: currentGesture, ...state});
            ev.stopPropagation();
        }
    },
    onPointerUp: (ev) => {
        releasePointer(ev.pointerId, GestureFinishReason.pointerUp);
    },
    onPointerMove: (ev) => {
        // Ignore the event on desktop if the mouse moves without holding any mouse button
        if (!currentGesture || !ev.buttons) {
            return;
        }

        ev.stopPropagation();

        releaseStalePointers();

        const pointer = currentGesture?.getPointer(ev.pointerId);
        if (!pointer) {
            return;
        }

        const prevData = pointer.current;
        pointer.length += Math.hypot(ev.screenX - prevData.event.screenX, ev.screenY - prevData.event.screenY);
        if (pointer.length > 10) {
            currentGesture.isClick = false;
        }

        const startMetrics = currentGesture.getStartMetrics();
        const prevMetrics = currentGesture.getCurrentMetrics();
        pointer.current = {
            event: ev,
            time: Date.now(),
            extraData: getExtraDataByEvent?.(ev),
        };
        const currentMetrics = currentGesture.getCurrentMetrics();
        currentGesture.handler?.onContinue?.({
            gesture: currentGesture,
            startMetrics,
            prevMetrics,
            currentMetrics,
            prevData,
            currentData: pointer.current,
        });
    },
    onMouseMove: (ev) => {
        // Finish the last gesture on desktop if a mouse moves without holding any mouse button
        if (!ev.buttons) {
            finalizeGesture(GestureFinishReason.stalePointer);
            currentGesture = undefined;
        }
    },
    onDoubleClick: (ev) => {
        const props: GestureOnDoubleClickProps = {
            event: ev,
            time: Date.now(),
            extraData: getExtraDataByEvent?.(ev),
        };

        for (const handler of handlers ?? []) {
            if (handler.onDoubleClick?.(props)) {
                ev.stopPropagation();
                break;
            }
        }
    },
    onContextMenu: (ev) => {
        const props: GestureOnContextMenuProps = {
            event: ev,
            time: Date.now(),
            extraData: getExtraDataByEvent?.(ev),
        };

        for (const handler of handlers ?? []) {
            if (handler.onContextMenu?.(props)) {
                ev.stopPropagation();
                break;
            }
        }
    },
});

export const getGestureHandlerProps = (handlers?: GestureHandler[], getExtraDataByEvent?: (ev: PointerEvent | MouseEvent) => (BasePointerStateExtraData | undefined)) =>
    wrapNativeEventHandlerProps(getGestureHandlerPropsNative(handlers, getExtraDataByEvent));

/*
 * Register context ID as an allowed context. Finish current gesture with this context if the context becomes stale.
 *
 * Return the memoized the handler with the updated contextId.
 */
export const useGestureHandler = (handler?: GestureHandler): GestureHandler => {
    const autoIncrementId = useAutoIncrementId();
    const finalContextId = `${autoIncrementId}-${handler?.contextId}`;

    const handlerRef = useLastValueRef(handler);

    useEffect(() => {
        return () => {
            if (finalContextId && currentGesture?.handler?.contextId === finalContextId) {
                finalizeGesture(GestureFinishReason.staleContext);
                currentGesture = undefined;
            }
        };
    },[finalContextId]);

    return useMemo<GestureHandler>(() => ({
        contextId: finalContextId,
        isValidGesture: (props) => handlerRef.current?.isValidGesture?.(props) !== false,
        onStart: (props) => handlerRef.current?.onStart?.(props),
        onContinue: (props) => handlerRef.current?.onContinue?.(props),
        onEnd: (props) => handlerRef.current?.onEnd?.(props),
        onDoubleClick: (props) => handlerRef.current?.onDoubleClick?.(props) ?? false,
        onContextMenu: (props) => handlerRef.current?.onContextMenu?.(props) ?? false,
    }), [finalContextId, handlerRef]);
};

// Same as useGestureHandler, but for multiple handlers at once
export const useGestureHandlers = (handlers: GestureHandler[]): GestureHandler[] => {
    const autoIncrementId = useAutoIncrementId();

    const handlersRef = useLastValueRef(handlers);
    const updatedHandlers = useMemo(
        () => handlers.map(({contextId}, index): GestureHandler => ({
            contextId: `${autoIncrementId}-${contextId}`,
            isValidGesture: (props) => handlersRef.current[index]?.isValidGesture?.(props) !== false,
            onStart: (props) => handlersRef.current[index]?.onStart?.(props),
            onContinue: (props) => handlersRef.current[index]?.onContinue?.(props),
            onEnd: (props) => handlersRef.current[index]?.onEnd?.(props),
            onDoubleClick: (props) => handlersRef.current[index]?.onDoubleClick?.(props) ?? false,
            onContextMenu: (props) => handlersRef.current[index]?.onContextMenu?.(props) ?? false,
        })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [handlersRef, autoIncrementId, handlers.map(({contextId}) => contextId).join(",")]
    );

    const contextIds = usePureMemo(updatedHandlers.map(({contextId}) => contextId));
    useDiffEffect(([prevContextIds], [currentContextIds]) => {
        const isInUse = (contextIds: typeof prevContextIds = []) => contextIds.includes(currentGesture?.handler?.contextId ?? "");
        if (isInUse(prevContextIds) && !isInUse(currentContextIds)) {
            finalizeGesture(GestureFinishReason.staleContext);
            currentGesture = undefined;
        }
    }, [contextIds]);

    return updatedHandlers;
};
