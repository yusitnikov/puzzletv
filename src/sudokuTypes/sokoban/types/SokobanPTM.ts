import {NumberPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {SokobanGameState, SokobanProcessedGameState} from "./SokobanGameState";
import {SokobanFieldState} from "./SokobanFieldState";
import {SokobanPuzzleExtension} from "./SokobanPuzzleExtension";

export type SokobanPTM = NumberPTM<SokobanGameState, SokobanProcessedGameState, SokobanFieldState, SokobanPuzzleExtension>;
