import { PTM } from "../../../types/sudoku/PuzzleTypeMap";
import { JigsawDigit } from "./JigsawDigit";
import { JigsawGameState, JigsawProcessedGameState } from "./JigsawGameState";
import { JigsawFieldState } from "./JigsawFieldState";
import { JigsawPuzzleEx } from "./JigsawPuzzleEx";

export type JigsawPTM = PTM<JigsawDigit, JigsawGameState, JigsawProcessedGameState, JigsawFieldState, JigsawPuzzleEx>;
