import {allDrawingModes, PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {RotatableDigitSudokuTypeManager} from "../../sudokuTypes/rotatable/types/RotatableDigitSudokuTypeManager";
import {FieldSize8, FieldSize9} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {PartiallyTranslatable} from "../../types/translations/Translatable";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {ChessSudokuTypeManager} from "../../sudokuTypes/chess/types/ChessSudokuTypeManager";
import {createCubeFieldSize, CubeTypeManager} from "../../sudokuTypes/cube/types/CubeTypeManager";
import {CubedokuTypeManager} from "../../sudokuTypes/cubedoku/types/CubedokuTypeManager";
import {AutoRegionConstraint} from "../../components/sudoku/constraints/auto-region/AutoRegion";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {LatinDigitSudokuTypeManager} from "../../sudokuTypes/latin/types/LatinDigitSudokuTypeManager";
import {
    createMonumentValleyFieldSize,
    MonumentValleyTypeManager
} from "../../sudokuTypes/monument-valley/types/MonumentValleyTypeManager";
import {
    MonumentValleyGridBordersConstraint
} from "../../sudokuTypes/monument-valley/components/MonumentValleyGridBorders";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";
import {RotatableDigitPTM} from "../../sudokuTypes/rotatable/types/RotatablePTM";
import {ChessPTM} from "../../sudokuTypes/chess/types/ChessPTM";
import {MonumentValleyPTM} from "../../sudokuTypes/monument-valley/types/MonumentValleyPTM";

const title: PartiallyTranslatable = {
    [LanguageCode.en]: "Empty",
    [LanguageCode.ru]: "Пустой",
};

export const EmptyRegular: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title,
    slug: "empty-regular",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize9,
    allowDrawing: allDrawingModes,
};

export const EmptyChaosConstruction: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title,
    slug: "empty-chaos-construction",
    saveStateKey: "empty-chaos-construction-v2",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: {...FieldSize9, regions: []},
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
    fieldMargin: 0.99,
};

export const EmptyRotatable: PuzzleDefinition<RotatableDigitPTM> = {
    noIndex: true,
    title,
    slug: "empty-rotatable",
    typeManager: RotatableDigitSudokuTypeManager,
    fieldSize: FieldSize9,
    allowDrawing: allDrawingModes,
};

export const EmptyChess: PuzzleDefinition<ChessPTM> = {
    noIndex: true,
    title,
    slug: "empty-chess",
    typeManager: ChessSudokuTypeManager,
    fieldSize: FieldSize8,
    allowDrawing: allDrawingModes,
};

export const EmptyCube: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title,
    slug: "empty-cube",
    typeManager: CubeTypeManager(true),
    fieldSize: createCubeFieldSize(6, 3),
    digitsCount: 6,
    allowDrawing: allDrawingModes,
};

export const EmptyCubedoku: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title,
    slug: "empty-cubedoku",
    typeManager: CubedokuTypeManager,
    fieldSize: createCubeFieldSize(6, 3),
    digitsCount: 6,
    allowDrawing: allDrawingModes,
};

export const EmptyMonumentValley: PuzzleDefinition<MonumentValleyPTM> = {
    noIndex: true,
    title,
    slug: "empty-monument-valley",
    saveStateKey: "empty-monument-valley-v2",
    typeManager: MonumentValleyTypeManager,
    fieldSize: createMonumentValleyFieldSize(9, 3),
    items: [
        MonumentValleyGridBordersConstraint(),
    ],
    digitsCount: 9,
    allowDrawing: allDrawingModes,
};

export const EmptyMonumentValleyMini: PuzzleDefinition<MonumentValleyPTM> = {
    noIndex: true,
    title,
    slug: "empty-monument-valley-mini",
    saveStateKey: "empty-monument-valley-mini-v2",
    typeManager: MonumentValleyTypeManager,
    fieldSize: createMonumentValleyFieldSize(5, 1, 2),
    items: [
        MonumentValleyGridBordersConstraint(),
    ],
    digitsCount: 5,
    allowDrawing: allDrawingModes,
};

export const EmptyToroidal: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title,
    slug: "empty-toroidal",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize9,
    loopHorizontally: true,
    loopVertically: true,
    fieldMargin: 0.99,
    allowDrawing: allDrawingModes,
};

export const EmptyLatin: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    title,
    slug: "empty-latin",
    typeManager: LatinDigitSudokuTypeManager,
    fieldSize: FieldSize9,
    allowDrawing: allDrawingModes,
};
