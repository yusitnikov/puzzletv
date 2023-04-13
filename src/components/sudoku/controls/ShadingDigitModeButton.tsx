import {ControlButtonItemProps} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {PlainValueSet} from "../../../types/struct/Set";
import {ctrlKeyText} from "../../../utils/os";
import {CellColor} from "../../../types/sudoku/CellColor";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const ShadingDigitModeButton = <T extends AnyPTM>({context, top, left}: ControlButtonItemProps<T>) => {
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
