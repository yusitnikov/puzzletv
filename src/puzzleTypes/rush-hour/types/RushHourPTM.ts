import { NumberPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { RushHourGameState } from "./RushHourGameState";
import { RushHourGridState } from "./RushHourGridState";
import { RushHourPuzzleExtension } from "./RushHourPuzzleExtension";

export type RushHourPTM = NumberPTM<RushHourGameState, RushHourGridState, RushHourPuzzleExtension>;
