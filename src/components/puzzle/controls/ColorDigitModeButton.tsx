import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { PuzzleInputModeButton } from "./PuzzleInputModeButton";
import { PlainValueSet } from "../../../types/struct/Set";
import { indexes } from "../../../utils/indexes";
import { ctrlKeyText } from "../../../utils/os";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { translate } from "../../../utils/translate";

export const ColorDigitModeButton: ControlButtonItemPropsGenericFc = observer(function ColorDigitModeButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    return (
        <PuzzleInputModeButton
            top={top}
            left={left}
            inputMode={PuzzleInputMode.color}
            data={{ colors: new PlainValueSet(indexes(9)) }}
            title={`${translate("Colors")} (${translate("shortcut")}: ${ctrlKeyText}+Shift)`}
            context={context}
        />
    );
});
