import {JigsawPieceState} from "./JigsawPieceState";

export interface JigsawGameState {
    pieces: JigsawPieceState[];
}

export interface JigsawProcessedGameState {
    pieces: Omit<JigsawPieceState, "animating" | "zIndex">[];
}
