import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {useTranslate} from "../../../hooks/useTranslate";
import {RotateLeft, RotateRight} from "@emotion-icons/material";
import {ControlButton, controlButtonPaddingCoeff} from "../../../components/sudoku/controls/ControlButton";
import {RotatableGameState} from "../types/RotatableGameState";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {Absolute} from "../../../components/layout/absolute/Absolute";
import {ArrowCurveDownLeft} from "@emotion-icons/fluentui-system-filled";
import {useEventListener} from "../../../hooks/useEventListener";
import {loop} from "../../../utils/math";

const handleRotate = <CellType,>(
    {puzzle: {typeManager: {angleStep = 0}}, onStateChange}: PuzzleContext<CellType, RotatableGameState>,
    direction: number
) => onStateChange(({angle}) => {
    let newAngle = angle + direction * angleStep;
    if (angleStep !== 0) {
        const mod = loop(newAngle * direction, angleStep);
        if (mod > 0.1 * angleStep && mod < 0.9 * angleStep) {
            newAngle -= mod * direction;
        }
    }
    return ({
        animatingAngle: true,
        angle: newAngle,
    });
});

export const RotateRightButton = <CellType,>(
    {context, top, left}: ControlButtonItemProps<CellType, RotatableGameState>
) => {
    const {
        cellSizeForSidePanel: cellSize,
        state: {isShowingSettings, processed: {isReady}},
    } = context;

    const translate = useTranslate();

    useEventListener(window, "keydown", (ev) => {
        if (!isShowingSettings && ev.code === "KeyR") {
            handleRotate(context, ev.shiftKey ? -1 : 1);
            ev.preventDefault();
        }
    });

    return <>
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            onClick={() => handleRotate(context, 1)}
            title={`${translate("Rotate the puzzle")} (${translate("shortcut")}: R)\n${translate("Tip")}: ${translate("use the button from the right side to control the rotation speed")}`}
        >
            <RotateRight/>
        </ControlButton>

        {!isReady && <Absolute
            top={cellSize * (1 + controlButtonPaddingCoeff)}
            width={cellSize * (3 + controlButtonPaddingCoeff * 2)}
            height={cellSize * (3 + controlButtonPaddingCoeff * 2)}
            pointerEvents={true}
            style={{
                fontSize: cellSize * 0.4,
            }}
        >
            <div>{translate("Please rotate the field once to start solving the puzzle!")}</div>

            <Absolute
                width={cellSize * 1.5}
                height={cellSize * 1.5}
                left={-cellSize * 0.25}
                top={cellSize * (1.5 + controlButtonPaddingCoeff * 2)}
            >
                <ArrowCurveDownLeft/>
            </Absolute>
        </Absolute>}
    </>;
};

export const RotateLeftButton = <CellType,>(
    {context, top, left}: ControlButtonItemProps<CellType, RotatableGameState>
) => {
    const {cellSizeForSidePanel: cellSize} = context;

    const translate = useTranslate();

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        onClick={() => handleRotate(context, -1)}
        title={`${translate("Rotate the puzzle")} (${translate("shortcut")}: Shift+R)\n${translate("Tip")}: ${translate("use the button from the right side to control the rotation speed")}`}
    >
        <RotateLeft/>
    </ControlButton>;
};
