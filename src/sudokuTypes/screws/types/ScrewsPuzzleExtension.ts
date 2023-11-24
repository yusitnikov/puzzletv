import {Position} from "../../../types/layout/Position";
import {Rect} from "../../../types/layout/Rect";

export interface ScrewDigit<CellT> {
    position: Position;
    digit: CellT;
}

export interface Screw<CellT> {
    initialPosition: Rect;
    digits: ScrewDigit<CellT>[],
}

export interface ScrewsPuzzleExtension<CellT> {
    screws: Screw<CellT>[];
}
