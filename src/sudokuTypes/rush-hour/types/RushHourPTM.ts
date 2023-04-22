import {NumberPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {RushHourGameState, RushHourProcessedGameState} from "./RushHourGameState";
import {RushHourFieldState} from "./RushHourFieldState";
import {RushHourPuzzleExtension} from "./RushHourPuzzleExtension";

export type RushHourPTM = NumberPTM<RushHourGameState, RushHourProcessedGameState, RushHourFieldState, RushHourPuzzleExtension>;
