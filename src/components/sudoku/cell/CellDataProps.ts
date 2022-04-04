import {AbsoluteProps} from "../../layout/absolute/Absolute";
import {ProcessedGameState} from "../../../hooks/sudoku/useGame";

export interface CellDataProps<CellType> extends AbsoluteProps {
    data: CellType;
    size: number;
    state?: ProcessedGameState<CellType>;
    isInitial?: boolean;
}
