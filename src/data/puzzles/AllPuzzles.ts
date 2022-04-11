import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzleCompatibilitySlug} from "./RealChessPuzzle";
import {RealChessPuzzleRubberBlando} from "./RealChessPuzzleRubberBlando";

export default [
    NorthOrSouth,
    RealChessPuzzle,
    RealChessPuzzleCompatibilitySlug,
    RealChessPuzzleRubberBlando,
] as PuzzleDefinition<any, any, any>[];
