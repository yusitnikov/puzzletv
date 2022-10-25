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
    {
        ...FPuzzles.loadPuzzle({load: "N4IgzglgXgpiBcBOANCALhNAbO8QBUALGAAgEEA7Acxi2RIEkwsJq0B7CkVAQwFc0hdgCcEIAAo8sWHhQAm7biGF8cYGGjEBlNLLk9hckmD4KA1nxIq1JHgAc7WAJ4A6ADoUPZOQCseAYxgKNBI5CCpMMBJOEip2LDkgkn8sdn8zEhYKGCiwgDM8mGESACMnEgAmaOKAdndPCgBRAEc+CAA3KSCQsLBdYNDwyOiKKxgjWQwAWjspVjlhdgBbUiyc4z4lkg4SAEYABnqPFrbOnAHe/p6htCiY9oh4jRIAdxgeDNmsheXV1nWljw0P5CCRWCQAPJyIwACl2AGYAKw1RAAShI7SijXaSRhFQALAA2AAc6L0YNGAAlwqCYYjCTViWiMVEADLsF4kOEVeH41FHCgwgAi7FuJEBwgyglISwgchm7FYYvYeW2xBIX3mixWmX+YBcqKUVGEcoQAG0zcAAL7Ia22m12x0O532gC6yEtLqd9p93ut7s9vq9waDAb9IfDbo9kZjwbDEYToejidjUcDqdj8aD2cz7pA/ggwhSuEt+doWDA5pAACVCQBhRFKWt1/EgPMlHjqOtiADEADE+8TdoylOwBGtu3ge/sZ7OlHlOGhJyBp7OZ0oXnLBAhDhVEahiDTNPBd4iHWXpJX4Gaa4iG03643252YMue4h8ciB6Px/832v11QBdgn/ACNy3QgdxcPcDxgI8oL3K08zWc1QDWK8LVvOtdibO8KibfE63w1Bq3hOt4SbCoW0o+8SKowkmzIxsSMIhiSLvGpcLrNia0fB9qPYgSsIokj6xEmsaiE6tiSkmTmJrGSeOrSSlPrTjRLrYkuMQNs8zHbA/17AdESJfZwLkbcT2gs9bRAdDzRvas7xwjSXIkoimxk8TlKkyT5Obfy71bFjyMYqTCP81iwvUmsqK0ui6x0kiyKSmtCPirCdNdPTf2yN8ByFRFAJATcLMgqzENs+zr0cwjvLI4iazI+qpKYgjaLSqSgq4/y+I0pS7yUqKQpipy61GtSm0k0bFN01B9InXsyAqGTv1QUrLN3JDUDAeIBEeLhr12ZB4WQfdCWQCpkGJZAamQfFkBQFAbquu6HvOk7kGOt7kAu06UGO/crpul6vvus7bse37Pou/dns+q7vvBh67v+sGLpuoGYch46boeq6UCx+GPtOh6kf3Y78chlBTpuwk8wXOI8heAwqzGp8rSAA"}),
        noIndex: false,
        slug: "the-angel-islington",
    },

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
