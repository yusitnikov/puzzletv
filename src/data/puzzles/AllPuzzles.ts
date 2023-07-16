import {loadPuzzle, PuzzleDefinitionOrLoader} from "../../types/sudoku/PuzzleDefinition";
import {NorthOrSouth, NorthOrSouth2, NorthOrSouth2ShortRules} from "./NorthOrSouth";
import {RealChessPuzzle, RealChessPuzzle2, RealChessPuzzleCompatibilitySlug} from "./RealChessPuzzle";
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
import {HeptapagonLikeLoop, HeptapagonLikeLoopMini} from "./HeptapagonLikeLoop";
import {FPuzzles} from "./FPuzzles";
import {HeartsCube} from "./HeartsCube";
import {AbstractKillerDots, DollHouse, LegoHouse, MoodyLines} from "./TenInOne";
import {TheOnlyThingThatMatters, TheOnlyThingThatMattersNoGivens} from "./TheOnlyThingThatMatters";
import {LumosMaxima, LumosMaximaNoFog} from "./LumosMaxima";
import {MonumentValley, MonumentValleyMini} from "./MonumentValley";
import {ToroidalYinYang} from "./ToroidalYinYang";
import {TheAngelIslington} from "./TheAngelIslington";
import {Embark, EmbarkWeirdSlug} from "./Embark";
import {ToroidalRenbanmometers} from "./ToroidalRenbanmometers";
import {PenroseTiles} from "./PenroseTiles";
import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";
import {RushHour} from "./RushHour";
import {InfinityLoopIntro1, InfinityLoopIntro2, MisterFantastic, WalkingOnTheEdge} from "./InfinityLoop";
import {ReservedParking} from "./ReservedParking";
import {JssChicken, MakeAPicture} from "./JigsawJss";
import {Sudokuban} from "./Sudokuban";
import {Pacman} from "./Pacman";
import {Astronavigation} from "./Astronavigation";
import {CherryBlossom, Revolutionary, SumwhereAroundHere} from "./RotatableClues";

export const AllPuzzles: PuzzleDefinitionOrLoader<AnyPTM>[] = [
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
    Astronavigation,
    CherryBlossom,
    SumwhereAroundHere,
    Revolutionary,

    RealChessPuzzle2,

    Pacman,

    Sudokuban,

    MakeAPicture,
    JssChicken,

    ReservedParking,

    PenroseTiles,

    Embark,
    EmbarkWeirdSlug,

    TheAngelIslington,

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
    // endregion

    // region My puzzles
    InfinityLoopIntro1,
    InfinityLoopIntro2,
    MisterFantastic,
    WalkingOnTheEdge,

    RushHour,

    ToroidalRenbanmometers,
    ToroidalYinYang,

    LumosMaximaNoFog,
    LumosMaxima,

    TheOnlyThingThatMatters,
    TheOnlyThingThatMattersNoGivens,

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

export const getAllPuzzlesForPreview = () => AllPuzzles.filter(({noIndex}) => !noIndex).map((puzzle) => loadPuzzle(puzzle, undefined, true));
