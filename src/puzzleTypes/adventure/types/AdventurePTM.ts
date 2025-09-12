import { PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AdventureGridState } from "./AdventureGridState";
import { AdventureGameState } from "./AdventureGameState";

export type AdventurePTM<
    CellType = number,
    GameStateExType = AdventureGameState,
    GridStateEx = AdventureGridState,
    PuzzleExType = any,
> = PTM<CellType, GameStateExType, GridStateEx, PuzzleExType>;
