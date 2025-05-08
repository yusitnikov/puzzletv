import { AnyPTM, PTM } from "../../../types/sudoku/PuzzleTypeMap";
import { RotatableCluesGameState, RotatableCluesProcessedGameState } from "./RotatableCluesGameState";
import { RotatableCluesGridState } from "./RotatableCluesGridState";
import { RotatableCluesPuzzleExtension } from "./RotatableCluesPuzzleExtension";

export type RotatableCluesPTM<T extends AnyPTM> = PTM<
    T["cell"],
    T["stateEx"] & RotatableCluesGameState,
    T["processedStateEx"] & RotatableCluesProcessedGameState,
    T["gridStateEx"] & RotatableCluesGridState,
    T["puzzleEx"] & RotatableCluesPuzzleExtension
>;
