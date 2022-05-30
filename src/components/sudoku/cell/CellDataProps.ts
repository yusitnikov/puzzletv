import {ProcessedGameState} from "../../../types/sudoku/GameState";
import {AutoSvgProps} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";
import {errorColor, recentInfoColor, textColor, userDigitColor} from "../../app/globals";

export interface CellDataProps<CellType, ProcessedGameStateExtensionType = {}> extends Omit<AutoSvgProps, keyof Size> {
    data: CellType;
    size: number;
    state?: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    isInitial?: boolean;
    isValid?: boolean;
    isRecent?: boolean;
}

export const getDefaultCellDataColor = <CellType, ProcessedGameStateExtensionType = {}>(
    {data, state, isInitial, isValid, isRecent}: CellDataProps<CellType, ProcessedGameStateExtensionType>,
    regularColor = userDigitColor
) => isRecent ? recentInfoColor : (!isValid ? errorColor : (isInitial ? textColor : regularColor));
