import {CellWriteMode} from "../CellWriteMode";
import type {CellWriteModeInfo} from "../CellWriteModeInfo";
import {gameStateApplyFieldDragGesture, getAbsoluteScaleByLog, getScaleLog, PartialGameStateEx} from "../GameState";
import {GestureMetrics} from "../../../utils/gestures";
import {getRectCenter} from "../../layout/Rect";
import {isCellGestureExtraData} from "../CellGestureExtraData";
import {AnyPTM} from "../PuzzleTypeMap";

export const MoveCellWriteModeInfo: CellWriteModeInfo<AnyPTM> = {
    mode: CellWriteMode.move,
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
    onMove: ({prevMetrics, currentMetrics}, context, fieldRect) => {
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
            screenToField(prevMetrics),
            screenToField(currentMetrics),
            false,
            false,
        );
    },
    onGestureEnd: (
        props,
        {
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
            onStateChange,
        }
    ) => onStateChange(({angle, scale}) => {
        let result: PartialGameStateEx<AnyPTM> = {};
        if (allowRotation && !isFreeRotation && angleStep) {
            result = {
                ...result,
                angle: Math.round(angle / angleStep) * angleStep,
                animatingAngle: true,
            };
        }
        if (allowScale && !isFreeScale) {
            result = {
                ...result,
                scale: getAbsoluteScaleByLog(Math.round(getScaleLog(scale, scaleStep)), scaleStep),
                animatingScale: true,
            };
        }
        return result;
    }),
};
