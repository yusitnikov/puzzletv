import {ControlButtonItemProps} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {PlainValueSet} from "../../../types/struct/Set";
import {indexes} from "../../../utils/indexes";
import {ctrlKeyText} from "../../../utils/os";

export const ColorDigitModeButton = <CellType, ExType, ProcessedExType>(
    {context, top, left}: ControlButtonItemProps<CellType, ExType, ProcessedExType>
) => {
    const translate = useTranslate();

    return <CellWriteModeButton
        top={top}
        left={left}
        cellWriteMode={CellWriteMode.color}
        data={{colors: new PlainValueSet(indexes(9))}}
        title={`${translate("Colors")} (${translate("shortcut")}: ${ctrlKeyText}+Shift)`}
        context={context}
    />;
};
