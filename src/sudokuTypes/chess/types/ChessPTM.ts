import { PTM } from "../../../types/sudoku/PuzzleTypeMap";
import { ChessPiece } from "./ChessPiece";
import { ChessGameState } from "./ChessGameState";

export type ChessPTM = PTM<ChessPiece, ChessGameState>;
