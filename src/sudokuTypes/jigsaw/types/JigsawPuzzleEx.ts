import {JigsawPieceInfo} from "./JigsawPieceInfo";
import {Position} from "../../../types/layout/Position";

export interface JigsawPuzzleEx {
    pieces: JigsawPieceInfo[];
    otherCells: Position[];
}
