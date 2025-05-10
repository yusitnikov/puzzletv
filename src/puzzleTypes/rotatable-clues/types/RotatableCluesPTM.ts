import { AnyPTM, PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { RotatableCluesGameState } from "./RotatableCluesGameState";
import { RotatableCluesGridState } from "./RotatableCluesGridState";
import { RotatableCluesPuzzleExtension } from "./RotatableCluesPuzzleExtension";

export type RotatableCluesPTM<T extends AnyPTM> = PTM<
    T["cell"],
    T["stateEx"] & RotatableCluesGameState,
    T["processedStateEx"],
    T["gridStateEx"] & RotatableCluesGridState,
    T["puzzleEx"] & RotatableCluesPuzzleExtension
>;
