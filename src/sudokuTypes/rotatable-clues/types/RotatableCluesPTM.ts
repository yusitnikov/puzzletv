import {AnyPTM, PTM} from "../../../types/sudoku/PuzzleTypeMap";
import {RotatableCluesGameState, RotatableCluesProcessedGameState} from "./RotatableCluesGameState";
import {RotatableCluesFieldState} from "./RotatableCluesFieldState";
import {RotatableCluesPuzzleExtension} from "./RotatableCluesPuzzleExtension";

export type RotatableCluesPTM<T extends AnyPTM> = PTM<
    T["cell"],
    T["stateEx"] & RotatableCluesGameState,
    T["processedStateEx"] & RotatableCluesProcessedGameState,
    T["fieldStateEx"] & RotatableCluesFieldState,
    T["puzzleEx"] & RotatableCluesPuzzleExtension
>;
