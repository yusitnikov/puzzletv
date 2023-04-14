import {ComponentType} from "react";
import {DigitProps} from "./DigitProps";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export interface DigitComponentType<T extends AnyPTM> {
    component: ComponentType<DigitProps<T>>;
    svgContentComponent: ComponentType<DigitProps<T>>;
    widthCoeff: number;
}
