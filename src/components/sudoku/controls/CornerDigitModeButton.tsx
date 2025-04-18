import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { CellWriteMode } from "../../../types/sudoku/CellWriteMode";
import { CellWriteModeButton } from "./CellWriteModeButton";
import { CellDataSet } from "../../../types/sudoku/CellDataSet";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const CornerDigitModeButton: ControlButtonItemPropsGenericFc = observer(function CornerDigitModeButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    const { puzzle } = context;

    return (
        <CellWriteModeButton
            top={top}
            left={left}
            cellWriteMode={CellWriteMode.corner}
            data={{
                cornerDigits: new CellDataSet(
                    puzzle,
                    [1, 2, 3].map((digit) => puzzle.typeManager.createCellDataByDisplayDigit(digit, context)),
                ),
            }}
            title={`${translate("Corner")} (${translate("shortcut")}: Shift)`}
            context={context}
        />
    );
});
