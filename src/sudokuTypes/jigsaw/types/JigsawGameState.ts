import {JigsawPieceState} from "./JigsawPieceState";

export interface JigsawGameState {
    pieces: JigsawPieceState[];
    highlightCurrentPiece: boolean;
}

export interface JigsawProcessedGameState {
    pieces: Omit<JigsawPieceState, "animating" | "zIndex">[];
}
