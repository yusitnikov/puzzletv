import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzleCompatibilitySlug} from "./RealChessPuzzle";

export default [
    NorthOrSouth,
    RealChessPuzzle,
    RealChessPuzzleCompatibilitySlug,
] as PuzzleDefinition<any, any, any>[];
