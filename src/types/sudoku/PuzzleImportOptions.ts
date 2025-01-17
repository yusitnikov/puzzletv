import { Rect } from "../layout/Rect";

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

export enum PuzzleImportSource {
    FPuzzles = "f-puzzles",
    SudokuMaker = "sudoku-maker",
}

export interface PuzzleGridImportOptions {
    source?: PuzzleImportSource;
    load: string;
    offsetX?: number;
    offsetY?: number;
    overrides?: Partial<PuzzleImportOptions>;
}

export interface PuzzleImportOptions extends PuzzleGridImportOptions {
    extraGrids?: PuzzleGridImportOptions[] | Record<string | number, PuzzleGridImportOptions>;
    title?: string;
    author?: string;
    type?: PuzzleImportPuzzleType;
    digitType?: PuzzleImportDigitType;
    htmlRules?: boolean;
    digitsCount?: number;
    tesseract?: boolean;
    slideAndSeek?: boolean;
    slideAndSeekDigits?: boolean;
    fillableQuads?: boolean;
    find3?: boolean;
    giftsInSight?: boolean;
    fillableDigitalDisplay?: boolean;
    noSpecialRules?: boolean;
    noSudoku?: boolean;
    loopX?: boolean;
    loopY?: boolean;
    jss?: boolean;
    rotatableClues?: boolean;
    wheels?: boolean;
    freeRotation?: boolean;
    keepCircles?: boolean;
    stickyConstraintDigitAngle?: boolean;
    screws?: boolean;
    sokoban?: boolean;
    eggs?: boolean;
    "product-arrow"?: boolean;
    transparentArrowCircle?: boolean;
    yajilinFog?: boolean;
    fogStars?: boolean;
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
    caterpillar?: boolean;
    dashedGrid?: boolean;
}

// Ensure that the object contains only properties of PuzzleImportOptions
const sanitizeGridImportOptions = ({
    source,
    load,
    offsetX = 0,
    offsetY = 0,
    overrides = {},
}: Omit<PuzzleGridImportOptions, "source"> &
    Required<Pick<PuzzleGridImportOptions, "source">>): Required<PuzzleGridImportOptions> => ({
    source,
    load,
    offsetX: Number(offsetX),
    offsetY: Number(offsetY),
    overrides,
});
export const sanitizeImportOptions = (
    importOptions: PuzzleImportOptions,
    source: PuzzleImportSource,
): PuzzleImportOptions => {
    // typescript trick: treat all properties as "required", to ensure that no property was accidentally forgotten

    const {
        extraGrids = {},
        title,
        author,
        type,
        digitType,
        htmlRules,
        tesseract,
        slideAndSeek,
        slideAndSeekDigits,
        fillableQuads,
        find3,
        giftsInSight,
        fillableDigitalDisplay,
        noSpecialRules,
        noSudoku,
        loopX,
        loopY,
        jss,
        rotatableClues,
        wheels,
        freeRotation,
        keepCircles,
        stickyConstraintDigitAngle,
        screws,
        sokoban,
        eggs,
        "product-arrow": productArrow,
        transparentArrowCircle,
        yajilinFog,
        fogStars,
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
        caterpillar,
        dashedGrid,
    } = importOptions as Required<PuzzleImportOptions>;

    // noinspection UnnecessaryLocalVariableJS
    const result: Required<PuzzleImportOptions> = {
        ...sanitizeGridImportOptions({ source, ...importOptions }),
        extraGrids: Object.fromEntries(
            [...(Array.isArray(extraGrids) ? extraGrids.entries() : Object.entries(extraGrids))].map(([key, grid]) => [
                key,
                sanitizeGridImportOptions({ source, ...grid }),
            ]),
        ),
        title,
        author,
        type,
        digitType,
        htmlRules,
        tesseract,
        slideAndSeek,
        slideAndSeekDigits,
        fillableQuads,
        find3,
        giftsInSight,
        fillableDigitalDisplay,
        noSpecialRules,
        noSudoku,
        loopX,
        loopY,
        jss,
        rotatableClues,
        wheels,
        freeRotation,
        keepCircles,
        stickyConstraintDigitAngle,
        screws,
        sokoban,
        eggs,
        "product-arrow": productArrow,
        transparentArrowCircle,
        yajilinFog,
        fogStars,
        cosmeticsBehindFog,
        safeCrackerCodeLength:
            safeCrackerCodeLength === undefined ? (undefined as unknown as number) : Number(safeCrackerCodeLength),
        visibleRingsCount:
            visibleRingsCount === undefined ? (undefined as unknown as number) : Number(visibleRingsCount),
        startOffset: Number(startOffset),
        allowOverrideColors,
        colorsImportMode:
            colorsImportMode === ColorsImportMode.Auto ? (undefined as unknown as ColorsImportMode) : colorsImportMode,
        digitsCount: digitsCount === undefined ? (undefined as unknown as number) : Number(digitsCount),
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
        caterpillar,
        dashedGrid,
    };

    return result;
};
