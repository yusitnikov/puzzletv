export const loadBoolFromLocalStorage = (key: string, defaultValue = false) =>
    typeof window.localStorage[key] === "string" ? window.localStorage[key] === "1" : defaultValue;

export const saveBoolToLocalStorage = (key: string, value: boolean) => window.localStorage[key] = value ? "1" : "0";

export const loadNumberFromLocalStorage = (key: string, defaultValue = 0) =>
    typeof window.localStorage[key] === "string" ? Number(window.localStorage[key]) : defaultValue;

export const saveNumberToLocalStorage = (key: string, value: number) => window.localStorage[key] = value.toString();

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
