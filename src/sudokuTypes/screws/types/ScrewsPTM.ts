import {AnyPTM, PTM} from "../../../types/sudoku/PuzzleTypeMap";
import {ScrewsGameState, ScrewsProcessedGameState} from "./ScrewsGameState";
import {ScrewsFieldState} from "./ScrewsFieldState";
import {ScrewsPuzzleExtension} from "./ScrewsPuzzleExtension";

export type ScrewsPTM<T extends AnyPTM> = PTM<
    T["cell"],
    T["stateEx"] & ScrewsGameState,
    T["processedStateEx"] & ScrewsProcessedGameState,
    T["fieldStateEx"] & ScrewsFieldState,
    T["puzzleEx"] & ScrewsPuzzleExtension<T["cell"]>
>;

export type AnyScrewsPTM<
    CellType = any,
    GameStateExType extends ScrewsGameState = any,
    ProcessedGameStateExType extends ScrewsProcessedGameState = any,
    FieldStateEx extends ScrewsFieldState = any,
    PuzzleExType extends ScrewsPuzzleExtension<CellType> = any
> = AnyPTM<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;
