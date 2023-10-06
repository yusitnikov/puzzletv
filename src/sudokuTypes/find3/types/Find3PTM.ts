import {AnyPTM, PTM} from "../../../types/sudoku/PuzzleTypeMap";
import {Find3GameState} from "./Find3GameState";

export type Find3PTM<
    CellType = number,
    GameStateExType extends Find3GameState = Find3GameState,
    ProcessedGameStateExType = {},
    FieldStateEx = {},
    PuzzleExType = {}
> = PTM<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;

export type AnyFind3PTM<
    CellType = any,
    GameStateExType extends Find3GameState = any,
    ProcessedGameStateExType = any,
    FieldStateEx = any,
    PuzzleExType = any
> = AnyPTM<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;

export type ToFind3PTM<T extends AnyPTM> = Omit<T, "stateEx"> & {stateEx: T["stateEx"] & Find3GameState};
