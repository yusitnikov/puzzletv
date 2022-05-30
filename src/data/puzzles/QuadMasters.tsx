import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {generateRandomPuzzleDigits, getDailyRandomGeneratorSeed} from "../../utils/random";
import {QuadMastersSudokuTypeManager} from "../../sudokuTypes/quad-masters/types/QuadMastersSudokuTypeManager";
import {QuadMastersGameState} from "../../sudokuTypes/quad-masters/types/QuadMastersGameState";
import {isValidFinishedPuzzleByConstraints} from "../../types/sudoku/Constraint";
import {getAutoRegionWidth} from "../../utils/regions";

export const generateQuadMasters = (slug: string, daily: boolean): PuzzleDefinitionLoader<number, QuadMastersGameState, QuadMastersGameState> => ({
    slug,
    fulfillParams: (
        {
            size = 9,
            regionWidth = getAutoRegionWidth(size),
            seed = Math.round(Math.random() * 1000000),
            ...other
        }
    ) => ({
        size,
        regionWidth,
        seed: daily ? "daily" : seed,
        ...other
    }),
    loadPuzzle: ({size: sizeStr, regionWidth: regionWidthStr, seed: seedStr}) => {
        const fieldSize = Number(sizeStr);
        const regionWidth = Number(regionWidthStr);
        const randomSeed = daily ? getDailyRandomGeneratorSeed() : Number(seedStr);

        return {
            noIndex: true,
            title: {
                [LanguageCode.en]: `Quad Masters`,
            },
            slug,
            saveState: randomSeed !== undefined,
            saveStateKey: `${slug}-${fieldSize}-${regionWidth}-${randomSeed}`,
            typeManager: QuadMastersSudokuTypeManager(generateRandomPuzzleDigits(fieldSize, regionWidth, randomSeed)),
            fieldSize: createRegularFieldSize(fieldSize, regionWidth),
            resultChecker: isValidFinishedPuzzleByConstraints,
            forceAutoCheckOnFinish: true,
        };
    },
});
