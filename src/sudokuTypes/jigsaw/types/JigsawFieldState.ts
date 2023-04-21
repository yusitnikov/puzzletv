import {PositionWithAngle} from "../../../types/layout/Position";

export interface JigsawFieldPieceState extends PositionWithAngle {
    zIndex: number;
}

export interface JigsawFieldState {
    pieces: JigsawFieldPieceState[];
}
