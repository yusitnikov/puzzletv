export enum PuzzleImportPuzzleType {
    Regular = "regular",
    Latin = "latin",
    Calculator = "calculator",
    Cubedoku = "cubedoku",
    Rotatable = "rotatable",
    SafeCracker = "safe-cracker",
    InfiniteRings = "infinite-rings",
}

export interface PuzzleImportOptions {
    load: string;
    type?: PuzzleImportPuzzleType;
    htmlRules?: boolean;
    digitsCount?: number;
    tesseract?: boolean;
    fillableDigitalDisplay?: boolean;
    noSpecialRules?: boolean;
    loopX?: boolean;
    loopY?: boolean;
    "product-arrow"?: boolean;
    yajilinFog?: boolean;
    cosmeticsBehindFog?: boolean;
    safeCrackerCodeLength?: number;
    visibleRingsCount?: number;
    startOffset?: number;
    allowOverrideColors?: boolean;
}
