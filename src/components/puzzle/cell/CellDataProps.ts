import { AutoSvgProps } from "../../svg/auto-svg/AutoSvg";
import { Size } from "../../../types/layout/Size";
import { errorColor, recentInfoColor, textColor, userDigitColor } from "../../app/globals";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";

export interface CellDataProps<T extends AnyPTM> extends Omit<AutoSvgProps, keyof Size> {
    puzzle: PuzzleDefinition<T>;
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
