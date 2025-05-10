import { JigsawGamePieceState } from "./JigsawGamePieceState";

export enum JigsawJssCluesVisibility {
    All,
    ForActiveRegion,
    None,
}

export interface JigsawGameState {
    pieces: JigsawGamePieceState[];
    highlightCurrentPiece: boolean;
    jssCluesVisibility: JigsawJssCluesVisibility;
}
