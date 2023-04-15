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
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeInfo} from "../../../types/sudoku/CellWriteModeInfo";
import {userDigitColor} from "../../../components/app/globals";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const safeCrackerArrowsAction = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    isRightButton: boolean,
    actionId: string,
): GameStateActionOrCallback<SetCellMarkActionParams, T> => {
    const {marks} = gameStateGetCurrentFieldState(context.state);
    return {
        type: setCellMarkActionType(),
        params: {
            ...position,
            isCenter: true,
            color: userDigitColor,
            cellMarkType: incrementArrayItem<CellMarkType | undefined>(
                [undefined, CellMarkType.LeftArrow, CellMarkType.RightArrow, CellMarkType.X],
                marks.find({position, isCenter: true, type: CellMarkType.Any})?.type,
                isRightButton ? -1 : 1,
            ),
        },
        actionId,
    };
};

export const safeCrackerArrowsCellWriteModeInfo = <T extends AnyPTM>(): CellWriteModeInfo<T> => ({
    mode: CellWriteMode.custom,
    digitsCount: 0,
    handlesRightMouseClick: true,
    isNoSelectionMode: true,
    onCornerClick: ({gesture: {id}}, context, cellPosition, exactPosition, isRightButton) => {
        context.onStateChange(safeCrackerArrowsAction(context, exactPosition.center, isRightButton, `gesture-${id}`));
    },
});
