import {AbsoluteProps} from "../../layout/absolute/Absolute";
import {ProcessedGameState} from "../../../types/sudoku/GameState";

export interface CellDataProps<CellType, ProcessedGameStateExtensionType = {}> extends AbsoluteProps {
    data: CellType;
    size: number;
    state?: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    isInitial?: boolean;
}
