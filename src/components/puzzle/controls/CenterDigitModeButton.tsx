import { ControlButtonItemProps } from "./ControlButtonsManager";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { PuzzleInputModeButton } from "./PuzzleInputModeButton";
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

    return (
        <PuzzleInputModeButton
            top={top}
            left={left}
            inputMode={PuzzleInputMode.centerDigit}
            data={{
                centerDigits: new CellDataSet(
                    context,
                    [1, 2].map((digit) => context.puzzle.typeManager.createCellDataByDisplayDigit(digit, context)),
                ),
            }}
            title={`${translate("Center")} (${translate("shortcut")}: ${ctrlKeyText})`}
            context={context}
        />
    );
}) as <T extends AnyPTM>({ context, top, left }: ControlButtonItemProps<T>) => ReactElement;
