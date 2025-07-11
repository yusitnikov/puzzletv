import { allDrawingModes, PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { RotatableDigitTypeManager } from "../../puzzleTypes/rotatable/types/RotatableDigitTypeManager";
import { GridSize8, GridSize9, Regions8, Regions9 } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { PartiallyTranslatable } from "../../types/translations/Translatable";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { ChessTypeManager } from "../../puzzleTypes/chess/types/ChessTypeManager";
import { ChessGameTypeManager } from "../../puzzleTypes/chess/types/ChessGameTypeManager";
import { createCubeGridSize, createCubeRegions, CubeTypeManager } from "../../puzzleTypes/cube/types/CubeTypeManager";
import { CubedokuTypeManager } from "../../puzzleTypes/cubedoku/types/CubedokuTypeManager";
import { AutoRegionConstraint } from "../../components/puzzle/constraints/auto-region/AutoRegion";
import { isValidFinishedPuzzleByConstraints } from "../../types/puzzle/Constraint";
import { LatinDigitTypeManager } from "../../puzzleTypes/latin/types/LatinDigitTypeManager";
import {
    createMonumentValleyGridSize,
    createMonumentValleyRegions,
    MonumentValleyTypeManager,
} from "../../puzzleTypes/monument-valley/types/MonumentValleyTypeManager";
import { MonumentValleyGridBordersConstraint } from "../../puzzleTypes/monument-valley/components/MonumentValleyGridBorders";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { RotatableDigitPTM } from "../../puzzleTypes/rotatable/types/RotatablePTM";
import { ChessPTM } from "../../puzzleTypes/chess/types/ChessPTM";
import { MonumentValleyPTM } from "../../puzzleTypes/monument-valley/types/MonumentValleyPTM";
import { ValidChessPositionConstraint } from "../../puzzleTypes/chess/constraints/ValidChessPosition";
import { ChessBoardCellsBackgroundConstraint } from "../../puzzleTypes/chess/components/ChessBoardCellsBackground";
import {
    ChessBoardIndexesConstraint,
    chessBoardIndexesMargin,
} from "../../puzzleTypes/chess/components/ChessBoardIndexes";

const title: PartiallyTranslatable = {
    [LanguageCode.en]: "Empty",
    [LanguageCode.ru]: "Пустой",
};

export const EmptyRegular: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-regular",
    typeManager: DigitPuzzleTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
    allowDrawing: allDrawingModes,
};

export const EmptyChaosConstruction: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-chaos-construction",
    saveStateKey: "empty-chaos-construction-v2",
    typeManager: DigitPuzzleTypeManager(),
    gridSize: GridSize9,
    items: [AutoRegionConstraint()],
    allowDrawing: allDrawingModes,
    disableDiagonalBorderLines: true,
    resultChecker: isValidFinishedPuzzleByConstraints,
};

export const EmptyChaosConstructionLoop: PuzzleDefinition<NumberPTM> = {
    ...EmptyChaosConstruction,
    slug: "empty-chaos-construction-loop",
    saveStateKey: undefined,
    loopHorizontally: true,
    loopVertically: true,
    gridMargin: 0.99,
};

export const EmptyRotatable: PuzzleDefinition<RotatableDigitPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-rotatable",
    typeManager: RotatableDigitTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
    allowDrawing: allDrawingModes,
};

export const EmptyChess: PuzzleDefinition<ChessPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-chess",
    typeManager: ChessTypeManager,
    gridSize: GridSize8,
    regions: Regions8,
    gridMargin: chessBoardIndexesMargin,
    items: [ChessBoardCellsBackgroundConstraint(), ChessBoardIndexesConstraint(), ValidChessPositionConstraint],
    allowDrawing: allDrawingModes,
};

export const EmptyChessGame: PuzzleDefinition<ChessPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "chess",
    typeManager: ChessGameTypeManager,
    gridSize: GridSize8,
    regions: Regions8,
    gridMargin: chessBoardIndexesMargin,
    items: [ChessBoardCellsBackgroundConstraint(), ChessBoardIndexesConstraint()],
    allowDrawing: allDrawingModes,
};

export const EmptyCube: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-cube",
    typeManager: CubeTypeManager(true),
    gridSize: createCubeGridSize(6),
    regions: createCubeRegions(6, 3),
    maxDigit: 6,
    allowDrawing: allDrawingModes,
};

export const EmptyCubedoku: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-cubedoku",
    typeManager: CubedokuTypeManager,
    gridSize: createCubeGridSize(6),
    regions: createCubeRegions(6, 3),
    maxDigit: 6,
    allowDrawing: allDrawingModes,
};

export const EmptyMonumentValley: PuzzleDefinition<MonumentValleyPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-monument-valley",
    saveStateKey: "empty-monument-valley-v2",
    typeManager: MonumentValleyTypeManager,
    gridSize: createMonumentValleyGridSize(9, 3),
    regions: createMonumentValleyRegions(9, 3),
    items: [MonumentValleyGridBordersConstraint()],
    maxDigit: 9,
    allowDrawing: allDrawingModes,
};

export const EmptyMonumentValleyMini: PuzzleDefinition<MonumentValleyPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-monument-valley-mini",
    saveStateKey: "empty-monument-valley-mini-v2",
    typeManager: MonumentValleyTypeManager,
    gridSize: createMonumentValleyGridSize(5, 1, 2),
    items: [MonumentValleyGridBordersConstraint()],
    maxDigit: 5,
    allowDrawing: allDrawingModes,
};

export const EmptyToroidal: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-toroidal",
    typeManager: DigitPuzzleTypeManager(),
    gridSize: GridSize9,
    regions: Regions9,
    loopHorizontally: true,
    loopVertically: true,
    gridMargin: 0.99,
    allowDrawing: allDrawingModes,
};

export const EmptyLatin: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    extension: {},
    title,
    slug: "empty-latin",
    typeManager: LatinDigitTypeManager(DigitPuzzleTypeManager()),
    gridSize: GridSize9,
    regions: Regions9,
    allowDrawing: allDrawingModes,
};
