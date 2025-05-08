import { PuzzleDefinition, PuzzleDefinitionLoader } from "../../types/puzzle/PuzzleDefinition";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { sha1 } from "hash.js";
import { arrayContainsPosition } from "../../types/layout/Position";
import {
    CenteredCalculatorDigitComponentType,
    RegularCalculatorDigitComponentType,
} from "../../components/puzzle/digit/CalculatorDigit";
import { RegularDigitComponentType } from "../../components/puzzle/digit/RegularDigit";
import { PuzzleTypeManager } from "../../types/puzzle/PuzzleTypeManager";
import { LatinDigitTypeManager } from "../../puzzleTypes/latin/types/LatinDigitTypeManager";
import { CubedokuTypeManager } from "../../puzzleTypes/cubedoku/types/CubedokuTypeManager";
import { SafeCrackerTypeManager } from "../../puzzleTypes/safe-cracker/types/SafeCrackerTypeManager";
import { RotatableDigitTypeManager } from "../../puzzleTypes/rotatable/types/RotatableDigitTypeManager";
import { InfiniteRingsTypeManager } from "../../puzzleTypes/infinite-rings/types/InfiniteRingsTypeManager";
import { TesseractTypeManager } from "../../puzzleTypes/tesseract/types/TesseractTypeManager";
import { YajilinFogTypeManager } from "../../puzzleTypes/yajilin-fog/types/YajilinFogTypeManager";
import { FogStarsTypeManager } from "../../puzzleTypes/fog-stars/types/FogStarsTypeManager";
import { JigsawTypeManager } from "../../puzzleTypes/jigsaw/types/JigsawTypeManager";
import {
    PuzzleImportDigitType,
    PuzzleImportOptions,
    PuzzleImportPuzzleType,
    PuzzleImportSource,
    sanitizeImportOptions,
} from "../../types/puzzle/PuzzleImportOptions";
import { AnyPTM } from "../../types/puzzle/PuzzleTypeMap";
import { JssTypeManager } from "../../puzzleTypes/jss/types/JssTypeManager";
import { RushHourTypeManager } from "../../puzzleTypes/rush-hour/types/RushHourTypeManager";
import { ImportedRotatableCluesTypeManager } from "../../puzzleTypes/rotatable-clues/types/RotatableCluesTypeManager";
import { SokobanTypeManager } from "../../puzzleTypes/sokoban/types/SokobanTypeManager";
import { TetrisTypeManager } from "../../puzzleTypes/tetris/types/TetrisTypeManager";
import { QuadInputTypeManager } from "../../components/puzzle/constraints/quad/QuadInput/QuadInputTypeManager";
import { Find3TypeManager } from "../../puzzleTypes/find3/types/Find3TypeManager";
import { FullCubeTypeManager } from "../../puzzleTypes/cube/types/FullCubeTypeManager";
import { FullCubeJssConstraint } from "../../puzzleTypes/cube/constraints/FullCubeJss";
import { ShuffledTypeManager } from "../../puzzleTypes/shuffled/types/ShuffledTypeManager";
import { ImportedScrewsTypeManager } from "../../puzzleTypes/screws/types/ScrewsTypeManager";
import { PuzzleImporter } from "./PuzzleImporter";
import { GridParser, GridParserFactory } from "./GridParser";
import { FullCubePTM } from "../../puzzleTypes/cube/types/FullCubePTM";
import { EggSokobanTypeManager } from "../../puzzleTypes/sokoban/egg/types/EggSokobanTypeManager";
import { RuleBoxTypeManager } from "../../puzzleTypes/rule-box/types/RuleBoxTypeManager";
import { CaterpillarTypeManager } from "../../puzzleTypes/caterpillar/types/CaterpillarTypeManager";
import { FPuzzlesGridParserFactory } from "./FPuzzles";
import { SudokuMakerGridParserFactory } from "./SudokuMaker";
import { SlideAndSeekTypeManager } from "../../puzzleTypes/slide-and-seek/types/SlideAndSeekTypeManager";
import { MergedCellsTypeManager } from "../../puzzleTypes/merged-cells/types/MergedCellsTypeManager";

