import {JigsawGamePieceState} from "./JigsawGamePieceState";
import {PositionWithAngle} from "../../../types/layout/Position";

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

export interface JigsawProcessedGameState {
    pieces: PositionWithAngle[];
}
