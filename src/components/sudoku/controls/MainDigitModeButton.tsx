import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { CellWriteMode } from "../../../types/sudoku/CellWriteMode";
import { CellWriteModeButton } from "./CellWriteModeButton";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export const MainDigitModeButton: ControlButtonItemPropsGenericFc = observer(function MainDigitModeButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    const { puzzle, digitsCount } = context;

    const {
        typeManager: { createCellDataByDisplayDigit },
    } = puzzle;

    return (
        <CellWriteModeButton
            top={top}
            left={left}
            cellWriteMode={CellWriteMode.main}
            data={{ usersDigit: createCellDataByDisplayDigit(digitsCount, context) }}
            context={context}
        />
    );
});
