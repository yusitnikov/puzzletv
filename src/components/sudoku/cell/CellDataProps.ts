import {AutoSvgProps} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";
import {errorColor, recentInfoColor, textColor, userDigitColor} from "../../app/globals";

export interface CellDataProps<CellType> extends Omit<AutoSvgProps, keyof Size> {
    data: CellType;
    size: number;
    isInitial?: boolean;
    isValid?: boolean;
    isRecent?: boolean;
    customColor?: string;
}

export const getDefaultCellDataColor = <CellType>(
    {isInitial, isValid, isRecent, customColor}: CellDataProps<CellType>,
    regularColor = userDigitColor
) => customColor || (isRecent ? recentInfoColor : (!isValid ? errorColor : (isInitial ? textColor : regularColor)));
