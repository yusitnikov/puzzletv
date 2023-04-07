import type {CellWriteModeInfo} from "../CellWriteMode";
import {gameStateContinueMultiLine, gameStateResetCurrentMultiLine, gameStateStartMultiLine} from "../GameState";
import {GestureFinishReason} from "../../../utils/gestures";
import {applyCurrentMultiLineAction} from "../GameStateAction";
import {CellBackground} from "../../../components/sudoku/cell/CellBackground";
import {CellDataSet} from "../CellDataSet";

export const LinesCellWriteModeInfo: Omit<CellWriteModeInfo<any, any, any>, "mode"> = {
    isActiveForPuzzle: ({allowDrawing = []}) => allowDrawing.length !== 0,
    hotKeyStr: ["Alt"],
    isNoSelectionMode: true,
    onCornerClick: (context, position) =>
        context.onStateChange(state => gameStateStartMultiLine({...context, state}, position)),
    onCornerEnter: (context, position) =>
        context.onStateChange(state => gameStateContinueMultiLine(
            {...context, state},
            position
        )),
    onGestureEnd: (
        {gesture: {isClick, pointers: [{start: {event: {button}}}]}, reason},
        context
    ) => context.onStateChange(
        reason === GestureFinishReason.pointerUp
            ? applyCurrentMultiLineAction(context, isClick, !!button)
            : gameStateResetCurrentMultiLine
    ),
    digitsCount: ({puzzle: {disableLineColors}}) => disableLineColors ? 0 : 9,
    buttonContent: (context, _, cellSize, index) => <CellBackground
        context={context}
        colors={new CellDataSet(context.puzzle, [index])}
        size={cellSize}
        noOpacity={true}
    />,
    getCurrentButton: ({puzzle: {disableLineColors}, state: {selectedColor}}) =>
        disableLineColors ? undefined : selectedColor,
    setCurrentButton: ({onStateChange}, index) => onStateChange({selectedColor: index}),
    handlesRightMouseClick: true,
};
