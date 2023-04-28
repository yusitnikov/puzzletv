import {AnyPTM, PTM} from "../../../types/sudoku/PuzzleTypeMap";
import {MultiStageGameState} from "./MultiStageGameState";

export type MultiStagePTM<
    CellType = number,
    GameStateExType extends MultiStageGameState = MultiStageGameState,
    ProcessedGameStateExType = {},
    FieldStateEx = {},
    PuzzleExType = {}
> = PTM<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;

export type AnyMultiStagePTM<
    CellType = any,
    GameStateExType extends MultiStageGameState = any,
    ProcessedGameStateExType = any,
    FieldStateEx = any,
    PuzzleExType = any
> = AnyPTM<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;
