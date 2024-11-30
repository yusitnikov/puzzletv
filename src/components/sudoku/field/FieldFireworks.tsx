import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { useEffect, useMemo, useRef } from "react";
import { Fireworks, FireworksHandlers } from "@fireworks-js/react";
import { usePuzzleContainer } from "../../../contexts/PuzzleContainerContext";
import { emptyRect } from "../../../types/layout/Rect";
import { FireworksOptions } from "fireworks-js";
import { makeAutoObservable, runInAction } from "mobx";
import { settings } from "../../../types/layout/Settings";
import { AnimationSpeed } from "../../../types/sudoku/AnimationSpeed";
import { rafTime } from "../../../hooks/useRaf";

class FieldFireworksController {
    startTime = 0;
    endTime = 0;
    private promise = Promise.resolve();

    get isRunning() {
        if (settings.animationSpeed.get() === AnimationSpeed.immediate) {
            return false;
        }

        const now = rafTime();
        return now >= this.startTime && now <= this.endTime;
    }

    constructor() {
        makeAutoObservable(this);
    }

    then(action: () => void | Promise<void>) {
        return runInAction(() => {
            return (this.promise = this.promise.then(action));
        });
    }

    launch(interval = 3000) {
        runInAction(() => {
            this.startTime = Date.now();
            this.endTime = Date.now() + interval;
        });
    }
}

export const fieldFireworksController = new FieldFireworksController();

export const FieldFireworks = observer(function FieldFireworksFc() {
    profiler.trace();

    const { width, height } = usePuzzleContainer() ?? emptyRect;
    const sideMargin = Math.min(200, width / 3);
    const topMargin = Math.min(100, height / 3);

    const ref = useRef<FireworksHandlers | null>(null);
    (window as any).fireworks = ref;

    const options = useMemo(
        (): FireworksOptions => ({
            autoresize: false,
            boundaries: {
                x: sideMargin,
                y: topMargin,
                // adding the margin to the width due to a bug in the code
                width: width + sideMargin,
                height,
            },
            rocketsPoint: {
                min: 30,
                max: 70,
            },
            traceSpeed: 5,
        }),
        [width, height, sideMargin, topMargin],
    );

    useEffect(() => {
        ref.current?.updateSize({ width, height });
    }, [ref, width, height]);

    useEffect(() => {
        ref.current?.updateOptions(options);
    }, [ref, options]);

    const isRunning = fieldFireworksController.isRunning;
    useEffect(() => {
        fieldFireworksController.then(async () => {
            if (isRunning) {
                ref.current?.start();
            } else {
                await ref.current?.waitStop();
            }
        });
    }, [ref, isRunning]);

    return <Fireworks ref={ref} style={{ position: "absolute", inset: 0 }} autostart={false} options={options} />;
});
