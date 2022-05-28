import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {generateRandomPuzzleDigits} from "../../utils/random";
import {normalSudokuRulesApply} from "../ruleSnippets";

export const generateRandomPuzzle = (slug: string, fieldSize: number, regionWidth: number, randomSeed?: number): PuzzleDefinition<number> => ({
    noIndex: true,
    title: {
        [LanguageCode.en]: `Random Sudoku ${fieldSize}x${fieldSize}`,
        [LanguageCode.ru]: `Случайный судоку ${fieldSize}x${fieldSize}`,
    },
    slug,
    saveState: randomSeed !== undefined,
    saveStateKey: `${slug}-${randomSeed}`,
    typeManager: DigitSudokuTypeManager(),
    fieldSize: createRegularFieldSize(fieldSize, regionWidth),
    initialDigits: generateRandomPuzzleDigits(fieldSize, regionWidth, randomSeed),
    rules: translate => `${translate(normalSudokuRulesApply)}.`,
});
