import {ControlButtonItemProps} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {PlainValueSet} from "../../../types/struct/Set";
import {ctrlKeyText} from "../../../utils/os";
import {CellColor} from "../../../types/sudoku/CellColor";

export const ShadingDigitModeButton = <CellType, ExType, ProcessedExType>(
    {context, top, left}: ControlButtonItemProps<CellType, ExType, ProcessedExType>
) => {
    const translate = useTranslate();

    return <CellWriteModeButton
        top={top}
        left={left}
        cellWriteMode={CellWriteMode.shading}
        data={{colors: new PlainValueSet([CellColor.shaded, CellColor.unshaded])}}
        title={`${translate("Shading")} (${translate("shortcut")}: ${ctrlKeyText}+Shift)`}
        context={context}
    />;
};
