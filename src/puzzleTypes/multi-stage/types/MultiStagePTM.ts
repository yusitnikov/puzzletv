import { AnyPTM, PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { MultiStageGameState } from "./MultiStageGameState";
import { AddGameStateEx } from "../../../types/puzzle/PuzzleTypeManagerPlugin";

export type MultiStagePTM<
    CellType = number,
    GameStateExType extends MultiStageGameState = MultiStageGameState,
    GridStateEx = {},
    PuzzleExType = {},
> = PTM<CellType, GameStateExType, GridStateEx, PuzzleExType>;

export type AnyMultiStagePTM<
    CellType = any,
    GameStateExType extends MultiStageGameState = any,
    GridStateEx = any,
    PuzzleExType = any,
> = AnyPTM<CellType, GameStateExType, GridStateEx, PuzzleExType>;

export type ToMultiStagePTM<T extends AnyPTM> = AddGameStateEx<T, MultiStageGameState>;
