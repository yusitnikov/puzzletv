import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzleCompatibilitySlug} from "./RealChessPuzzle";
import {RealChessPuzzleRubberBlando} from "./RealChessPuzzleRubberBlando";
import {EmptyChess, EmptyCubedoku, EmptyRegular, EmptyRotatable} from "./Empty";
import {CubeIt, IntroToCubedoku} from "./Cubedoku";

export default [
    EmptyRegular,
    EmptyRotatable,
    EmptyChess,
    EmptyCubedoku,

    NorthOrSouth,

    RealChessPuzzle,
    RealChessPuzzleCompatibilitySlug,
    RealChessPuzzleRubberBlando,

    IntroToCubedoku,
    CubeIt,
] as PuzzleDefinition<any, any, any>[];
