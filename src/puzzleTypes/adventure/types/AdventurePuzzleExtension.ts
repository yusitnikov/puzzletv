import { choiceTaken } from "./AdventureGridState";
import { ReactNode } from "react";

export interface AdventurePuzzleExtension {
    rootChoiceTaken: choiceTaken;
    intro?: () => ReactNode;
}
