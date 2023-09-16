import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {controlButtonPaddingCoeff} from "./ControlButton";
import {indexes} from "../../../utils/indexes";
import {useCellWriteModeHotkeys} from "../../../types/sudoku/CellWriteModeInfo";
import {DigitControlButton} from "./DigitControlButton";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {useControlButtonsManager} from "./ControlButtonsManager";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {ReactElement} from "react";
import {profiler} from "../../../utils/profiler";

export const getControlsSizeCoeff = (size: number) => size + controlButtonPaddingCoeff * (size - 1);

export interface ControlsProps<T extends AnyPTM> {
    rect: Rect;
    isHorizontal: boolean;
    context: PuzzleContext<T>;
}

export const Controls = observer(function Controls<T extends AnyPTM>({rect, isHorizontal, context}: ControlsProps<T>) {
    profiler.trace();

    const {puzzle, isReady, digitsCountInCurrentMode} = context;

    const controlButtonsManager = useControlButtonsManager(puzzle, isHorizontal);

    useCellWriteModeHotkeys(context);

    return <Absolute {...rect}>
        {isReady && <>
            {indexes(digitsCountInCurrentMode).map(index => <DigitControlButton
                key={`digit-${index}`}
                index={index}
                context={context}
            />)}
        </>}

        {controlButtonsManager.render(context)}
    </Absolute>;
}) as <T extends AnyPTM>(props: ControlsProps<T>) => ReactElement;
