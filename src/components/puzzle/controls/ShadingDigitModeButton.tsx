import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { PuzzleInputModeButton } from "./PuzzleInputModeButton";
import { PlainValueSet } from "../../../types/struct/Set";
import { ctrlKeyText } from "../../../utils/os";
import { CellColor } from "../../../types/puzzle/CellColor";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const ShadingDigitModeButton: ControlButtonItemPropsGenericFc = observer(function ShadingDigitModeButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    return (
        <PuzzleInputModeButton
            top={top}
            left={left}
            inputMode={PuzzleInputMode.shading}
            data={{ colors: new PlainValueSet([CellColor.shaded, CellColor.unshaded]) }}
            title={`${translate("Shading")} (${translate("shortcut")}: ${ctrlKeyText}+Shift)`}
            context={context}
        />
    );
});
