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

// Ensure that the object contains only properties of PuzzleImportOptions
export const sanitizeImportOptions = (importOptions: Partial<PuzzleImportOptions>): Partial<PuzzleImportOptions> => {
    // typescript trick: treat all properties as "required", to ensure that no property was accidentally forgotten

    const {
        load,
        type,
        htmlRules,
        tesseract,
        fillableDigitalDisplay,
        noSpecialRules,
        loopX,
        loopY,
        "product-arrow": productArrow,
        yajilinFog,
        cosmeticsBehindFog,
        safeCrackerCodeLength,
        visibleRingsCount,
        startOffset,
        allowOverrideColors,
        digitsCount,
    } = importOptions as Required<PuzzleImportOptions>;

    // noinspection UnnecessaryLocalVariableJS
    const result: Required<PuzzleImportOptions> = {
        load,
        type,
        htmlRules,
        tesseract,
        fillableDigitalDisplay,
        noSpecialRules,
        loopX,
        loopY,
        "product-arrow": productArrow,
        yajilinFog,
        cosmeticsBehindFog,
        safeCrackerCodeLength,
        visibleRingsCount,
        startOffset,
        allowOverrideColors,
        digitsCount,
    };

    return result;
};
