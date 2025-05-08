import { NumberPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { SokobanGameState } from "./SokobanGameState";
import { SokobanGridState } from "./SokobanGridState";
import { SokobanPuzzleExtension } from "./SokobanPuzzleExtension";

export type SokobanPTM = NumberPTM<SokobanGameState, {}, SokobanGridState, SokobanPuzzleExtension>;
