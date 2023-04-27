import {Rect} from "../layout/Rect";

export enum PuzzleImportPuzzleType {
    Regular = "regular",
    Latin = "latin",
    Calculator = "calculator",
    Cubedoku = "cubedoku",
    Rotatable = "rotatable",
    SafeCracker = "safe-cracker",
    InfiniteRings = "infinite-rings",
    Jigsaw = "jigsaw",
    RushHour = "rush-hour",
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
    rotatableClues?: boolean;
    "product-arrow"?: boolean;
    yajilinFog?: boolean;
    cosmeticsBehindFog?: boolean;
    safeCrackerCodeLength?: number;
    visibleRingsCount?: number;
    startOffset?: number;
    allowOverrideColors?: boolean;
    angleStep?: number;
    shuffle?: boolean;
    stickyRegion?: Rect;
    noStickyRegionValidation?: boolean;
    stickyDigits?: boolean;
    splitUnconnectedRegions?: boolean;
}

// Ensure that the object contains only properties of PuzzleImportOptions
const sanitizeGridImportOptions = ({load, offsetX = 0, offsetY = 0}: PuzzleGridImportOptions)
    : Required<PuzzleGridImportOptions> => ({
    load,
    offsetX: Number(offsetX),
    offsetY: Number(offsetY),
});
export const sanitizeImportOptions = (importOptions: PuzzleImportOptions): PuzzleImportOptions => {
    // typescript trick: treat all properties as "required", to ensure that no property was accidentally forgotten

    const {
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
        rotatableClues,
        "product-arrow": productArrow,
        yajilinFog,
        cosmeticsBehindFog,
        safeCrackerCodeLength,
        visibleRingsCount,
        startOffset = 0,
        allowOverrideColors,
        digitsCount,
        angleStep = 0,
        shuffle,
        stickyRegion,
        noStickyRegionValidation,
        stickyDigits,
        splitUnconnectedRegions,
    } = importOptions as Required<PuzzleImportOptions>;

    // noinspection UnnecessaryLocalVariableJS
    const result: Required<PuzzleImportOptions> = {
        ...sanitizeGridImportOptions(importOptions),
        extraGrids: Object.fromEntries(
            [...(Array.isArray(extraGrids) ? extraGrids.entries() : Object.entries(extraGrids))]
                .map(([key, grid]) => [key, sanitizeGridImportOptions(grid)]),
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
        rotatableClues,
        "product-arrow": productArrow,
        yajilinFog,
        cosmeticsBehindFog,
        safeCrackerCodeLength: safeCrackerCodeLength === undefined
            ? undefined as unknown as number
            : Number(safeCrackerCodeLength),
        visibleRingsCount: visibleRingsCount === undefined
            ? undefined as unknown as number
            : Number(visibleRingsCount),
        startOffset: Number(startOffset),
        allowOverrideColors,
        digitsCount: digitsCount === undefined
            ? undefined as unknown as number
            : Number(digitsCount),
        angleStep: Number(angleStep),
        shuffle,
        stickyRegion: stickyRegion && {
            top: Number(stickyRegion.top),
            left: Number(stickyRegion.left),
            width: Number(stickyRegion.width),
            height: Number(stickyRegion.height),
        },
        noStickyRegionValidation,
        stickyDigits,
        splitUnconnectedRegions,
    };

    return result;
};
