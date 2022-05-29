import {PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
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

export const AllPuzzles: (PuzzleDefinition<any, any, any> | PuzzleDefinitionLoader<any, any, any>)[] = [
    // region Empty & random
    EmptyRegular,
    EmptyChaosConstruction,
    EmptyRotatable,
    EmptyChess,
    EmptyCubedoku,
    EmptyToroidal,

    generateRandomPuzzle("random", 9, 3),
    generateRandomPuzzle("daily-random", 9, 3, getDailyRandomGeneratorSeed()),
    {
        slug: "quad-masters",
        fulfillParams: ({size = 9, regionWidth = 3, seed = Math.round(Math.random() * 1000000), ...other}) => ({size, regionWidth, seed, ...other}),
        loadPuzzle: ({size, regionWidth, seed}) => generateQuadMasters("quad-masters", size, regionWidth, seed)
    },
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
];

export const AllPuzzlesWithDefaultParams = AllPuzzles.map((puzzleOrLoader) => {
    const loader = puzzleOrLoader as PuzzleDefinitionLoader<any, any, any>;

    return typeof loader.loadPuzzle === "function"
        ? loader.loadPuzzle(loader.fulfillParams({}))
        : puzzleOrLoader as PuzzleDefinition<any, any, any>;
});
