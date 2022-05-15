export const loadBoolFromLocalStorage = (key: string, defaultValue = false) =>
    typeof window.localStorage[key] === "string" ? window.localStorage[key] === "1" : defaultValue;

export const saveBoolToLocalStorage = (key: string, value: boolean) => window.localStorage[key] = value ? "1" : "0";

export const loadNumberFromLocalStorage = (key: string, defaultValue = 0) =>
    typeof window.localStorage[key] === "string" ? Number(window.localStorage[key]) : defaultValue;

export const saveNumberToLocalStorage = (key: string, value: number) => window.localStorage[key] = value.toString();
