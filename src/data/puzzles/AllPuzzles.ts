import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth, NorthOrSouth2, NorthOrSouth2ShortRules} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzleCompatibilitySlug} from "./RealChessPuzzle";
import {RealChessPuzzleRubberBlando} from "./RealChessPuzzleRubberBlando";
import {EmptyChaosConstruction, EmptyChess, EmptyCubedoku, EmptyRegular, EmptyRotatable, EmptyToroidal} from "./Empty";
import {CubeIt, IntroToCubedoku} from "./Cubedoku";
import {Miraculous} from "./Miraculous";
import {MeteorShower} from "./MeteorShower";
import {MultiColorMadness} from "./MultiColorMadness";
import {Africa} from "./Africa";
import {generateRandomPuzzle} from "./Random";
import {getDailyRandomGeneratorSeed} from "../../utils/random";
import {generateQuadMasters} from "./QuadMasters";

export default [
    // region Empty & random
    EmptyRegular,
    EmptyChaosConstruction,
    EmptyRotatable,
    EmptyChess,
    EmptyCubedoku,
    EmptyToroidal,

    generateRandomPuzzle("random", 9, 3),
    generateRandomPuzzle("daily-random", 9, 3, getDailyRandomGeneratorSeed()),
    generateQuadMasters("quad-masters", 9, 3),
    generateQuadMasters("daily-quad-masters", 9, 3, getDailyRandomGeneratorSeed()),
    // endregion

    // region Other authors
    MultiColorMadness,
    Miraculous,
    MeteorShower(true),
    MeteorShower(false),

    IntroToCubedoku,
    CubeIt,

    RealChessPuzzleRubberBlando,
    // endregion

    // region My puzzles
    NorthOrSouth,
    NorthOrSouth2,
    NorthOrSouth2ShortRules,

    RealChessPuzzle,
    RealChessPuzzleCompatibilitySlug,

    Africa,
    // endregion
] as PuzzleDefinition<any, any, any>[];
