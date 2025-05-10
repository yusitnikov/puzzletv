import { NumberPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { SokobanGameState } from "./SokobanGameState";
import { SokobanGridState } from "./SokobanGridState";
import { SokobanPuzzleExtension } from "./SokobanPuzzleExtension";

export type SokobanPTM = NumberPTM<SokobanGameState, SokobanGridState, SokobanPuzzleExtension>;