const getGridParsersByImportOptions = <T extends AnyPTM>(
    importOptions: PuzzleImportOptions,
    gridParserFactory: GridParserFactory<T, any>,
): GridParser<T, any>[] => {
    const {
        load,
        offsetX: firstOffsetX = 0,
        offsetY: firstOffsetY = 0,
        extraGrids: extraGridLoad = {},
    } = importOptions;

    const mainGridParser = gridParserFactory(load, firstOffsetX, firstOffsetY, {});

    const extraGridParsers = (Array.isArray(extraGridLoad) ? extraGridLoad : Object.values(extraGridLoad)).map(
        ({ source, load, offsetX = 0, offsetY = 0, overrides = {} }) =>
            getGridParserFactoryByName<T, any>(source!)(load, offsetX, offsetY, overrides),
    );

    return [mainGridParser, ...extraGridParsers];
};

export const detectTypeManagerByImportOptions = <T extends AnyPTM, JsonT>(
    importOptions: PuzzleImportOptions,
    allGridParsers: GridParser<T, JsonT>[],
): PuzzleTypeManager<AnyPTM> => {
    let { type = PuzzleImportPuzzleType.Regular, digitType = PuzzleImportDigitType.Regular } = importOptions;

    const mainGridParser = allGridParsers[0];

    switch (type) {
        case PuzzleImportPuzzleType.Calculator:
            type = PuzzleImportPuzzleType.Regular;
            digitType = PuzzleImportDigitType.Calculator;
            break;
        case PuzzleImportPuzzleType.Latin:
            type = PuzzleImportPuzzleType.Regular;
            digitType = PuzzleImportDigitType.Latin;
            break;
    }

    const {
        tesseract,
        slideAndSeek,
        slideAndSeekDigits,
        yajilinFog,
        fogStars,
        fillableDigitalDisplay,
        safeCrackerCodeLength = 6,
        visibleRingsCount = 2,
        startOffset = 0,
        jss,
        rotatableClues,
        freeRotation,
        angleStep,
        stickyConstraintDigitAngle,
        sokoban,
        eggs,
        screws,
        fillableQuads,
        find3,
        giftsInSight,
        caterpillar,
    } = importOptions;

    const digitsCount = mainGridParser.maxDigit ?? importOptions.digitsCount ?? mainGridParser.size;

    const regularTypeManager = DigitPuzzleTypeManager();
    const typesMap: Record<PuzzleImportPuzzleType, PuzzleTypeManager<AnyPTM>> = {
        [PuzzleImportPuzzleType.Regular]: regularTypeManager,
        [PuzzleImportPuzzleType.Latin]: regularTypeManager,
        [PuzzleImportPuzzleType.Calculator]: regularTypeManager,
        [PuzzleImportPuzzleType.Cubedoku]: CubedokuTypeManager,
        [PuzzleImportPuzzleType.RotatableCube]: FullCubeTypeManager(),
        [PuzzleImportPuzzleType.Rotatable]: RotatableDigitTypeManager(importOptions),
        [PuzzleImportPuzzleType.SafeCracker]: SafeCrackerTypeManager({
            size: digitsCount,
            circleRegionsCount: Math.ceil((mainGridParser.size - 2) / 2),
            codeCellsCount: Math.min(mainGridParser.size, safeCrackerCodeLength),
        }),
        [PuzzleImportPuzzleType.InfiniteRings]: InfiniteRingsTypeManager(
            regularTypeManager,
            visibleRingsCount,
            startOffset,
        ),
        [PuzzleImportPuzzleType.Jigsaw]: JigsawTypeManager(importOptions),
        [PuzzleImportPuzzleType.Tetris]: TetrisTypeManager(importOptions),
        [PuzzleImportPuzzleType.Shuffled]: ShuffledTypeManager(importOptions),
        [PuzzleImportPuzzleType.RushHour]: RushHourTypeManager,
        [PuzzleImportPuzzleType.MergedCells]: MergedCellsTypeManager(importOptions),
    };

    let typeManager = typesMap[type] ?? regularTypeManager;
    if (sokoban) {
        typeManager = eggs ? EggSokobanTypeManager : SokobanTypeManager();
    }
    if (tesseract) {
        typeManager = TesseractTypeManager(typeManager);
    }
    if (slideAndSeek) {
        typeManager = SlideAndSeekTypeManager(typeManager, slideAndSeekDigits);
    }
    if (yajilinFog) {
        typeManager = YajilinFogTypeManager(typeManager);
    }
    if (fogStars) {
        typeManager = FogStarsTypeManager(typeManager);
    }
    if (jss && type !== PuzzleImportPuzzleType.RotatableCube) {
        const hasZeroRegion = allGridParsers.some(({ hasZeroRegion }) => hasZeroRegion);
        typeManager = JssTypeManager(typeManager, hasZeroRegion);
    }
    if (rotatableClues) {
        typeManager = ImportedRotatableCluesTypeManager({
            baseTypeManager: typeManager,
            compensateConstraintDigitAngle: !stickyConstraintDigitAngle,
            angleStep: freeRotation ? angleStep || 90 : 90,
        });
    }
    if (screws) {
        typeManager = ImportedScrewsTypeManager(typeManager);
    }
    if (fillableQuads) {
        const givenQuads = allGridParsers.flatMap(({ quadruplePositions = [] }) => quadruplePositions);

        typeManager = QuadInputTypeManager({
            parent: typeManager,
            allowRepeat: true,
            allowOverflow: true,
            isQuadAllowedFn(_, position) {
                if (givenQuads.length === 0) {
                    return true;
                }

                return position !== undefined && arrayContainsPosition(givenQuads, position);
            },
        });
    }
    if (find3) {
        typeManager = Find3TypeManager(typeManager, giftsInSight);
    }
    if (caterpillar) {
        typeManager = CaterpillarTypeManager(typeManager);
    }

    typeManager = RuleBoxTypeManager(typeManager);

    switch (digitType) {
        case PuzzleImportDigitType.Regular:
            typeManager = {
                ...typeManager,
                digitComponentType: RegularDigitComponentType(),
            };
            break;
        case PuzzleImportDigitType.Calculator:
            typeManager = {
                ...typeManager,
                digitComponentType: fillableDigitalDisplay
                    ? RegularCalculatorDigitComponentType()
                    : CenteredCalculatorDigitComponentType(),
            };
            break;
        case PuzzleImportDigitType.Latin:
            typeManager = LatinDigitTypeManager(typeManager);
            break;
    }

    return typeManager;
};

