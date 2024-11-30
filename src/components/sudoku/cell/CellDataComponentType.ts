import { ComponentType } from "react";
import { CellDataProps } from "./CellDataProps";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";

export interface CellDataComponentType<T extends AnyPTM> {
    component: ComponentType<CellDataProps<T>>;
    widthCoeff?: number;
    cellSizeCoeff?: number;
}
