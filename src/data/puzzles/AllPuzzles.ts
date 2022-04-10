import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzleCompatibilitySlug, RealChessPuzzleRu} from "./RealChessPuzzle";

export default [
    NorthOrSouth,
    RealChessPuzzle,
    RealChessPuzzleCompatibilitySlug,
    RealChessPuzzleRu,
] as PuzzleDefinition<any, any, any>[];
