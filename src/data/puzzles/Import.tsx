import { PuzzleDefinition, PuzzleDefinitionLoader } from "../../types/sudoku/PuzzleDefinition";
import { DigitSudokuTypeManager } from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import { sha1 } from "hash.js";
import { arrayContainsPosition } from "../../types/layout/Position";
import {
    CenteredCalculatorDigitComponentType,
    RegularCalculatorDigitComponentType,
} from "../../components/sudoku/digit/CalculatorDigit";
import { RegularDigitComponentType } from "../../components/sudoku/digit/RegularDigit";
import { SudokuTypeManager } from "../../types/sudoku/SudokuTypeManager";
import { LatinDigitSudokuTypeManager } from "../../sudokuTypes/latin/types/LatinDigitSudokuTypeManager";
import { CubedokuTypeManager } from "../../sudokuTypes/cubedoku/types/CubedokuTypeManager";
import { SafeCrackerSudokuTypeManager } from "../../sudokuTypes/safe-cracker/types/SafeCrackerSudokuTypeManager";
import { RotatableDigitSudokuTypeManager } from "../../sudokuTypes/rotatable/types/RotatableDigitSudokuTypeManager";
import { InfiniteSudokuTypeManager } from "../../sudokuTypes/infinite-rings/types/InfiniteRingsSudokuTypeManager";
import { TesseractSudokuTypeManager } from "../../sudokuTypes/tesseract/types/TesseractSudokuTypeManager";
import { YajilinFogSudokuTypeManager } from "../../sudokuTypes/yajilin-fog/types/YajilinFogSudokuTypeManager";
import { FogStarsSudokuTypeManager } from "../../sudokuTypes/fog-stars/types/FogStarsSudokuTypeManager";
import { JigsawSudokuTypeManager } from "../../sudokuTypes/jigsaw/types/JigsawSudokuTypeManager";
import {
    PuzzleImportDigitType,
    PuzzleImportOptions,
    PuzzleImportPuzzleType,
    PuzzleImportSource,
    sanitizeImportOptions,
} from "../../types/sudoku/PuzzleImportOptions";
import { AnyPTM } from "../../types/sudoku/PuzzleTypeMap";
import { JssSudokuTypeManager } from "../../sudokuTypes/jss/types/JssSudokuTypeManager";
import { RushHourSudokuTypeManager } from "../../sudokuTypes/rush-hour/types/RushHourSudokuTypeManager";
import { ImportedRotatableCluesSudokuTypeManager } from "../../sudokuTypes/rotatable-clues/types/RotatableCluesSudokuTypeManager";
import { SokobanSudokuTypeManager } from "../../sudokuTypes/sokoban/types/SokobanSudokuTypeManager";
import { TetrisSudokuTypeManager } from "../../sudokuTypes/tetris/types/TetrisSudokuTypeManager";
import { QuadInputSudokuTypeManager } from "../../components/sudoku/constraints/quad/QuadInput/QuadInputSudokuTypeManager";
import { Find3SudokuTypeManager } from "../../sudokuTypes/find3/types/Find3SudokuTypeManager";
import { FullCubeTypeManager } from "../../sudokuTypes/cube/types/FullCubeTypeManager";
import { FullCubeJssConstraint } from "../../sudokuTypes/cube/constraints/FullCubeJss";
import { ShuffledSudokuTypeManager } from "../../sudokuTypes/shuffled/types/ShuffledSudokuTypeManager";
import { ImportedScrewsSudokuTypeManager } from "../../sudokuTypes/screws/types/ScrewsSudokuTypeManager";
import { PuzzleImporter } from "./PuzzleImporter";
import { GridParser, GridParserFactory } from "./GridParser";
import { FullCubePTM } from "../../sudokuTypes/cube/types/FullCubePTM";
import { EggSokobanSudokuTypeManager } from "../../sudokuTypes/sokoban/egg/types/EggSokobanSudokuTypeManager";
import { RuleBoxSudokuTypeManager } from "../../sudokuTypes/rule-box/types/RuleBoxSudokuTypeManager";
import { CaterpillarSudokuTypeManager } from "../../sudokuTypes/caterpillar/types/CaterpillarSudokuTypeManager";
import { FPuzzlesGridParserFactory } from "./FPuzzles";
import { SudokuMakerGridParserFactory } from "./SudokuMaker";

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
): SudokuTypeManager<AnyPTM> => {
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

    const regularTypeManager = DigitSudokuTypeManager();
    const typesMap: Record<PuzzleImportPuzzleType, SudokuTypeManager<AnyPTM>> = {
        [PuzzleImportPuzzleType.Regular]: regularTypeManager,
        [PuzzleImportPuzzleType.Latin]: regularTypeManager,
        [PuzzleImportPuzzleType.Calculator]: regularTypeManager,
        [PuzzleImportPuzzleType.Cubedoku]: CubedokuTypeManager,
        [PuzzleImportPuzzleType.RotatableCube]: FullCubeTypeManager(),
        [PuzzleImportPuzzleType.Rotatable]: RotatableDigitSudokuTypeManager(importOptions),
        [PuzzleImportPuzzleType.SafeCracker]: SafeCrackerSudokuTypeManager({
            size: digitsCount,
            circleRegionsCount: Math.ceil((mainGridParser.size - 2) / 2),
            codeCellsCount: Math.min(mainGridParser.size, safeCrackerCodeLength),
        }),
        [PuzzleImportPuzzleType.InfiniteRings]: InfiniteSudokuTypeManager(
            regularTypeManager,
            visibleRingsCount,
            startOffset,
        ),
        [PuzzleImportPuzzleType.Jigsaw]: JigsawSudokuTypeManager(importOptions),
        [PuzzleImportPuzzleType.Tetris]: TetrisSudokuTypeManager(importOptions),
        [PuzzleImportPuzzleType.Shuffled]: ShuffledSudokuTypeManager(importOptions),
        [PuzzleImportPuzzleType.RushHour]: RushHourSudokuTypeManager,
    };

    let typeManager = typesMap[type] ?? regularTypeManager;
    if (sokoban) {
        typeManager = eggs ? EggSokobanSudokuTypeManager : SokobanSudokuTypeManager();
    }
    if (tesseract) {
        typeManager = TesseractSudokuTypeManager(typeManager);
    }
    if (yajilinFog) {
        typeManager = YajilinFogSudokuTypeManager(typeManager);
    }
    if (fogStars) {
        typeManager = FogStarsSudokuTypeManager(typeManager);
    }
    if (jss && type !== PuzzleImportPuzzleType.RotatableCube) {
        const hasZeroRegion = allGridParsers.some(({ hasZeroRegion }) => hasZeroRegion);
        typeManager = JssSudokuTypeManager(typeManager, hasZeroRegion);
    }
    if (rotatableClues) {
        typeManager = ImportedRotatableCluesSudokuTypeManager({
            baseTypeManager: typeManager,
            compensateConstraintDigitAngle: !stickyConstraintDigitAngle,
            angleStep: freeRotation ? angleStep || 90 : 90,
        });
    }
    if (screws) {
        typeManager = ImportedScrewsSudokuTypeManager(typeManager);
    }
    if (fillableQuads) {
        const givenQuads = allGridParsers.flatMap(({ quadruplePositions = [] }) => quadruplePositions);

        typeManager = QuadInputSudokuTypeManager({
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
        typeManager = Find3SudokuTypeManager(typeManager, giftsInSight);
    }
    if (caterpillar) {
        typeManager = CaterpillarSudokuTypeManager(typeManager);
    }

    typeManager = RuleBoxSudokuTypeManager(typeManager);

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
            typeManager = LatinDigitSudokuTypeManager(typeManager);
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

    const importer = new PuzzleImporter<T>(slug, importOptions, typeManager as unknown as SudokuTypeManager<T>, {
        fieldSize: Math.max(rowsCount, columnsCount),
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
