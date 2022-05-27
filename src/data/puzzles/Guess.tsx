import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {generateRandomPuzzleDigits, RandomGenerator} from "../../utils/random";
import {GuessSudokuTypeManager} from "../../sudokuTypes/guess/types/GuessSudokuTypeManager";

export const generateGuess = (slug: string, fieldSize: number, regionWidth: number, randomOrSeed?: RandomGenerator | number): PuzzleDefinition<number> => ({
    noIndex: true,
    title: {
        [LanguageCode.en]: `Quad Masters`,
    },
    slug,
    typeManager: GuessSudokuTypeManager(generateRandomPuzzleDigits(fieldSize, regionWidth, randomOrSeed)),
    fieldSize: createRegularFieldSize(fieldSize, regionWidth),
});
