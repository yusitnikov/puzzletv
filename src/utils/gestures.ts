import {useEventListener} from "../hooks/useEventListener";
import {EventHandlerProps} from "../types/dom/EventHandlerProps";
import {useAutoIncrementId} from "../hooks/useAutoIncrementId";
import {useEffect, useMemo, MouseEvent, PointerEvent} from "react";
import {useLastValueRef} from "../hooks/useLastValueRef";
import {average} from "./math";
import {usePureMemo} from "../hooks/usePureMemo";
import {useDiffEffect} from "../hooks/useDiffEffect";

const releasePointerCapture = ({target, pointerId}: PointerEvent<any>) => {
    const element = target as Element;
    if (element?.hasPointerCapture?.(pointerId)) {
        element?.releasePointerCapture?.(pointerId);
    }
};

export const useGesturesGlobalEvents = () => {
    // Make sure that the gesture that starts in one element can continue outside of this element
    useEventListener(window, "pointerdown", (ev) => releasePointerCapture(ev as any));

    const gestureHandler = getGestureHandlerProps();
    useEventListener(window, "pointerdown", (ev) => gestureHandler.onPointerDown(ev as any));
    useEventListener(window, "pointerup", (ev) => gestureHandler.onPointerUp(ev as any));
    useEventListener(window, "pointermove", (ev) => gestureHandler.onPointerMove(ev as any));
    useEventListener(window, "mousemove", (ev) => gestureHandler.onMouseMove(ev as any));
};

export const useOutsideClick = (handler: () => void) => useEventListener(window, "mousedown", handler);
export const cancelOutsideClickProps: Pick<EventHandlerProps<any>, "onMouseDown"> = {
    onMouseDown: (ev) => ev.stopPropagation(),
};

export interface BasePointerStateExtraData {
    tags: string[];
}

export interface PointerState<EventT = PointerEvent<any>> {
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

export type GestureOnDoubleClickProps<ElemT> = PointerState<MouseEvent<ElemT>>;

export type GestureOnContextMenuProps<ElemT> = PointerState<MouseEvent<ElemT>>;

export interface GestureHandler {
    contextId: string | number;
    isValidGesture?(props: GestureIsValidProps): boolean;
    onStart?(props: GestureOnStartProps): void;
    onContinue?(props: GestureOnContinueProps): void;
    onEnd?(props: GestureOnEndProps): void;
    onDoubleClick?(props: GestureOnDoubleClickProps<any>): boolean;
    onContextMenu?(props: GestureOnContextMenuProps<any>): boolean;
}

interface GestureMetricsPoint {
    x: number;
    y: number;
}

export interface GestureMetrics extends GestureMetricsPoint {
    scale: number;
    rotation: number;
}

export const emptyGestureMetrics: GestureMetrics = {
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
};

export const applyMetricsDiff = (current: GestureMetrics, metricsFrom: GestureMetrics, metricsTo: GestureMetrics): GestureMetrics => {
    // Calculate source metrics point's relative position in the dragged rect
    const fromInCurrent = transformPointCoordsAbsoluteToMetricsBase(metricsFrom, current);
    // Apply scale and rotation changes
    const updated = {
        scale: current.scale * metricsTo.scale / metricsFrom.scale,
        rotation: current.rotation + metricsTo.rotation - metricsFrom.rotation,
    };
    // Look where the new scale and rotation will put the source metrics point starting from the empty point
    const fromInUpdated = transformPointCoordsMetricsBaseToAbsolute(fromInCurrent, {x: 0, y: 0, ...updated});
    // Recalculate the offset to make the source and the destination metrics points match
    return {
        x: metricsTo.x - fromInUpdated.x,
        y: metricsTo.y - fromInUpdated.y,
        ...updated,
    };
};

const transformPointCoordsMetricsBaseToAbsolute = ({x, y}: GestureMetricsPoint, {x: baseX, y: baseY, scale, rotation}: GestureMetrics): GestureMetricsPoint => {
    rotation *= Math.PI / 180;
    return {
        x: baseX + scale * (x * Math.cos(rotation) - y * Math.sin(rotation)),
        y: baseY + scale * (y * Math.cos(rotation) + x * Math.sin(rotation)),
    };
};

const transformPointCoordsAbsoluteToMetricsBase = ({x, y}: GestureMetricsPoint, {x: baseX, y: baseY, scale, rotation}: GestureMetrics): GestureMetricsPoint => {
    rotation *= Math.PI / 180;
    x -= baseX;
    y -= baseY;
    x /= scale;
    y /= scale;
    return {
        x: x * Math.cos(rotation) + y * Math.sin(rotation),
        y: y * Math.cos(rotation) - x * Math.sin(rotation),
    };
};

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
        const x = average(pointers.map(({clientX}) => clientX));
        const y = average(pointers.map(({clientY}) => clientY));
        const relative = pointers.map(({clientX, clientY}) => ({
            dx: clientX - x,
            dy: clientY - y,
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

export const getGestureHandlerProps = <ElemT>(handlers?: GestureHandler[], getExtraDataByEvent?: (ev: PointerEvent<ElemT> | MouseEvent<ElemT>) => (BasePointerStateExtraData | undefined))
    : Required<EventHandlerProps<ElemT, "onPointerDown" | "onPointerUp" | "onPointerMove" | "onMouseMove" | "onDoubleClick" | "onContextMenu">> => ({
    onPointerDown: (ev) => {
        console.warn("pointer down", ev.target, ev.currentTarget, handlers);
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
        pointer.length += Math.hypot(ev.clientX - prevData.event.clientX, ev.clientY - prevData.event.clientY);
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
        const props: GestureOnDoubleClickProps<ElemT> = {
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
        const props: GestureOnContextMenuProps<ElemT> = {
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

/*
 * Register context ID as an allowed context. Finish current gesture with this context if the context becomes stale.
 *
 * Return the memoized the handler with the updated contextId.
 */
// noinspection JSUnusedGlobalSymbols
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
