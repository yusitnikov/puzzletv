import { PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AdventureGameState } from "./AdventureGameState";

export type AdventurePTM<
    CellType = number,
    GameStateExType extends AdventureGameState = AdventureGameState
> = PTM<CellType, GameStateExType>;
