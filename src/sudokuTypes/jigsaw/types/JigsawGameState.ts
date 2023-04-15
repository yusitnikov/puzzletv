import {JigsawPieceState} from "./JigsawPieceState";
import {JigsawFieldState} from "./JigsawFieldState";

export interface JigsawGameState {
    pieces: JigsawPieceState[];
    highlightCurrentPiece: boolean;
}

export type JigsawProcessedGameState = JigsawFieldState;
