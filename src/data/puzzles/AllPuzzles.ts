import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzleCompatibilitySlug} from "./RealChessPuzzle";
import {RealChessPuzzleRubberBlando} from "./RealChessPuzzleRubberBlando";
import {EmptyChaosConstruction, EmptyChess, EmptyCubedoku, EmptyRegular, EmptyRotatable, EmptyToroidal} from "./Empty";
import {CubeIt, IntroToCubedoku} from "./Cubedoku";
import {Miraculous} from "./Miraculous";
import {MeteorShower} from "./MeteorShower";
import {MultiColorMadness} from "./MultiColorMadness";
import {Africa} from "./Africa";

export default [
    EmptyRegular,
    EmptyChaosConstruction,
    EmptyRotatable,
    EmptyChess,
    EmptyCubedoku,
    EmptyToroidal,

    NorthOrSouth,

    RealChessPuzzle,
    RealChessPuzzleCompatibilitySlug,
    RealChessPuzzleRubberBlando,

    IntroToCubedoku,
    CubeIt,

    Miraculous,
    MultiColorMadness,
    MeteorShower(true),
    MeteorShower(false),

    Africa,
] as PuzzleDefinition<any, any, any>[];
