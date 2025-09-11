import { PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AdventureGridState } from "./AdventureGridState";

export type AdventurePTM<
    CellType = number,
    GameStateExType = any,
    GridStateEx = AdventureGridState,
    PuzzleExType = any,
> = PTM<CellType, GameStateExType, GridStateEx, PuzzleExType>;
