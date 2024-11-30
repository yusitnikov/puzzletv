import { PositionWithAngle } from "../../../types/layout/Position";

export interface JigsawFieldPieceState extends PositionWithAngle {
    // If several jigsaw pieces have the same z-index, they are glued together!
    zIndex: number;
}

export interface JigsawFieldState {
    pieces: JigsawFieldPieceState[];
}
