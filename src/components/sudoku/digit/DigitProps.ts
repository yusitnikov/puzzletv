import {AutoSvgProps} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";

export interface DigitProps extends Omit<AutoSvgProps, keyof Size> {
    digit: number;
    size: number;
    color?: string;
}
