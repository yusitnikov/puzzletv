import {useEffect} from "react";

class SingletonManager<T> {
    private usagesCount = 0;
    private instance?: T;

    constructor(private creator: () => T, private destructor?: (object: T) => void) {
    }

    public getOrCreate() {
        return this.instance = this.instance || this.creator();
    }

    public increment() {
        ++this.usagesCount;
        return this.getOrCreate();
    }

    public decrement() {
        --this.usagesCount;
        if (!this.usagesCount && this.destructor) {
            this.destructor(this.instance!);
            this.instance = undefined;
        }
        return this.instance;
    }
}

const map: Record<string, SingletonManager<any>> = {};
(window as any).map = map;

export function useSingleton<T>(key: string, creator: () => T, destructor?: (object: T) => void): T;
export function useSingleton<T>(key: string, creator: () => T, destructor: ((object: T) => void) | undefined, enabled: boolean): T | undefined;
export function useSingleton<T>(key: string, creator: () => T, destructor?: (object: T) => void, enabled = true): T | undefined {
    map[key] = map[key] || new SingletonManager(creator, destructor);
    const manager = map[key];

    useEffect(() => {
        if (enabled) {
            manager.increment();
            return () => manager.decrement();
        }
    }, [manager, enabled]);

    return enabled ? map[key].getOrCreate() : undefined;
};
