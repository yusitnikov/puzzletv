import { NumberPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { EscapePuzzleExtension } from "./EscapePuzzleExtension";
import { EscapeGameState } from "./EscapeGameState";

export type EscapePTM = NumberPTM<EscapeGameState, {}, EscapePuzzleExtension>;
