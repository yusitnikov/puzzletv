const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const utf8ToBuffer = (s: string) => encoder.encode(s);

export const bufferToUtf8 = (a: Uint8Array) => decoder.decode(a);

export const bufferToBinaryString = (a: Uint8Array) => [...a].map((c) => String.fromCharCode(c)).join("");

export const binaryStringToBuffer = (s: string) => new Uint8Array(s.split("").map((c) => c.charCodeAt(0)));

export const utf8ToBinaryString = (s: string) => bufferToBinaryString(utf8ToBuffer(s));

// noinspection JSDeprecatedSymbols
export const utf8ToBase64 = (s: string) => btoa(utf8ToBinaryString(s));
