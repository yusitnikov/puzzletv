import {Position} from "../layout/Position";
import {CellPart} from "./CellPart";

export interface CellExactPosition {
    center: Position;
    corner: Position;
    round: Position;
    type: CellPart;
}
