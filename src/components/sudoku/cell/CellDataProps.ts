import {ProcessedGameState} from "../../../types/sudoku/GameState";
import {AutoSvgProps} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";
import {errorColor, recentInfoColor, textColor, userDigitColor} from "../../app/globals";

export interface CellDataProps<CellType, ProcessedGameStateExtensionType = {}> extends Omit<AutoSvgProps, keyof Size> {
    data: CellType;
    size: number;
    isInitial?: boolean;
    isValid?: boolean;
    isRecent?: boolean;
    customColor?: string;
}

export const getDefaultCellDataColor = <CellType, ProcessedGameStateExtensionType = {}>(
    {isInitial, isValid, isRecent, customColor}: CellDataProps<CellType, ProcessedGameStateExtensionType>,
    regularColor = userDigitColor
) => customColor || (isRecent ? recentInfoColor : (!isValid ? errorColor : (isInitial ? textColor : regularColor)));
