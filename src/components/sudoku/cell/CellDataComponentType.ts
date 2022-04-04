import {ComponentType} from "react";
import {CellDataProps} from "./CellDataProps";

export interface CellDataComponentType<CellType, ProcessedGameStateExtensionType = {}> {
    component: ComponentType<CellDataProps<CellType, ProcessedGameStateExtensionType>>;
    widthCoeff: number;
}
