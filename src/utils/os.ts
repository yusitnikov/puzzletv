// noinspection JSDeprecatedSymbols
export const platform: string = (window.navigator as any).userAgentData?.platform || window.navigator.platform || "unknown";

export const isMac = platform.toLowerCase().startsWith("mac");

export const ctrlKeyText = isMac ? "Cmd" : "Ctrl";
