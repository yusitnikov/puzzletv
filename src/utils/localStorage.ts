export const loadBoolFromLocalStorage = (key: string, defaultValue = false) =>
    typeof window.localStorage[key] === "string" ? window.localStorage[key] === "1" : defaultValue;

export const saveBoolToLocalStorage = (key: string, value: boolean) => window.localStorage[key] = value ? "1" : "0";
