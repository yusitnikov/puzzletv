import {useEffect, useRef} from "react";

export const useEventListener = <EventT extends Event, TargetT extends EventTarget>(target: TargetT, eventName: string, handler: (ev: EventT) => void) => {
    // Use reference to get rid of unnecessary dependencies
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        const handlerInstance = (ev: Event) => handlerRef.current(ev as EventT);
        target.addEventListener(eventName, handlerInstance);
        return () => target.removeEventListener(eventName, handlerInstance);
    }, [target, eventName, handlerRef]);
};
