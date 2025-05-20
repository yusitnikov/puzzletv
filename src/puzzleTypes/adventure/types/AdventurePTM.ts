import { PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AdventureGridState } from "./AdventureGridState";
import { AdventureGameState } from "./AdventureGameState";

export type AdventurePTM<
    CellType = number,
    GameStateExType extends AdventureGridState = AdventureGridState
> = PTM<CellType, AdventureGameState, GameStateExType>;
