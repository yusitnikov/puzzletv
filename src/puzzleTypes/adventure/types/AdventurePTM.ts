import { PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AdventureGridState } from "./AdventureGridState";
import { AdventureGameState } from "./AdventureGameState";
import { AdventurePuzzleExtension } from "./AdventurePuzzleExtension";

export type AdventurePTM = PTM<number, AdventureGameState, AdventureGridState, AdventurePuzzleExtension>;
