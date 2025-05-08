import { ControlButtonItemProps } from "./ControlButtonsManager";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import { CellWriteModeButton } from "./CellWriteModeButton";
import { CellDataSet } from "../../../types/puzzle/CellDataSet";
import { ctrlKeyText } from "../../../utils/os";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { translate } from "../../../utils/translate";

export const CenterDigitModeButton = observer(function CenterDigitModeButton<T extends AnyPTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    const { puzzle } = context;

    return (
        <CellWriteModeButton
            top={top}
            left={left}
            cellWriteMode={CellWriteMode.center}
            data={{
                centerDigits: new CellDataSet(
                    puzzle,
                    [1, 2].map((digit) => puzzle.typeManager.createCellDataByDisplayDigit(digit, context)),
                ),
            }}
            title={`${translate("Center")} (${translate("shortcut")}: ${ctrlKeyText})`}
            context={context}
        />
    );
}) as <T extends AnyPTM>({ context, top, left }: ControlButtonItemProps<T>) => ReactElement;
