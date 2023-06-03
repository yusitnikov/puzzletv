import {CellWriteMode} from "../CellWriteMode";
import type {CellWriteModeInfo} from "../CellWriteModeInfo";
import {gameStateApplyFieldDragGesture, getAbsoluteScaleByLog, getScaleLog, PartialGameStateEx} from "../GameState";
import {GestureMetrics} from "../../../utils/gestures";
import {getRectCenter} from "../../layout/Rect";
import {isCellGestureExtraData} from "../CellGestureExtraData";
import {AnyPTM} from "../PuzzleTypeMap";
import {roundToStep} from "../../../utils/math";
import {MoveDigitModeButton} from "../../../components/sudoku/controls/MoveDigitModeButton";

export const MoveCellWriteModeInfo = <T extends AnyPTM>(): CellWriteModeInfo<T> => ({
    mode: CellWriteMode.move,
    mainButtonContent: MoveDigitModeButton,
    isActiveForPuzzle: (
        {
            loopHorizontally = false,
            loopVertically = false,
            typeManager: {allowMove = false, allowRotation = false, allowScale = false},
        },
        includeHidden
    ) => loopHorizontally || loopVertically || allowMove || (includeHidden && (allowRotation || allowScale)),
    applyToWholeField: true,
    disableCellHandlers: true,
    hotKeyStr: ["Alt+Shift"],
    isNoSelectionMode: true,
    digitsCount: 0,
    isValidGesture: (isCurrentCellWriteMode, {gesture: {pointers}}) =>
        isCurrentCellWriteMode || pointers.length > 1 || !isCellGestureExtraData(pointers[0].start.extraData),
    onMove: (
        {
            gesture: {state: startContext},
            startMetrics,
            currentMetrics,
        },
        context,
        fieldRect,
    ) => {
        const {cellSize} = context;
        const fieldCenter = getRectCenter(fieldRect);
        const screenToField = ({x, y, rotation, scale}: GestureMetrics): GestureMetrics => ({
            x: (x - fieldCenter.left) / cellSize,
            y: (y - fieldCenter.top) / cellSize,
            rotation,
            scale,
        });
        gameStateApplyFieldDragGesture(
            context,
            startContext,
            screenToField(startMetrics),
            screenToField(currentMetrics),
            false,
            false,
        );
    },
    onGestureEnd: (
        props,
        context
    ) => {
        const {
            puzzle: {
                typeManager: {
                    angleStep,
                    allowRotation,
                    isFreeRotation,
                    scaleStep,
                    allowScale,
                    isFreeScale,
                },
            },
        } = context;

        context.onStateChange(({angle, scale}) => {
            let result: PartialGameStateEx<T> = {animating: true};
            if (allowRotation && !isFreeRotation && angleStep) {
                result = {
                    ...result,
                    angle: roundToStep(angle, angleStep),
                };
            }
            if (allowScale && !isFreeScale) {
                result = {
                    ...result,
                    scale: getAbsoluteScaleByLog(Math.round(getScaleLog(scale, scaleStep)), scaleStep),
                };
            }
            return result;
        });
    },
});
