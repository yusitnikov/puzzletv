import {ControlButton} from "./ControlButton";
import {FastForward, PlayArrow, Timelapse} from "@emotion-icons/material";
import {ControlsProps} from "./Controls";
import {useTranslate} from "../../../hooks/useTranslate";
import {AnimationSpeed, animationSpeedToString} from "../../../types/sudoku/AnimationSpeed";
import {Position} from "../../../types/layout/Position";

export const AnimationSpeedControlButton = <CellType, ExType extends { animationSpeed: AnimationSpeed }, ProcessedExType>(position: Position) =>
    function AnimationSpeedControlButtonComponent(props: ControlsProps<CellType, ExType, ProcessedExType>) {
        return <AnimationSpeedControlButtonByPosition {...position} {...props}/>;
    };

export const AnimationSpeedControlButtonByPosition = <CellType, ExType extends { animationSpeed: AnimationSpeed }, ProcessedExType>(
    {
        top,
        left,
        context: {
            cellSizeForSidePanel: cellSize,
            state: {
                extension: {animationSpeed},
            },
            onStateChange,
        },
    }: ControlsProps<CellType, ExType, ProcessedExType> & Position
) => {
    const translate = useTranslate();

    const handleSetAnimationSpeed = (animationSpeed: AnimationSpeed) => onStateChange({extension: {animationSpeed} as Partial<ExType>});
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
