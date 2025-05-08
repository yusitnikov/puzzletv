import { AutoSvgProps } from "../../svg/auto-svg/AutoSvg";
import { Size } from "../../../types/layout/Size";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { ReactElement } from "react";

export interface DigitProps<T extends AnyPTM> extends Omit<AutoSvgProps, keyof Size> {
    puzzle: PuzzleDefinition<T>;
    digit: number;
    size: number;
    color?: string;
}

export type DigitPropsGenericFc = <T extends AnyPTM>(props: DigitProps<T>) => ReactElement;
