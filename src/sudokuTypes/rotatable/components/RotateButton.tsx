import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {useTranslate} from "../../../hooks/useTranslate";
import {RotateLeft, RotateRight} from "@emotion-icons/material";
import {ControlButton, controlButtonPaddingCoeff} from "../../../components/sudoku/controls/ControlButton";
import {RotatableGameState, RotatableProcessedGameState} from "../types/RotatableGameState";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {Absolute} from "../../../components/layout/absolute/Absolute";
import {ArrowCurveDownLeft} from "@emotion-icons/fluentui-system-filled";
import {useEventListener} from "../../../hooks/useEventListener";

const handleRotate = <CellType,>(
    {state: {processed: {isReady}}, onStateChange}: PuzzleContext<CellType, RotatableGameState, RotatableProcessedGameState>,
    delta: number
) => onStateChange(({extension: {angle}}) => ({
    extension: {
        isAnimating: true,
        angle: isReady
            ? angle + delta
            : (Math.sign(angle) === Math.sign(delta) ? delta : 0)
    },
}));

export const RotateRightButton = (angleDelta: number) => function RotateRightButtonComponent<CellType,>(
    {context, top, left}: ControlButtonItemProps<CellType, RotatableGameState, RotatableProcessedGameState>
) {
    const {
        cellSizeForSidePanel: cellSize,
        state: {isShowingSettings, processed: {isReady}},
    } = context;

    const translate = useTranslate();

    useEventListener(window, "keydown", (ev) => {
        if (!isShowingSettings && ev.code === "KeyR") {
            handleRotate(context, ev.shiftKey ? -angleDelta : angleDelta);
            ev.preventDefault();
        }
    });

    return <>
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            onClick={() => handleRotate(context, angleDelta)}
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

export const RotateLeftButton = (angleDelta: number) => function RotateLeftButtonComponent<CellType,>(
    {context, top, left}: ControlButtonItemProps<CellType, RotatableGameState, RotatableProcessedGameState>
) {
    const {cellSizeForSidePanel: cellSize} = context;

    const translate = useTranslate();

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        onClick={() => handleRotate(context, -angleDelta)}
        title={`${translate("Rotate the puzzle")} (${translate("shortcut")}: Shift+R)\n${translate("Tip")}: ${translate("use the button from the right side to control the rotation speed")}`}
    >
        <RotateLeft/>
    </ControlButton>;
};
