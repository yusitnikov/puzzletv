import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { CellWriteMode } from "../../../types/sudoku/CellWriteMode";
import { CellWriteModeButton } from "./CellWriteModeButton";
import { useTranslate } from "../../../hooks/useTranslate";
import { PlainValueSet } from "../../../types/struct/Set";
import { indexes } from "../../../utils/indexes";
import { ctrlKeyText } from "../../../utils/os";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";

export const ColorDigitModeButton: ControlButtonItemPropsGenericFc = observer(function ColorDigitModeButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    const translate = useTranslate();

    return (
        <CellWriteModeButton
            top={top}
            left={left}
            cellWriteMode={CellWriteMode.color}
            data={{ colors: new PlainValueSet(indexes(9)) }}
            title={`${translate("Colors")} (${translate("shortcut")}: ${ctrlKeyText}+Shift)`}
            context={context}
        />
    );
});
