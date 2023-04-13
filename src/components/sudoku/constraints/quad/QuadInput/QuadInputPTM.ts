import {PTM} from "../../../../../types/sudoku/PuzzleTypeMap";
import {QuadInputGameState} from "./QuadInputGameState";

export type QuadInputPTM<CellType = number, GameStateExType extends QuadInputGameState<CellType> = QuadInputGameState<CellType>> =
    PTM<CellType, GameStateExType>;

export type AnyQuadInputPTM<CellType = any> = QuadInputPTM<CellType, QuadInputGameState<CellType>>;
