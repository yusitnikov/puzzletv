import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { PuzzleInputModeButton } from "./PuzzleInputModeButton";
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
        <PuzzleInputModeButton
            top={top}
            left={left}
            inputMode={PuzzleInputMode.mainDigit}
            data={{ usersDigit: createCellDataByDisplayDigit(digitsCount, context) }}
            context={context}
        />
    );
});
