import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import { CellWriteModeButton } from "./CellWriteModeButton";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
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
