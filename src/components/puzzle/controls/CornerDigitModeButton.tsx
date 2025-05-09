import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import { CellWriteModeButton } from "./CellWriteModeButton";
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
        <CellWriteModeButton
            top={top}
            left={left}
            cellWriteMode={CellWriteMode.corner}
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
