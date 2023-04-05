import {useEffect} from "react";
import {useLastValueRef} from "./useLastValueRef";

export function useEventListener<K extends keyof WindowEventMap>(
    target: Window,
    eventName: K,
    handler: (ev: WindowEventMap[K]) => void,
): void;
export function useEventListener<K extends keyof ElementEventMap>(
    target: Element,
    eventName: K,
    handler: (ev: ElementEventMap[K]) => void,
): void;
export function useEventListener(
    target: EventTarget,
    eventName: string,
    handler: (ev: CustomEvent) => void,
): void;
export function useEventListener<E extends Event>(
    target: EventTarget,
    eventName: string,
    handler: (ev: E) => void,
) {
    // Use reference to get rid of unnecessary dependencies
    const handlerRef = useLastValueRef(handler);

    useEffect(() => {
        const handlerInstance = (ev: Event) => handlerRef.current(ev as E);
        target.addEventListener(eventName, handlerInstance);
        return () => target.removeEventListener(eventName, handlerInstance);
    }, [target, eventName, handlerRef]);
}
