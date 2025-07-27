import { PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AdventureGridState } from "./AdventureGridState";
import { AdventureGameState } from "./AdventureGameState";

export type AdventurePTM<
    CellType = number,
    GameStateExType extends AdventureGridState = any,
    GridStateEx extends AdventureGridState = any,
    PuzzleExType = any,
> = PTM<CellType, GameStateExType, GridStateEx, PuzzleExType>;
