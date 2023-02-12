import {Position} from "../../../types/layout/Position";
import {gameStateGetCurrentFieldState} from "../../../types/sudoku/GameState";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {
    GameStateActionOrCallback,
    SetCellMarkActionParams,
    setCellMarkActionType
} from "../../../types/sudoku/GameStateAction";
import {incrementArrayItem} from "../../../utils/array";
import {CellMarkType} from "../../../types/sudoku/CellMark";
import {CellWriteMode, CellWriteModeInfo} from "../../../types/sudoku/CellWriteMode";

export const safeCrackerArrowsAction = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    position: Position,
    isRightButton: boolean
): GameStateActionOrCallback<SetCellMarkActionParams, CellType, ExType, ProcessedExType> => {
    const {marks} = gameStateGetCurrentFieldState(context.state);
    return {
        type: setCellMarkActionType(),
        params: {
            ...position,
            isCenter: true,
            cellMarkType: incrementArrayItem<CellMarkType | undefined>(
                [undefined, CellMarkType.LeftArrow, CellMarkType.RightArrow, CellMarkType.X],
                marks.find({position, isCenter: true, type: CellMarkType.Any})?.type,
                isRightButton ? -1 : 1,
            ),
        },
    };
};

export const safeCrackerArrowsCellWriteModeInfo = <ExType, ProcessedExType>(): CellWriteModeInfo<number, ExType, ProcessedExType> => ({
    mode: CellWriteMode.custom,
    digitsCount: 0,
    handlesRightMouseClick: true,
    isNoSelectionMode: true,
    onCornerClick: (context, position, isRightButton) => {
        context.onStateChange(safeCrackerArrowsAction(context, position.center, isRightButton));
    },
});
