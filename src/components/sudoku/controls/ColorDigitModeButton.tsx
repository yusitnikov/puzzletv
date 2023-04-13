import {ControlButtonItemProps} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {PlainValueSet} from "../../../types/struct/Set";
import {indexes} from "../../../utils/indexes";
import {ctrlKeyText} from "../../../utils/os";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const ColorDigitModeButton = <T extends AnyPTM>({context, top, left}: ControlButtonItemProps<T>) => {
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
