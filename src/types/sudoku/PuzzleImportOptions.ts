export enum PuzzleImportPuzzleType {
    Regular = "regular",
    Latin = "latin",
    Calculator = "calculator",
    Cubedoku = "cubedoku",
    Rotatable = "rotatable",
    SafeCracker = "safe-cracker",
    InfiniteRings = "infinite-rings",
    Jigsaw = "jigsaw",
}

export enum PuzzleImportDigitType {
    Regular = "regular",
    Latin = "latin",
    Calculator = "calculator",
}

export interface PuzzleGridImportOptions {
    load: string;
    offsetX?: number;
    offsetY?: number;
}

export interface PuzzleImportOptions extends PuzzleGridImportOptions {
    extraGrids?: PuzzleGridImportOptions[] | Record<string | number, PuzzleGridImportOptions>;
    type?: PuzzleImportPuzzleType;
    digitType?: PuzzleImportDigitType;
    htmlRules?: boolean;
    digitsCount?: number;
    tesseract?: boolean;
    fillableDigitalDisplay?: boolean;
    noSpecialRules?: boolean;
    loopX?: boolean;
    loopY?: boolean;
    jss?: boolean;
    "product-arrow"?: boolean;
    yajilinFog?: boolean;
    cosmeticsBehindFog?: boolean;
    safeCrackerCodeLength?: number;
    visibleRingsCount?: number;
    startOffset?: number;
    allowOverrideColors?: boolean;
    angleStep?: number;
    shuffle?: boolean;
    stickyDigits?: boolean;
}

// Ensure that the object contains only properties of PuzzleImportOptions
export const sanitizeImportOptions = (importOptions: Partial<PuzzleImportOptions>): Partial<PuzzleImportOptions> => {
    // typescript trick: treat all properties as "required", to ensure that no property was accidentally forgotten

    const {
        load,
        offsetX,
        offsetY,
        extraGrids = {},
        type,
        digitType,
        htmlRules,
        tesseract,
        fillableDigitalDisplay,
        noSpecialRules,
        loopX,
        loopY,
        jss,
        "product-arrow": productArrow,
        yajilinFog,
        cosmeticsBehindFog,
        safeCrackerCodeLength,
        visibleRingsCount,
        startOffset,
        allowOverrideColors,
        digitsCount,
        angleStep,
        shuffle,
        stickyDigits,
    } = importOptions as Required<PuzzleImportOptions>;

    // noinspection UnnecessaryLocalVariableJS
    const result: Required<PuzzleImportOptions> = {
        load,
        offsetX,
        offsetY,
        extraGrids: Object.fromEntries(
            [...(Array.isArray(extraGrids) ? extraGrids.entries() : Object.entries(extraGrids))]
                .map(([key, {load, offsetX, offsetY}]) => [key, {load, offsetX, offsetY}]),
        ),
        type,
        digitType,
        htmlRules,
        tesseract,
        fillableDigitalDisplay,
        noSpecialRules,
        loopX,
        loopY,
        jss,
        "product-arrow": productArrow,
        yajilinFog,
        cosmeticsBehindFog,
        safeCrackerCodeLength,
        visibleRingsCount,
        startOffset,
        allowOverrideColors,
        digitsCount,
        angleStep,
        shuffle,
        stickyDigits,
    };

    return result;
};
