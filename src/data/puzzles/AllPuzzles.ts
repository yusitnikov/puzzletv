import {PuzzleDefinition, PuzzleDefinitionLoader} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth, NorthOrSouth2, NorthOrSouth2ShortRules} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzleCompatibilitySlug} from "./RealChessPuzzle";
import {RealChessPuzzleRubberBlando} from "./RealChessPuzzleRubberBlando";
import {
    EmptyChaosConstruction,
    EmptyChaosConstructionLoop,
    EmptyChess,
    EmptyCube,
    EmptyCubedoku,
    EmptyLatin,
    EmptyMonumentValley,
    EmptyMonumentValleyMini,
    EmptyRegular,
    EmptyRotatable,
    EmptyToroidal
} from "./Empty";
import {CubeIt, IntroToCubedoku} from "./Cubedoku";
import {Miraculous} from "./Miraculous";
import {MeteorShower} from "./MeteorShower";
import {MultiColorMadness} from "./MultiColorMadness";
import {Africa} from "./Africa";
import {generateQuadMasters} from "./QuadMasters";
import {HiddenSetup} from "./HiddenSetup";
import {SonataSemplice} from "./SonataSemplice";
import {RealChessPuzzleCJK} from "./RealChessPuzzleCJK";
import {HeptapagonLikeLoop, HeptapagonLikeLoopMini} from "./HeptapagonLikeLoop";
import {FPuzzles} from "./FPuzzles";
import {HeartsCube} from "./HeartsCube";
import {AbstractKillerDots, DollHouse, LegoHouse, MoodyLines} from "./TenInOne";
import {TheOnlyThingThatMatters} from "./TheOnlyThingThatMatters";
import {LumosMaxima, LumosMaximaEternalLives, LumosMaximaNoFog} from "./LumosMaxima";
import {MonumentValley, MonumentValleyMini} from "./MonumentValley";

export const AllPuzzles: (PuzzleDefinition<any, any, any> | PuzzleDefinitionLoader<any, any, any>)[] = [
    // region Empty
    EmptyRegular,
    EmptyChaosConstruction,
    EmptyChaosConstructionLoop,
    EmptyRotatable,
    EmptyChess,
    EmptyCubedoku,
    EmptyMonumentValley,
    EmptyMonumentValleyMini,
    EmptyCube,
    EmptyToroidal,
    EmptyLatin,
    // endregion

    FPuzzles,

    // region Games
    generateQuadMasters("quadle", false, true),
    generateQuadMasters("daily-quadle", true, true),
    generateQuadMasters("quad-masters", false, false),
    generateQuadMasters("daily-quad-masters", true, false),
    // endregion

    // region Other authors
    MonumentValley,
    MonumentValleyMini,

    AbstractKillerDots,
    MoodyLines,
    DollHouse,
    LegoHouse,

    HeptapagonLikeLoop,
    HeptapagonLikeLoopMini,
    SonataSemplice,
    HiddenSetup,

    MultiColorMadness,
    Miraculous,
    MeteorShower(true),
    MeteorShower(false),

    IntroToCubedoku,
    CubeIt,

    RealChessPuzzleCJK,
    RealChessPuzzleRubberBlando,
    // endregion

    // region My puzzles
    LumosMaximaNoFog,
    LumosMaximaEternalLives,
    LumosMaxima,

    TheOnlyThingThatMatters,

    HeartsCube(false),
    HeartsCube(true),

    NorthOrSouth,
    NorthOrSouth2,
    NorthOrSouth2ShortRules,

    RealChessPuzzle,
    RealChessPuzzleCompatibilitySlug,

    Africa,
    // endregion
];

export const getAllPuzzlesWithDefaultParams = () => AllPuzzles.filter(({noIndex}) => !noIndex).map((puzzleOrLoader) => {
    const loader = puzzleOrLoader as PuzzleDefinitionLoader<any, any, any>;

    return typeof loader.loadPuzzle === "function"
        ? loader.loadPuzzle(loader.fulfillParams({}))
        : puzzleOrLoader as PuzzleDefinition<any, any, any>;
});
