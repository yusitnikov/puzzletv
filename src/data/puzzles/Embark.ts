import {FPuzzles} from "./Import";
import {PuzzleImportOptions} from "../../types/sudoku/PuzzleImportOptions";
import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";

export const embarkLoadString = "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=";

export const Embark: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => FPuzzles.loadPuzzle({
        yajilinFog: true,
        cosmeticsBehindFog: true,
        load: embarkLoadString,
    } as PuzzleImportOptions),
    noIndex: false,
    slug: "embark",
};

// CTC posted this slug in the video description, no idea why. So let's make it actually work.
export const EmbarkWeirdSlug = {
    ...Embark,
    noIndex: true,
    slug: "embarkation",
};
