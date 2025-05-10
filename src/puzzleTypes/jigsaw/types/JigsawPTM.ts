import { PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { JigsawDigit } from "./JigsawDigit";
import { JigsawGameState } from "./JigsawGameState";
import { JigsawGridState } from "./JigsawGridState";
import { JigsawPuzzleEx } from "./JigsawPuzzleEx";

export type JigsawPTM = PTM<JigsawDigit, JigsawGameState, JigsawGridState, JigsawPuzzleEx>;
