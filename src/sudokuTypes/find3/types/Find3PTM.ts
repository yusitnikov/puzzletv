import { AnyPTM, PTM } from "../../../types/sudoku/PuzzleTypeMap";
import { Find3GridState } from "./Find3GridState";

export type Find3PTM<
    CellType = number,
    GameStateExType = {},
    ProcessedGameStateExType = {},
    GridStateEx extends Find3GridState = Find3GridState,
    PuzzleExType = {},
> = PTM<CellType, GameStateExType, ProcessedGameStateExType, GridStateEx, PuzzleExType>;

export type AnyFind3PTM<
    CellType = any,
    GameStateExType = any,
    ProcessedGameStateExType = any,
    GridStateEx extends Find3GridState = any,
    PuzzleExType = any,
> = AnyPTM<CellType, GameStateExType, ProcessedGameStateExType, GridStateEx, PuzzleExType>;

export type ToFind3PTM<T extends AnyPTM> = Omit<T, "gridStateEx"> & {
    gridStateEx: T["gridStateEx"] & Find3GridState;
};
