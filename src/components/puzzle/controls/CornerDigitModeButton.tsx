import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { PuzzleInputModeButton } from "./PuzzleInputModeButton";
import { CellDataSet } from "../../../types/puzzle/CellDataSet";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const CornerDigitModeButton: ControlButtonItemPropsGenericFc = observer(function CornerDigitModeButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    return (
        <PuzzleInputModeButton
            top={top}
            left={left}
            inputMode={PuzzleInputMode.cornerDigit}
            data={{
                cornerDigits: new CellDataSet(
                    context,
                    [1, 2, 3].map((digit) => context.puzzle.typeManager.createCellDataByDisplayDigit(digit, context)),
                ),
            }}
            title={`${translate("Corner")} (${translate("shortcut")}: Shift)`}
            context={context}
        />
    );
});
