import {ControlButton} from "./ControlButton";
import {FastForward, PlayArrow, Timelapse} from "@emotion-icons/material";
import {useTranslate} from "../../../hooks/useTranslate";
import {AnimationSpeed, animationSpeedToString} from "../../../types/sudoku/AnimationSpeed";
import {ControlButtonItem, ControlButtonItemProps, ControlButtonRegion} from "./ControlButtonsManager";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const AnimationSpeedControlButton = <T extends AnyPTM>(
    {
        top,
        left,
        context: {
            cellSizeForSidePanel: cellSize,
            state: {animationSpeed},
            onStateChange,
        },
    }: ControlButtonItemProps<T>
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
        top={top}
        left={left}
        cellSize={cellSize}
        onClick={handleAnimationSpeedToggle}
        title={`${translate("Rotation speed")}: ${translate(animationSpeedToString(animationSpeed))} (${translate("click to toggle")})`}
    >
        {animationSpeed === AnimationSpeed.regular && <PlayArrow/>}
        {animationSpeed === AnimationSpeed.immediate && <FastForward/>}
        {animationSpeed === AnimationSpeed.slow && <Timelapse/>}
    </ControlButton>;
};

export const AnimationSpeedControlButtonItem = <T extends AnyPTM>(): ControlButtonItem<T> => ({
    key: "animation-speed",
    region: ControlButtonRegion.additional,
    Component: AnimationSpeedControlButton,
});
