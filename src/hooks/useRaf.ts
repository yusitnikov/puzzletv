import {useEventListener} from "./useEventListener";
import {customEventBus} from "../utils/customEventBus";
import {makeAutoObservable} from "mobx";

interface TickEventData {
    now: number;
    delta: number;
}

// TODO: replace by mobx OOTB functionality
class RafTime {
    time: number;

    constructor() {
        makeAutoObservable(this);

        this.time = Date.now();
    }

    update(now = Date.now()) {
        const prevTime = this.time;
        this.time = now;
        return now - prevTime;
    }
}

const rafTimeObj = new RafTime();
export const rafTime = () => rafTimeObj.time;

const startRaf = () => requestAnimationFrame(() => {
    const delta = rafTimeObj.update();
    customEventBus.dispatchEvent(new CustomEvent<TickEventData>("raf", {detail: {
        now: rafTime(),
        delta,
    }}));
    startRaf();
});
startRaf();

export const useRaf = (tickHandler: (delta: number, now: number) => void) => useEventListener(
    customEventBus,
    "raf",
    ({detail: {now, delta}}: CustomEvent<TickEventData>) => tickHandler?.(delta, now)
);
