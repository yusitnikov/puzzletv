import { NumberPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { RushHourGameState, RushHourProcessedGameState } from "./RushHourGameState";
import { RushHourGridState } from "./RushHourGridState";
import { RushHourPuzzleExtension } from "./RushHourPuzzleExtension";

export type RushHourPTM = NumberPTM<
    RushHourGameState,
    RushHourProcessedGameState,
    RushHourGridState,
    RushHourPuzzleExtension
>;
