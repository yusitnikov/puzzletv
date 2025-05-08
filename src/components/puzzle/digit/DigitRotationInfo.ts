export interface DigitRotationInfo {
    isRotatable?: boolean;
    rotatesInto?: number | ((angle: number) => number);
}
