import {PTM} from "../../../types/sudoku/PuzzleTypeMap";
import {MultiStageGameState} from "./MultiStageGameState";

export type MultiStagePTM<CellType = number> = PTM<CellType, MultiStageGameState>;
