import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import {controlButtonPaddingCoeff} from "./ControlButton";
import {indexes} from "../../../utils/indexes";
import {resolveDigitsCountInCellWriteMode, useCellWriteModeHotkeys} from "../../../types/sudoku/CellWriteMode";
import {DigitControlButton} from "./DigitControlButton";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {useControlButtonsManager} from "./ControlButtonsManager";

export const getControlsSizeCoeff = (size: number) => size + controlButtonPaddingCoeff * (size - 1);

export interface ControlsProps<CellType, ExType = {}, ProcessedExType = {}> {
    rect: Rect;
    isHorizontal: boolean;
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
}

export const Controls = <CellType, ExType = {}, ProcessedExType = {}>(
    {rect, isHorizontal, context}: ControlsProps<CellType, ExType, ProcessedExType>
) => {
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
