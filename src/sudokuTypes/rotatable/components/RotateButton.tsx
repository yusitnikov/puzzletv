import {
    ControlButtonItemProps,
    ControlButtonItemPropsGenericFc,
} from "../../../components/sudoku/controls/ControlButtonsManager";
import { RotateLeft, RotateRight } from "@emotion-icons/material";
import { ControlButton, controlButtonPaddingCoeff } from "../../../components/sudoku/controls/ControlButton";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { Absolute } from "../../../components/layout/absolute/Absolute";
import { ArrowCurveDownLeft } from "@emotion-icons/fluentui-system-filled";
import { useEventListener } from "../../../hooks/useEventListener";
import { loop } from "../../../utils/math";
import { gameStateApplyFieldDragGesture } from "../../../types/sudoku/GameState";
import { emptyGestureMetrics } from "../../../utils/gestures";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

const handleRotate = <T extends AnyPTM>(context: PuzzleContext<T>, direction: number) => {
    const {
        puzzle: {
            typeManager: { angleStep = 0, isFreeRotation },
        },
        angle,
    } = context;

    let newAngle = angle + direction * angleStep;
    if (!isFreeRotation && angleStep !== 0) {
        const mod = loop(newAngle * direction, angleStep);
        if (mod > 0.1 * angleStep && mod < 0.9 * angleStep) {
            newAngle -= mod * direction;
        }
    }

    gameStateApplyFieldDragGesture(
        context,
        undefined,
        emptyGestureMetrics,
        { ...emptyGestureMetrics, rotation: newAngle - angle },
        true,
        false,
    );
};

export const RotateRightButton: ControlButtonItemPropsGenericFc = observer(function RotateRightButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize, isReady } = context;

    useEventListener(window, "keydown", (ev) => {
        if (!settings.isOpened && ev.code === "KeyR") {
            handleRotate(context, ev.shiftKey ? -1 : 1);
            ev.preventDefault();
        }
    });

    return (
        <>
            <ControlButton
                left={left}
                top={top}
                cellSize={cellSize}
                onClick={() => handleRotate(context, 1)}
                title={`${translate("Rotate the puzzle")} (${translate("shortcut")}: R)`}
            >
                <RotateRight />
            </ControlButton>

            {!isReady && (
                <Absolute
                    top={cellSize * (1 + controlButtonPaddingCoeff)}
                    width={cellSize * (3 + controlButtonPaddingCoeff * 2)}
                    height={cellSize * (3 + controlButtonPaddingCoeff * 2)}
                    pointerEvents={true}
                    style={{
                        fontSize: cellSize * 0.4,
                    }}
                >
                    <div>{translate("Please rotate the field once to start solving the puzzle")}!</div>

                    <Absolute
                        width={cellSize * 1.5}
                        height={cellSize * 1.5}
                        left={-cellSize * 0.25}
                        top={cellSize * (1.5 + controlButtonPaddingCoeff * 2)}
                    >
                        <ArrowCurveDownLeft />
                    </Absolute>
                </Absolute>
            )}
        </>
    );
});

export const RotateLeftButton: ControlButtonItemPropsGenericFc = observer(function RotateLeftButton<T extends AnyPTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize } = context;

    return (
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            onClick={() => handleRotate(context, -1)}
            title={`${translate("Rotate the puzzle")} (${translate("shortcut")}: Shift+R)`}
        >
            <RotateLeft />
        </ControlButton>
    );
});
