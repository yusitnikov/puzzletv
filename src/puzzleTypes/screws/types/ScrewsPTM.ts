import { AnyPTM, PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { ScrewsGameState } from "./ScrewsGameState";
import { ScrewsGridState } from "./ScrewsGridState";
import { ScrewsPuzzleExtension } from "./ScrewsPuzzleExtension";

export type ScrewsPTM<T extends AnyPTM> = PTM<
    T["cell"],
    T["stateEx"] & ScrewsGameState,
    T["processedStateEx"],
    T["gridStateEx"] & ScrewsGridState,
    T["puzzleEx"] & ScrewsPuzzleExtension<T["cell"]>
>;
