import {FC, memo} from "react";

class Profiler {
    enabled: boolean;
    runId = 0;
    data: Record<string, ProfilerItem> = {};

    constructor() {
        this.enabled = process.env.NODE_ENV === "development";
    }

    flush() {
        if (this.enabled) {
            console.log(`[${this.runId}]`);
            for (const [key, {count, time}] of Object.entries(this.data)) {
                console.log(`[${this.runId}] [${key}] ${time.toFixed(3)}s / ${count} = ${(time / count).toFixed(3 + count.toString().length)}s`);
            }

            let changed = 0;
            let same = 0;
            let changedByTagName: Record<string, number> = {};
            for (const el of document.querySelectorAll("body *")) {
                if (el.hasAttribute("data-rendered")) {
                    ++same;
                } else {
                    ++changed;
                    changedByTagName[el.tagName] = (changedByTagName[el.tagName] || 0) + 1;
                    el.setAttribute("data-rendered", "1");
                }
            }
            console.log(`[${this.runId}] ${same} same, ${changed} new`, changedByTagName);

            const tracker = new Timer((time) => console.log(`[${this.runId}] [render] ${time.toFixed(3)}s`));
            setTimeout(() => tracker.stop(), 0);
        }

        ++this.runId;
        this.data = {};
    }

    private _track(key: string, time: number) {
        this.data[key] = this.data[key] || {count: 0, time: 0};
        ++this.data[key].count;
        this.data[key].time += time;
    }

    track(key: string) {
        return new Timer((time: number) => {
            this._track("all", time);
            this._track(key, time);
        });
    }

    wrapFunc<TArgs extends Array<any>, TResult>(key: string, func: (...args: TArgs) => TResult): (...args: TArgs) => TResult {
        return (...args: TArgs) => {
            const tracker = this.track(key);
            try {
                return func(...args);
            } finally {
                tracker.stop();
            }
        };
    }

    memo<T extends object>(key: string, component: FC<T>) {
        return memo<T>(this.wrapFunc(key, component));
    }
}

interface ProfilerItem {
    count: number;
    time: number;
}

class Timer {
    startTime: number;

    constructor(private onStop: (time: number) => void) {
        this.startTime = Date.now();
    }

    stop() {
        const diff = (Date.now() - this.startTime) / 1000;
        this.onStop(diff);
    }
}

export const profiler = new Profiler();
