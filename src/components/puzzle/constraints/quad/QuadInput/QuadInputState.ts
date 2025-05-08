import { Position } from "../../../../../types/layout/Position";

export interface QuadInputState<CellType> {
    position: Position;
    digits: CellType[];
}
