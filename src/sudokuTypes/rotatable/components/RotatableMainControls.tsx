import {Absolute} from "../../../components/layout/absolute/Absolute";
import {ControlButton, controlButtonPaddingCoeff} from "../../../components/sudoku/controls/ControlButton";
import {PushPin, RotateRight} from "@emotion-icons/material";
import {ArrowCurveDownLeft} from "@emotion-icons/fluentui-system-filled";
import {useEventListener} from "../../../hooks/useEventListener";
import {rotateClockwise} from "../utils/rotation";
import {RotatableDigit} from "../types/RotatableDigit";
import {RotatableGameState, RotatableProcessedGameState} from "../types/RotatableGameState";
import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {useTranslate} from "../../../contexts/LanguageCodeContext";

export const RotatableMainControls = (
    {
        cellSize,
        state: {isReady, isStickyMode},
        onStateChange,
    }: ControlsProps<RotatableDigit, RotatableGameState, RotatableProcessedGameState>
) => {
    const translate = useTranslate();

    const handleRotate = () => onStateChange(({angle}) => ({angle: rotateClockwise(angle)}));

    const handleToggleStickyMode = () => onStateChange(({isStickyMode}) => ({isStickyMode: !isStickyMode}));

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code} = ev;

        switch (code) {
            case "KeyR":
                handleRotate();
                ev.preventDefault();
                break;
            case "KeyS":
                handleToggleStickyMode();
                ev.preventDefault();
                break;
        }
    });

    return <>
        {/* eslint-disable-next-line react/jsx-no-undef */}
        {!isReady && <Absolute
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

        <ControlButton
            left={0}
            top={3}
            cellSize={cellSize}
            onClick={handleRotate}
            title={`${translate("Rotate the puzzle")} (${translate("shortcut")}: R)\n${translate("Tip")}: ${translate("use the button below to control the rotation speed")}`}
        >
            <RotateRight/>
        </ControlButton>

        <ControlButton
            left={1}
            top={3}
            cellSize={cellSize}
            checked={isStickyMode}
            onClick={handleToggleStickyMode}
            title={`${translate("Sticky mode")}: ${translate(isStickyMode ? "ON" : "OFF")} (${translate("click to toggle")}, ${translate("shortcut")}: S).\n${translate("Sticky digits will preserve the orientation when rotating the field")}.\n${translate("Sticky digits are highlighted in green")}.`}
        >
            <PushPin/>
        </ControlButton>
    </>;
};
