import { Line } from "../layout/Position";
import { CellColorValue } from "./CellColor";

export interface LineWithColor extends Line {
    color?: CellColorValue;
}
