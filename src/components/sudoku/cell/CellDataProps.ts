import {ProcessedGameState} from "../../../types/sudoku/GameState";
import {AutoSvgProps} from "../../svg/auto-svg/AutoSvg";
import {Size} from "../../../types/layout/Size";

export interface CellDataProps<CellType, ProcessedGameStateExtensionType = {}> extends Omit<AutoSvgProps, keyof Size> {
    data: CellType;
    size: number;
    state?: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    isInitial?: boolean;
    isValid?: boolean;
}
