import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzleRu} from "./RealChessPuzzle";

export default [
    NorthOrSouth,
    RealChessPuzzle,
    RealChessPuzzleRu,
] as PuzzleDefinition<any, any, any>[];
