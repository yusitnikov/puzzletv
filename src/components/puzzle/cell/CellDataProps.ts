import { AutoSvgProps } from "../../svg/auto-svg/AutoSvg";
import { Size } from "../../../types/layout/Size";
import { errorColor, recentInfoColor, textColor, userDigitColor } from "../../app/globals";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";

export interface CellDataProps<T extends AnyPTM> extends Omit<AutoSvgProps, keyof Size> {
    context: PuzzleContext<T>;
    data: T["cell"];
    size: number;
    isInitial?: boolean;
    isValid?: boolean;
    isRecent?: boolean;
    customColor?: string;
}

export const getDefaultCellDataColor = <T extends AnyPTM>(
    { isInitial, isValid, isRecent, customColor }: CellDataProps<T>,
    regularColor = userDigitColor,
) => customColor || (isRecent ? recentInfoColor : !isValid ? errorColor : isInitial ? textColor : regularColor);
