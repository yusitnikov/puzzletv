import { ControlButtonItemProps } from "./ControlButtonsManager";
import { CellWriteMode } from "../../../types/sudoku/CellWriteMode";
import { CellWriteModeButton } from "./CellWriteModeButton";
import { useTranslate } from "../../../hooks/useTranslate";
import { CellDataSet } from "../../../types/sudoku/CellDataSet";
import { ctrlKeyText } from "../../../utils/os";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

export const CenterDigitModeButton = observer(function CenterDigitModeButton<T extends AnyPTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    const { puzzle } = context;

    const translate = useTranslate();

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
