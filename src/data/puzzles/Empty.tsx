import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {RotatableDigit} from "../../sudokuTypes/rotatable/types/RotatableDigit";
import {RotatableDigitSudokuTypeManager} from "../../sudokuTypes/rotatable/types/RotatableDigitSudokuTypeManager";
import {RotatableGameState, RotatableProcessedGameState} from "../../sudokuTypes/rotatable/types/RotatableGameState";
import {FieldSize8, FieldSize9} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {PartiallyTranslatable} from "../../types/translations/Translatable";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {ChessSudokuTypeManager} from "../../sudokuTypes/chess/types/ChessSudokuTypeManager";
import {ChessPiece} from "../../sudokuTypes/chess/types/ChessPiece";
import {ChessGameState} from "../../sudokuTypes/chess/types/ChessGameState";
import {createCubeFieldSize, CubeTypeManager} from "../../sudokuTypes/cube/types/CubeTypeManager";
import {CubedokuTypeManager} from "../../sudokuTypes/cubedoku/types/CubedokuTypeManager";
import {AutoRegionConstraint} from "../../components/sudoku/constraints/auto-region/AutoRegion";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {LatinDigitSudokuTypeManager} from "../../sudokuTypes/latin/types/LatinDigitSudokuTypeManager";
import {
    createMonumentValleyFieldSize,
    MonumentValleyTypeManager
} from "../../sudokuTypes/monument-valley/types/MonumentValleyTypeManager";

const title: PartiallyTranslatable = {
    [LanguageCode.en]: "Empty",
    [LanguageCode.ru]: "Пустой",
};

export const EmptyRegular: PuzzleDefinition<number> = {
    noIndex: true,
    title,
    slug: "empty-regular",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize9,
};

export const EmptyChaosConstruction: PuzzleDefinition<number> = {
    noIndex: true,
    title,
    slug: "empty-chaos-construction",
    saveStateKey: "empty-chaos-construction-v2",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: {...FieldSize9, regions: []},
    items: [AutoRegionConstraint()],
    allowDrawing: ["center-line", "border-line", "border-mark", "center-mark", "corner-mark"],
    resultChecker: isValidFinishedPuzzleByConstraints,
};

export const EmptyChaosConstructionLoop: PuzzleDefinition<number> = {
    ...EmptyChaosConstruction,
    slug: "empty-chaos-construction-loop",
    saveStateKey: undefined,
    loopHorizontally: true,
    loopVertically: true,
    fieldMargin: 0.99,
};

export const EmptyRotatable: PuzzleDefinition<RotatableDigit, RotatableGameState, RotatableProcessedGameState> = {
    noIndex: true,
    title,
    slug: "empty-rotatable",
    typeManager: RotatableDigitSudokuTypeManager,
    fieldSize: FieldSize9,
};

export const EmptyChess: PuzzleDefinition<ChessPiece, ChessGameState, ChessGameState> = {
    noIndex: true,
    title,
    slug: "empty-chess",
    typeManager: ChessSudokuTypeManager,
    fieldSize: FieldSize8,
};

export const EmptyCube: PuzzleDefinition<number> = {
    noIndex: true,
    title,
    slug: "empty-cube",
    typeManager: CubeTypeManager(true),
    fieldSize: createCubeFieldSize(6, 3),
    digitsCount: 6,
};

export const EmptyCubedoku: PuzzleDefinition<number> = {
    noIndex: true,
    title,
    slug: "empty-cubedoku",
    typeManager: CubedokuTypeManager,
    fieldSize: createCubeFieldSize(6, 3),
    digitsCount: 6,
};

export const EmptyMonumentValley: PuzzleDefinition<number> = {
    noIndex: true,
    title,
    slug: "empty-monument-valley",
    typeManager: MonumentValleyTypeManager,
    fieldSize: createMonumentValleyFieldSize(9, 3),
    digitsCount: 9,
};

export const EmptyMonumentValleyMini: PuzzleDefinition<number> = {
    noIndex: true,
    title,
    slug: "empty-monument-valley-mini",
    typeManager: MonumentValleyTypeManager,
    fieldSize: createMonumentValleyFieldSize(5, 1, 2),
    hideRegionBorders: true,
    digitsCount: 5,
};

export const EmptyToroidal: PuzzleDefinition<number> = {
    noIndex: true,
    title,
    slug: "empty-toroidal",
    typeManager: DigitSudokuTypeManager(),
    fieldSize: FieldSize9,
    loopHorizontally: true,
    loopVertically: true,
    fieldMargin: 0.99,
};

export const EmptyLatin: PuzzleDefinition<number> = {
    noIndex: true,
    title,
    slug: "empty-latin",
    typeManager: LatinDigitSudokuTypeManager,
    fieldSize: FieldSize9,
};
