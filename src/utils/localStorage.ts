import {useCallback} from "react";
import {useStateWithStorage} from "../hooks/useStateWithStorage";
import {makeAutoObservable} from "mobx";
import {computedFn} from "mobx-utils";

interface BasicItemManager<T> {
    get(): T;
    set(value: T): void;
}

interface ItemManager<T> {
    get(): T;
    set(value: T | ((prev: T) => T)): void;
}

const fromBasicItemManager = <T>({get, set}: BasicItemManager<T>): ItemManager<T> => ({
    get,
    set: (value) => set(typeof value === "function" ? (value as ((prev: T) => T))(get()) : value),
});

// noinspection JSUnusedLocalSymbols
class LocalStorageManager {
    private version = 0;

    constructor() {
        makeAutoObservable(this);

        window.addEventListener("storage", () => this.invalidate());
    }

    private invalidate() {
        ++this.version;
    }

    private getString = computedFn((key: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _accessVersionJustForDependency = this.version;

        return window.localStorage[key];
    });

    private setString(key: string, value: string) {
        window.localStorage[key] = value;
        this.invalidate();
    }

    getStringManager<T extends string>(key: string, defaultValue = "" as T): ItemManager<T> {
        return fromBasicItemManager<T>({
            get: () => this.getString(key) ?? defaultValue,
            set: (value) => this.setString(key, value),
        });
    }

    getBoolManager(key: string, defaultValue = false): ItemManager<boolean> {
        return fromBasicItemManager<boolean>({
            get: () => {
                const value = this.getString(key);
                return value !== undefined ? value === "1" : defaultValue;
            },
            set: (value) => this.setString(key, value ? "1" : "0"),
        });
    }

    getNumberManager<T extends number = number>(key: string, defaultValue = 0 as T): ItemManager<T> {
        return fromBasicItemManager<T>({
            get: () => {
                const value = this.getString(key);
                return value !== undefined ? Number(value) as T : defaultValue;
            },
            set: (value) => this.setString(key, value.toString()),
        });
    }
}

export const localStorageManager = new LocalStorageManager();

export const loadStringFromLocalStorage = <T extends string>(key: string, defaultValue = "" as T): T =>
    typeof window.localStorage[key] === "string" ? window.localStorage[key] : defaultValue;

export const saveStringToLocalStorage = (key: string, value: string) => window.localStorage[key] = value;

export const useStringFromLocalStorage = <T extends string>(key: string, defaultValue?: T) => useStateWithStorage<T>(
    () => loadStringFromLocalStorage(key, defaultValue),
    useCallback(value => saveStringToLocalStorage(key, value), [key])
);

export const loadBoolFromLocalStorage = (key: string, defaultValue = false) =>
    typeof window.localStorage[key] === "string" ? window.localStorage[key] === "1" : defaultValue;

export const saveBoolToLocalStorage = (key: string, value: boolean) => window.localStorage[key] = value ? "1" : "0";

export const useBoolFromLocalStorage = (key: string, defaultValue = false) => useStateWithStorage(
    () => loadBoolFromLocalStorage(key, defaultValue),
    useCallback(value => saveBoolToLocalStorage(key, value), [key])
);

export const loadNumberFromLocalStorage = (key: string, defaultValue = 0) =>
    typeof window.localStorage[key] === "string" ? Number(window.localStorage[key]) : defaultValue;

export const saveNumberToLocalStorage = (key: string, value: number) => window.localStorage[key] = value.toString();

export const useNumberFromLocalStorage = (key: string, defaultValue = 0) => useStateWithStorage(
    () => loadNumberFromLocalStorage(key, defaultValue),
    useCallback(value => saveNumberToLocalStorage(key, value), [key])
);

export const serializeToLocalStorage = (key: string, value: any, version = 1) => {
    localStorage[key] = version + ":" + JSON.stringify(value);
};

export const unserializeFromLocalStorage = (key: string, version = 1): any | undefined => {
    const serialized = window.localStorage[key];
    if (typeof serialized !== "string") {
        return undefined;
    }

    const [savedVersion, ...jsonParts] = serialized.split(":");
    if (savedVersion !== version.toString()) {
        return undefined;
    }

    return JSON.parse(jsonParts.join(":"));
};

export const useObjectFromLocalStorage = <T>(key: string, defaultValue?: T) => useStateWithStorage<T>(
    () => unserializeFromLocalStorage(key) ?? defaultValue,
    useCallback(value => serializeToLocalStorage(key, value), [key])
);
