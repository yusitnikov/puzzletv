import {Absolute} from "../../../components/layout/absolute/Absolute";
import {ControlButton, controlButtonPaddingCoeff} from "../../../components/sudoku/controls/ControlButton";
import {FastForward, PlayArrow, PushPin, RotateRight, Timelapse} from "@emotion-icons/material";
import {ArrowCurveDownLeft} from "@emotion-icons/fluentui-system-filled";
import {useEventListener} from "../../../hooks/useEventListener";
import {rotateClockwise} from "../utils/rotation";
import {RotatableDigit} from "../types/RotatableDigit";
import {RotatableGameState, RotatableProcessedGameState} from "../types/RotatableGameState";
import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {useTranslate} from "../../../hooks/useTranslate";
import {AnimationSpeed, animationSpeedToString} from "../../../types/sudoku/AnimationSpeed";

export const RotatableMainControls = (
    {
        context: {
            cellSize,
            state: {isReady, isStickyMode, animationSpeed, isShowingSettings},
            onStateChange,
        },
    }: ControlsProps<RotatableDigit, RotatableGameState, RotatableProcessedGameState>
) => {
    const translate = useTranslate();

    const handleRotate = () => onStateChange(({angle}) => ({angle: rotateClockwise(angle)}));

    const handleToggleStickyMode = () => onStateChange(({isStickyMode}) => ({isStickyMode: !isStickyMode}));

    const handleSetAnimationSpeed = (animationSpeed: AnimationSpeed) => onStateChange({animationSpeed});
    const handleAnimationSpeedToggle = () => {
        switch (animationSpeed) {
            case AnimationSpeed.regular:
                handleSetAnimationSpeed(AnimationSpeed.immediate);
                break;
            case AnimationSpeed.immediate:
                handleSetAnimationSpeed(AnimationSpeed.slow);
                break;
            case AnimationSpeed.slow:
                handleSetAnimationSpeed(AnimationSpeed.regular);
                break;
        }
    };

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        if (isShowingSettings) {
            return;
        }

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

        <ControlButton
            left={0}
            top={4}
            cellSize={cellSize}
            onClick={handleRotate}
            title={`${translate("Rotate the puzzle")} (${translate("shortcut")}: R)\n${translate("Tip")}: ${translate("use the button from the right side to control the rotation speed")}`}
        >
            <RotateRight/>
        </ControlButton>

        <ControlButton
            left={1}
            top={4}
            cellSize={cellSize}
            checked={isStickyMode}
            onClick={handleToggleStickyMode}
            title={`${translate("Sticky mode")}: ${translate(isStickyMode ? "ON" : "OFF")} (${translate("click to toggle")}, ${translate("shortcut")}: S).\n${translate("Sticky digits will preserve the orientation when rotating the field")}.\n${translate("Sticky digits are highlighted in green")}.`}
        >
            <PushPin/>
        </ControlButton>

        <ControlButton
            left={2}
            top={4}
            cellSize={cellSize}
            onClick={handleAnimationSpeedToggle}
            title={`${translate("Rotation speed")}: ${translate(animationSpeedToString(animationSpeed))} (${translate("click to toggle")})`}
        >
            {animationSpeed === AnimationSpeed.regular && <PlayArrow/>}
            {animationSpeed === AnimationSpeed.immediate && <FastForward/>}
            {animationSpeed === AnimationSpeed.slow && <Timelapse/>}
        </ControlButton>
    </>;
};
