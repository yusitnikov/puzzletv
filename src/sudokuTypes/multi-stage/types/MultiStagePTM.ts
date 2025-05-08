import { AnyPTM, PTM } from "../../../types/sudoku/PuzzleTypeMap";
import { MultiStageGameState } from "./MultiStageGameState";

export type MultiStagePTM<
    CellType = number,
    GameStateExType extends MultiStageGameState = MultiStageGameState,
    ProcessedGameStateExType = {},
    GridStateEx = {},
    PuzzleExType = {},
> = PTM<CellType, GameStateExType, ProcessedGameStateExType, GridStateEx, PuzzleExType>;

export type AnyMultiStagePTM<
    CellType = any,
    GameStateExType extends MultiStageGameState = any,
    ProcessedGameStateExType = any,
    GridStateEx = any,
    PuzzleExType = any,
> = AnyPTM<CellType, GameStateExType, ProcessedGameStateExType, GridStateEx, PuzzleExType>;

export type ToMultiStagePTM<T extends AnyPTM> = Omit<T, "stateEx"> & { stateEx: T["stateEx"] & MultiStageGameState };
