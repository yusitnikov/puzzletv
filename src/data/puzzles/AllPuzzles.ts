import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzleCompatibilitySlug} from "./RealChessPuzzle";
import {RealChessPuzzleRubberBlando} from "./RealChessPuzzleRubberBlando";
import {EmptyChaosConstruction, EmptyChess, EmptyCubedoku, EmptyRegular, EmptyRotatable} from "./Empty";
import {CubeIt, IntroToCubedoku} from "./Cubedoku";
import {Miraculous} from "./Miraculous";

export default [
    EmptyRegular,
    EmptyChaosConstruction,
    EmptyRotatable,
    EmptyChess,
    EmptyCubedoku,

    NorthOrSouth,

    RealChessPuzzle,
    RealChessPuzzleCompatibilitySlug,
    RealChessPuzzleRubberBlando,

    IntroToCubedoku,
    CubeIt,

    Miraculous,
] as PuzzleDefinition<any, any, any>[];
