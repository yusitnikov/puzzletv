import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {generateRandomPuzzleDigits, RandomGenerator} from "../../utils/random";
import {QuadMastersSudokuTypeManager} from "../../sudokuTypes/quad-masters/types/QuadMastersSudokuTypeManager";
import {QuadMastersGameState} from "../../sudokuTypes/quad-masters/types/QuadMastersGameState";

export const generateQuadMasters = (
    slug: string,
    fieldSize: number,
    regionWidth: number,
    randomOrSeed?: RandomGenerator | number
): PuzzleDefinition<number, QuadMastersGameState, QuadMastersGameState> => ({
    noIndex: true,
    title: {
        [LanguageCode.en]: `Quad Masters`,
    },
    slug,
    typeManager: QuadMastersSudokuTypeManager(generateRandomPuzzleDigits(fieldSize, regionWidth, randomOrSeed)),
    fieldSize: createRegularFieldSize(fieldSize, regionWidth),
});
