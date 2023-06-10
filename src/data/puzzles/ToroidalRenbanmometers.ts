import {FPuzzles} from "./FPuzzles";
import {PuzzleImportOptions} from "../../types/sudoku/PuzzleImportOptions";
import {PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";

export const ToroidalRenbanmometers: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () => FPuzzles.loadPuzzle({
        loopX: true,
        loopY: true,
        load: "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",
    } as PuzzleImportOptions),
    noIndex: false,
    slug: "toroidal-renbanmometers",
};
