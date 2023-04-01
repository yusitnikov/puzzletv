import {ControlButtonItemProps} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";

export const CornerDigitModeButton = <CellType, ExType, ProcessedExType>(
    {context, top, left}: ControlButtonItemProps<CellType, ExType, ProcessedExType>
) => {
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
        cellWriteMode={CellWriteMode.corner}
        data={{cornerDigits: new CellDataSet(puzzle, [1, 2, 3].map(digit => createCellDataByDisplayDigit(digit, state)))}}
        title={`${translate("Corner")} (${translate("shortcut")}: Shift)`}
        context={context}
    />;
};
