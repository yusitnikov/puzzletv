import {deflate, inflate} from "pako";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const zip = (str: string) => {
    const encodedBuffer = deflate(encoder.encode(str));
    let encodedStr = "";
    for (const code of encodedBuffer) {
        encodedStr += String.fromCharCode(code);
    }
    return encodedStr;
};

export const unzip = (encoded: string) => {
    const buffer = new Uint8Array(encoded.length);
    for (let i = 0; i < encoded.length; i++) {
        buffer[i] = encoded.charCodeAt(i);
    }
    return decoder.decode(inflate(buffer));
};
