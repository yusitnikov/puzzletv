import {useEventListener} from "./useEventListener";
import {customEventBus} from "../utils/customEventBus";
import {useState} from "react";

interface TickEventData {
    now: number;
    delta: number;
}

let lastTickTime = Date.now();
const startRaf = () => requestAnimationFrame(() => {
    const now = Date.now();
    const delta = now - lastTickTime;
    lastTickTime = now;
    customEventBus.dispatchEvent(new CustomEvent<TickEventData>("raf", {detail: {now, delta}}));
    startRaf();
});
startRaf();

export const useRaf = (tickHandler: (delta: number, now: number) => void) => useEventListener(
    customEventBus,
    "raf",
    ({detail: {now, delta}}: CustomEvent<TickEventData>) => tickHandler?.(delta, now)
);

export const useRafValue = <T>(value: T) => {
    const [state, setState] = useState(value);

    useRaf(() => setState(value));

    return state;
};
