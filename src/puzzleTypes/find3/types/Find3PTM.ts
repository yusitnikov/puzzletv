import { AnyPTM, PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { Find3GridState } from "./Find3GridState";

export type Find3PTM<
    CellType = number,
    GameStateExType = {},
    GridStateEx extends Find3GridState = Find3GridState,
    PuzzleExType = {},
> = PTM<CellType, GameStateExType, GridStateEx, PuzzleExType>;

export type AnyFind3PTM<
    CellType = any,
    GameStateExType = any,
    GridStateEx extends Find3GridState = any,
    PuzzleExType = any,
> = AnyPTM<CellType, GameStateExType, GridStateEx, PuzzleExType>;

export type ToFind3PTM<T extends AnyPTM> = Omit<T, "gridStateEx"> & {
    gridStateEx: T["gridStateEx"] & Find3GridState;
};
