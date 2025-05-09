import { AutoSvgProps } from "../../svg/auto-svg/AutoSvg";
import { Size } from "../../../types/layout/Size";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { ReactElement } from "react";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";

export interface DigitProps<T extends AnyPTM> extends Omit<AutoSvgProps, keyof Size> {
    context: PuzzleContext<T>;
    digit: number;
    size: number;
    color?: string;
}

export type DigitPropsGenericFc = <T extends AnyPTM>(props: DigitProps<T>) => ReactElement;