const loadByImportOptions = <T extends AnyPTM>(
    slug: string,
    importOptions: PuzzleImportOptions,
    gridParserFactory: GridParserFactory<T, any>,
): PuzzleDefinition<T> => {
    const { type = PuzzleImportPuzzleType.Regular, jss } = importOptions;

    const allGridParsers = getGridParsersByImportOptions(importOptions, gridParserFactory);

    const columnsCount = Math.max(...allGridParsers.map(({ offsetX, columnsCount }) => offsetX + columnsCount));
    const rowsCount = Math.max(...allGridParsers.map(({ offsetY, rowsCount }) => offsetY + rowsCount));

    console.debug("Importing from", slug, ...allGridParsers);

    const typeManager = detectTypeManagerByImportOptions(importOptions, allGridParsers);

    const importer = new PuzzleImporter<T>(slug, importOptions, typeManager as unknown as PuzzleTypeManager<T>, {
        gridSize: Math.max(rowsCount, columnsCount),
        rowsCount,
        columnsCount,
    });

    for (const gridParser of allGridParsers) {
        importer.addGrid(gridParser);
    }

    if (jss && type === PuzzleImportPuzzleType.RotatableCube) {
        (importer as unknown as PuzzleImporter<FullCubePTM>).addItems(FullCubeJssConstraint);
        importer.importGivenColorsAsSolution();
    }

    return importer.finalize();
};

const gridParserFactoryMap = {
    [PuzzleImportSource.FPuzzles]: FPuzzlesGridParserFactory,
    [PuzzleImportSource.SudokuMaker]: SudokuMakerGridParserFactory,
};
export const getGridParserFactoryByName = <T extends AnyPTM, JsonT>(source: PuzzleImportSource) =>
    gridParserFactoryMap[source] as unknown as GridParserFactory<T, JsonT>;

export const getPuzzleImportLoader = <T extends AnyPTM>(
    slug: string,
    source: PuzzleImportSource,
): PuzzleDefinitionLoader<T> => ({
    noIndex: true,
    slug,
    loadPuzzle: (params) => {
        if (typeof params.load !== "string") {
            throw new Error("Missing parameter");
        }

        params = sanitizeImportOptions(params, source);

        return {
            ...loadByImportOptions(slug, params, getGridParserFactoryByName(source)),
            saveStateKey: `${slug}-${sha1().update(JSON.stringify(params)).digest("hex").substring(0, 20)}`,
        };
    },
});

export const FPuzzles = getPuzzleImportLoader("f-puzzles", PuzzleImportSource.FPuzzles);
export const SudokuMaker = getPuzzleImportLoader("sudokumaker", PuzzleImportSource.SudokuMaker);
