import {ComponentType} from "react";
import {DigitProps} from "./DigitProps";

export interface DigitComponentType {
    component: ComponentType<DigitProps>;
    svgContentComponent: ComponentType<DigitProps>;
    widthCoeff: number;
}
