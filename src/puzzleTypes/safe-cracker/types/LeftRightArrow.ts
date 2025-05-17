import { Position } from "../../../types/layout/Position";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { GameStateAction, SetCellMarkActionParams, setCellMarkActionType } from "../../../types/puzzle/GameStateAction";
import { incrementArrayItem } from "../../../utils/array";
import { CellMarkType } from "../../../types/puzzle/CellMark";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { PuzzleInputModeInfo } from "../../../types/puzzle/PuzzleInputModeInfo";
import { userDigitColor } from "../../../components/app/globals";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

export const safeCrackerArrowsAction = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    position: Position,
    isRightButton: boolean,
    actionId: string,
): GameStateAction<SetCellMarkActionParams, T> => {
    return {
        type: setCellMarkActionType(),
        params: {
            ...position,
            isCenter: true,
            color: userDigitColor,
            cellMarkType: incrementArrayItem<CellMarkType | undefined>(
                [undefined, CellMarkType.LeftArrow, CellMarkType.RightArrow, CellMarkType.X],
                context.marks.find({ position, isCenter: true, type: CellMarkType.Any })?.type,
                isRightButton ? -1 : 1,
            ),
        },
        actionId,
    };
};

export const safeCrackerArrowsPuzzleInputModeInfo = <T extends AnyPTM>(): PuzzleInputModeInfo<T> => ({
    mode: PuzzleInputMode.custom,
    digitsCount: 0,
    handlesRightMouseClick: true,
    isNoSelectionMode: true,
    onCornerClick: ({ gesture: { id } }, context, { exact: { center } }, isRightButton) => {
        context.onStateChange(safeCrackerArrowsAction(context, center, isRightButton, `gesture-${id}`));
    },
});
