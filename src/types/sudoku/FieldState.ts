import {CellState} from "./CellState";
import {indexes08} from "../../utils/indexes";

export interface FieldState {
    cells: CellState[][];
}

export const createEmptyFieldState = (): FieldState => ({
    cells: indexes08.map(() => indexes08.map(() => ({}))),
});
