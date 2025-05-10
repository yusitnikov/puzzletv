import { AnyPTM, PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { Find3GridState } from "./Find3GridState";
import { AddGridStateEx } from "../../../types/puzzle/PuzzleTypeManagerPlugin";

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

export type ToFind3PTM<T extends AnyPTM> = AddGridStateEx<T, Find3GridState>;
