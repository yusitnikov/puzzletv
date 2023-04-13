import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {controlButtonPaddingCoeff} from "./ControlButton";
import {indexes} from "../../../utils/indexes";
import {resolveDigitsCountInCellWriteMode, useCellWriteModeHotkeys} from "../../../types/sudoku/CellWriteModeInfo";
import {DigitControlButton} from "./DigitControlButton";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {useControlButtonsManager} from "./ControlButtonsManager";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const getControlsSizeCoeff = (size: number) => size + controlButtonPaddingCoeff * (size - 1);

export interface ControlsProps<T extends AnyPTM> {
    rect: Rect;
    isHorizontal: boolean;
    context: PuzzleContext<T>;
}

export const Controls = <T extends AnyPTM>({rect, isHorizontal, context}: ControlsProps<T>) => {
    const {
        puzzle,
        state: {processed: {isReady}},
    } = context;

    const controlButtonsManager = useControlButtonsManager(puzzle, isHorizontal);

    const digitsCountInCurrentMode = resolveDigitsCountInCellWriteMode(context);

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
};
