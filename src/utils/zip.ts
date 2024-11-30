import { deflate, inflate } from "pako";
import { binaryStringToBuffer, bufferToBinaryString, bufferToUtf8, utf8ToBuffer } from "./encoding";

export const zip = (str: string) => bufferToBinaryString(deflate(utf8ToBuffer(str)));

export const unzip = (encoded: string) => bufferToUtf8(inflate(binaryStringToBuffer(encoded)));
