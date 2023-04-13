import {ControlButtonItemProps} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";
import {ctrlKeyText} from "../../../utils/os";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const CenterDigitModeButton = <T extends AnyPTM>({context, top, left}: ControlButtonItemProps<T>) => {
    const {
        puzzle,
        state,
    } = context;

    const {
        typeManager: {createCellDataByDisplayDigit},
    } = puzzle;

    const translate = useTranslate();

    return <CellWriteModeButton
        top={top}
        left={left}
        cellWriteMode={CellWriteMode.center}
        data={{centerDigits: new CellDataSet(puzzle, [1, 2].map(digit => createCellDataByDisplayDigit(digit, state)))}}
        title={`${translate("Center")} (${translate("shortcut")}: ${ctrlKeyText})`}
        context={context}
    />;
};
