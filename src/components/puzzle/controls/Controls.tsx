import { Absolute } from "../../layout/absolute/Absolute";
import { Rect } from "../../../types/layout/Rect";
import { controlButtonPaddingCoeff } from "./ControlButton";
import { indexes } from "../../../utils/indexes";
import { usePuzzleInputModeHotkeys } from "../../../types/puzzle/PuzzleInputModeInfo";
import { DigitControlButton } from "./DigitControlButton";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { useControlButtonsManager } from "./ControlButtonsManager";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { profiler } from "../../../utils/profiler";

export const getControlsSizeCoeff = (size: number) => size + controlButtonPaddingCoeff * (size - 1);

export interface ControlsProps<T extends AnyPTM> {
    rect: Rect;
    isHorizontal: boolean;
    context: PuzzleContext<T>;
}

export const Controls = observer(function Controls<T extends AnyPTM>({
    rect,
    isHorizontal,
    context,
}: ControlsProps<T>) {
    profiler.trace();

    const { puzzle, isReady, maxDigitInCurrentMode } = context;

    const controlButtonsManager = useControlButtonsManager(puzzle, isHorizontal);

    usePuzzleInputModeHotkeys(context);

    return (
        <Absolute {...rect}>
            {isReady && (
                <>
                    {indexes(maxDigitInCurrentMode).map((index) => (
                        <DigitControlButton key={`digit-${index}`} index={index} context={context} />
                    ))}
                </>
            )}

            {controlButtonsManager.render(context)}
        </Absolute>
    );
}) as <T extends AnyPTM>(props: ControlsProps<T>) => ReactElement;
