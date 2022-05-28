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
    randomSeed?: number
): PuzzleDefinition<number, QuadMastersGameState, QuadMastersGameState> => ({
    noIndex: true,
    title: {
        [LanguageCode.en]: `Quad Masters`,
    },
    slug,
    saveState: randomSeed !== undefined,
    saveStateKey: `${slug}-${randomSeed}`,
    typeManager: QuadMastersSudokuTypeManager(generateRandomPuzzleDigits(fieldSize, regionWidth, randomSeed)),
    fieldSize: createRegularFieldSize(fieldSize, regionWidth),
});
