import {CellWriteMode} from "../CellWriteMode";
import type {CellWriteModeInfo} from "../CellWriteModeInfo";
import {gameStateContinueMultiLine, gameStateResetCurrentMultiLine, gameStateStartMultiLine} from "../GameState";
import {GestureFinishReason} from "../../../utils/gestures";
import {applyCurrentMultiLineAction} from "../GameStateAction";
import {CellBackground} from "../../../components/sudoku/cell/CellBackground";
import {CellDataSet} from "../CellDataSet";
import {AnyPTM} from "../PuzzleTypeMap";
import {LinesDigitModeButton} from "../../../components/sudoku/controls/LinesDigitModeButton";

export const LinesCellWriteModeInfo = <T extends AnyPTM>(): CellWriteModeInfo<T> => ({
    mode: CellWriteMode.lines,
    mainButtonContent: LinesDigitModeButton,
    isActiveForPuzzle: ({allowDrawing = []}) => allowDrawing.length !== 0,
    hotKeyStr: ["Alt"],
    isNoSelectionMode: true,
    onCornerClick: (context, cellPosition, exactPosition) =>
        context.onStateChange(state => gameStateStartMultiLine({...context, state}, exactPosition)),
    onCornerEnter: (context, cellPosition, exactPosition) =>
        context.onStateChange(state => gameStateContinueMultiLine(
            {...context, state},
            exactPosition
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
    secondaryButtonContent: (context, _, cellSize, index) => <CellBackground
        context={context}
        colors={new CellDataSet(context.puzzle, [index])}
        size={cellSize}
        noOpacity={true}
    />,
    getCurrentSecondaryButton: ({puzzle: {disableLineColors}, state: {selectedColor}}) =>
        disableLineColors ? undefined : selectedColor,
    setCurrentSecondaryButton: ({onStateChange}, index) => onStateChange({selectedColor: index}),
    handlesRightMouseClick: true,
});
