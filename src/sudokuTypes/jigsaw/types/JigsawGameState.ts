import {JigsawPieceState} from "./JigsawPieceState";
import {JigsawFieldState} from "./JigsawFieldState";

export enum JigsawJssCluesVisibility {
    All,
    ForActiveRegion,
    None,
}

export interface JigsawGameState {
    pieces: JigsawPieceState[];
    highlightCurrentPiece: boolean;
    jssCluesVisibility: JigsawJssCluesVisibility;
}

export type JigsawProcessedGameState = JigsawFieldState;
