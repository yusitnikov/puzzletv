import { ComponentType } from "react";
import { CellDataProps } from "./CellDataProps";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

/**
 * Information about how to render cell data (given digits, user digits, pencilmarks).
 */
export interface CellDataComponentType<T extends AnyPTM> {
    /**
     * Component to render cell data.
     */
    component: ComponentType<CellDataProps<T>>;
    /**
     * Ratio between cell data width and height.
     * Used to determine the distance between centermarks.
     */
    widthCoeff?: number;
    /**
     * Ratio between given digit height and cell size,
     * e.g. cellSizeCoeff = 0.7 would mean that given digit will take 70% of the cell.
     */
    cellSizeCoeff?: number;
}
