import {ComponentType} from "react";
import {CellDataProps} from "./CellDataProps";

export interface CellDataComponentType<CellType> {
    component: ComponentType<CellDataProps<CellType>>;
    widthCoeff: number;
}
