import { AnyPTM, PTM } from "../../../types/sudoku/PuzzleTypeMap";
import { Find3FieldState } from "./Find3FieldState";

export type Find3PTM<
    CellType = number,
    GameStateExType = {},
    ProcessedGameStateExType = {},
    FieldStateEx extends Find3FieldState = Find3FieldState,
    PuzzleExType = {},
> = PTM<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;

export type AnyFind3PTM<
    CellType = any,
    GameStateExType = any,
    ProcessedGameStateExType = any,
    FieldStateEx extends Find3FieldState = any,
    PuzzleExType = any,
> = AnyPTM<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;

export type ToFind3PTM<T extends AnyPTM> = Omit<T, "fieldStateEx"> & {
    fieldStateEx: T["fieldStateEx"] & Find3FieldState;
};
