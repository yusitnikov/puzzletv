import type {CellWriteModeInfo} from "../CellWriteMode";
import {getAbsoluteScaleByLog, getScaleLog, PartialGameStateEx} from "../GameState";

export const MoveCellWriteModeInfo: Omit<CellWriteModeInfo<any, any, any>, "mode"> = {
    isActiveForPuzzle: (
        {
            loopHorizontally = false,
            loopVertically = false,
            typeManager: {allowRotation = false, allowScale = false},
        },
        includeHidden
    ) => loopHorizontally || loopVertically || (includeHidden && (allowRotation || allowScale)),
    hotKeyStr: ["Alt+Shift"],
    isNoSelectionMode: true,
    digitsCount: 0,
    isValidGesture: (isCurrentCellWriteMode, {gesture: {pointers}}) =>
        isCurrentCellWriteMode || pointers.length > 1,
    onMove: (
        {prevMetrics, currentMetrics},
        {
            puzzle: {
                loopHorizontally,
                loopVertically,
                typeManager: {allowRotation, allowScale},
            },
            cellSize,
            onStateChange,
        }
    ) =>
        onStateChange(({loopOffset: {top, left}, angle, scale}) => ({
            loopOffset: {
                left: left + (loopHorizontally ? (currentMetrics.x - prevMetrics.x) / cellSize : 0),
                top: top + (loopVertically ? (currentMetrics.y - prevMetrics.y) / cellSize : 0),
            },
            animatingLoopOffset: false,
            angle: angle + (allowRotation ? currentMetrics.rotation - prevMetrics.rotation : 0),
            animatingAngle: false,
            scale: scale * (allowScale ? currentMetrics.scale / prevMetrics.scale : 1),
            animatingScale: false,
        })),
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
        let result: PartialGameStateEx<any, any> = {};
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
