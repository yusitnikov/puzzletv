import {ControlButtonItemProps} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {getDefaultDigitsCount} from "../../../types/sudoku/PuzzleDefinition";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const MainDigitModeButton = <T extends AnyPTM>({context, top, left}: ControlButtonItemProps<T>) => {
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
