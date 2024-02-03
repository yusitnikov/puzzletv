import {Rect} from "../layout/Rect";

export enum PuzzleImportPuzzleType {
    Regular = "regular",
    Latin = "latin",
    Calculator = "calculator",
    Cubedoku = "cubedoku",
    RotatableCube = "rotatable-cube",
    Rotatable = "rotatable",
    SafeCracker = "safe-cracker",
    InfiniteRings = "infinite-rings",
    Jigsaw = "jigsaw",
    Tetris = "tetris",
    Shuffled = "shuffled",
    RushHour = "rush-hour",
}

export enum PuzzleImportDigitType {
    Regular = "regular",
    Latin = "latin",
    Calculator = "calculator",
}

export enum ColorsImportMode {
    Auto = "auto",
    Initials = "initials",
    Solution = "solution",
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
    fillableQuads?: boolean;
    find3?: boolean;
    giftsInSight?: boolean;
    fillableDigitalDisplay?: boolean;
    noSpecialRules?: boolean;
    loopX?: boolean;
    loopY?: boolean;
    jss?: boolean;
    rotatableClues?: boolean;
    keepCircles?: boolean;
    screws?: boolean;
    sokoban?: boolean;
    "product-arrow"?: boolean;
    transparentArrowCircle?: boolean;
    yajilinFog?: boolean;
    cosmeticsBehindFog?: boolean;
    safeCrackerCodeLength?: number;
    visibleRingsCount?: number;
    startOffset?: number;
    allowOverrideColors?: boolean;
    colorsImportMode?: ColorsImportMode;
    angleStep?: number;
    shuffle?: boolean;
    noPieceRegions?: boolean;
    stickyJigsawPiece?: number;
    stickyRegion?: Rect;
    noStickyRegionValidation?: boolean;
    stickyDigits?: boolean;
    splitUnconnectedRegions?: boolean;
    hideZeroRegion?: boolean;
    givenDigitsBlockCars?: boolean;
    supportZero?: boolean;
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
        fillableQuads,
        find3,
        giftsInSight,
        fillableDigitalDisplay,
        noSpecialRules,
        loopX,
        loopY,
        jss,
        rotatableClues,
        keepCircles,
        screws,
        sokoban,
        "product-arrow": productArrow,
        transparentArrowCircle,
        yajilinFog,
        cosmeticsBehindFog,
        safeCrackerCodeLength,
        visibleRingsCount,
        startOffset = 0,
        allowOverrideColors,
        colorsImportMode,
        digitsCount,
        angleStep = 0,
        shuffle,
        noPieceRegions,
        stickyJigsawPiece,
        stickyRegion,
        noStickyRegionValidation,
        stickyDigits,
        splitUnconnectedRegions,
        hideZeroRegion,
        givenDigitsBlockCars,
        supportZero,
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
        fillableQuads,
        find3,
        giftsInSight,
        fillableDigitalDisplay,
        noSpecialRules,
        loopX,
        loopY,
        jss,
        rotatableClues,
        keepCircles,
        screws,
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
        colorsImportMode: colorsImportMode === ColorsImportMode.Auto
            ? undefined as unknown as ColorsImportMode
            : colorsImportMode,
        digitsCount: digitsCount === undefined
            ? undefined as unknown as number
            : Number(digitsCount),
        angleStep: Number(angleStep),
        shuffle,
        noPieceRegions,
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
        hideZeroRegion,
        givenDigitsBlockCars,
        supportZero,
    };

    return result;
};
