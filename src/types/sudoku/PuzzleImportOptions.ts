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
    Tetris = "tetris",
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
    sokoban?: boolean;
    "product-arrow"?: boolean;
    transparentArrowCircle?: boolean;
    yajilinFog?: boolean;
    cosmeticsBehindFog?: boolean;
    safeCrackerCodeLength?: number;
    visibleRingsCount?: number;
    startOffset?: number;
    allowOverrideColors?: boolean;
    angleStep?: number;
    shuffle?: boolean;
    stickyJigsawPiece?: number;
    stickyRegion?: Rect;
    noStickyRegionValidation?: boolean;
    stickyDigits?: boolean;
    splitUnconnectedRegions?: boolean;
    givenDigitsBlockCars?: boolean;
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
        sokoban,
        "product-arrow": productArrow,
        transparentArrowCircle,
        yajilinFog,
        cosmeticsBehindFog,
        safeCrackerCodeLength,
        visibleRingsCount,
        startOffset = 0,
        allowOverrideColors,
        digitsCount,
        angleStep = 0,
        shuffle,
        stickyJigsawPiece,
        stickyRegion,
        noStickyRegionValidation,
        stickyDigits,
        splitUnconnectedRegions,
        givenDigitsBlockCars,
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
        sokoban,
        "product-arrow": productArrow,
        transparentArrowCircle,
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
        stickyJigsawPiece: stickyJigsawPiece && Number(stickyJigsawPiece),
        stickyRegion: stickyRegion && {
            top: Number(stickyRegion.top),
            left: Number(stickyRegion.left),
            width: Number(stickyRegion.width),
            height: Number(stickyRegion.height),
        },
        noStickyRegionValidation,
        stickyDigits,
        splitUnconnectedRegions,
        givenDigitsBlockCars,
    };

    return result;
};
