import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth} from "./NorthOrSouth";
import {RealChessPuzzle} from "./RealChessPuzzle";

export default [
    NorthOrSouth,
    RealChessPuzzle,
] as PuzzleDefinition<any, any, any>[];
