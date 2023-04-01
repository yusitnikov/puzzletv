import {ControlButtonItemProps} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {getDefaultDigitsCount} from "../../../types/sudoku/PuzzleDefinition";

export const MainDigitModeButton = <CellType, ExType, ProcessedExType>(
    {context, top, left}: ControlButtonItemProps<CellType, ExType, ProcessedExType>
) => {
    const {
        puzzle,
        state,
    } = context;

    const {
        typeManager: {createCellDataByDisplayDigit},
        digitsCount = getDefaultDigitsCount(puzzle),
    } = puzzle;

    return <CellWriteModeButton
        top={top}
        left={left}
        cellWriteMode={CellWriteMode.main}
        data={{usersDigit: createCellDataByDisplayDigit(digitsCount, state)}}
        context={context}
    />;
};
