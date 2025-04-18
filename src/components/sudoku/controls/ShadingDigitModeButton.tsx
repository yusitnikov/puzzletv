import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { CellWriteMode } from "../../../types/sudoku/CellWriteMode";
import { CellWriteModeButton } from "./CellWriteModeButton";
import { PlainValueSet } from "../../../types/struct/Set";
import { ctrlKeyText } from "../../../utils/os";
import { CellColor } from "../../../types/sudoku/CellColor";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const ShadingDigitModeButton: ControlButtonItemPropsGenericFc = observer(function ShadingDigitModeButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    return (
        <CellWriteModeButton
            top={top}
            left={left}
            cellWriteMode={CellWriteMode.shading}
            data={{ colors: new PlainValueSet([CellColor.shaded, CellColor.unshaded]) }}
            title={`${translate("Shading")} (${translate("shortcut")}: ${ctrlKeyText}+Shift)`}
            context={context}
        />
    );
});
