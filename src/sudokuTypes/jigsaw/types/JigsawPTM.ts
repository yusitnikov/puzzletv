import {PTM} from "../../../types/sudoku/PuzzleTypeMap";
import {JigsawDigit} from "./JigsawDigit";
import {JigsawGameState, JigsawProcessedGameState} from "./JigsawGameState";

export type JigsawPTM = PTM<JigsawDigit, JigsawGameState, JigsawProcessedGameState>;
