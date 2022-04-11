import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {FastForward, PlayArrow, Timelapse} from "@emotion-icons/material";
import {AnimationSpeed, animationSpeedToString} from "../../../types/sudoku/AnimationSpeed";
import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {RotatableDigit} from "../types/RotatableDigit";
import {RotatableGameState, RotatableProcessedGameState} from "../types/RotatableGameState";
import {useTranslate} from "../../../contexts/LanguageCodeContext";

export const RotatableSecondaryControls = (
    {
        cellSize,
        isHorizontal,
        state: {animationSpeed},
        onStateChange,
    }: ControlsProps<RotatableDigit, RotatableGameState, RotatableProcessedGameState>
) => {
    const translate = useTranslate();

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

    return <ControlButton
        left={0}
        top={0}
        flipDirection={!isHorizontal}
        cellSize={cellSize}
        onClick={handleAnimationSpeedToggle}
        title={`${translate("Rotation speed")}: ${translate(animationSpeedToString(animationSpeed))} (${translate("click to toggle")})`}
    >
        {animationSpeed === AnimationSpeed.regular && <PlayArrow/>}
        {animationSpeed === AnimationSpeed.immediate && <FastForward/>}
        {animationSpeed === AnimationSpeed.slow && <Timelapse/>}
    </ControlButton>;
};
