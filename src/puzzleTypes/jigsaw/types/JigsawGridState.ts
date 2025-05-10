import { Position, PositionWithAngle } from "../../../types/layout/Position";

export interface JigsawGridPieceState extends PositionWithAngle {
    // If several jigsaw pieces have the same z-index, they are glued together!
    zIndex: number;
    rotationAxis: Position;
}

export interface JigsawGridState {
    pieces: JigsawGridPieceState[];
}
