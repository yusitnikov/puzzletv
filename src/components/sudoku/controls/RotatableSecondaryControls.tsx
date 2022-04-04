import {ControlButton} from "./ControlButton";
import {FastForward, PlayArrow, Timelapse} from "@emotion-icons/material";
import {AnimationSpeed, animationSpeedToString} from "../../../types/sudoku/AnimationSpeed";
import {ControlsProps} from "./Controls";
import {RotatableDigit} from "../../../types/sudoku/RotatableDigit";
import {RotatableGameState, RotatableProcessedGameState} from "../../../types/sudoku/RotatableGameState";

export const RotatableSecondaryControls = (
    {
        cellSize,
        isHorizontal,
        state: {animationSpeed},
        onStateChange,
    }: ControlsProps<RotatableDigit, RotatableGameState, RotatableProcessedGameState>
) => {
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
        title={`Rotation speed: ${animationSpeedToString(animationSpeed)} (click to toggle)`}
    >
        {animationSpeed === AnimationSpeed.regular && <PlayArrow/>}
        {animationSpeed === AnimationSpeed.immediate && <FastForward/>}
        {animationSpeed === AnimationSpeed.slow && <Timelapse/>}
    </ControlButton>;
};
