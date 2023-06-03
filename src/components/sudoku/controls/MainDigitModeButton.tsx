import {ControlButtonItemProps, ControlButtonItemPropsGenericFc} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {getDefaultDigitsCount} from "../../../types/sudoku/PuzzleDefinition";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

export const MainDigitModeButton: ControlButtonItemPropsGenericFc = observer(function MainDigitModeButton<T extends AnyPTM>(
    {context, top, left}: ControlButtonItemProps<T>
) {
    profiler.trace();

    const {puzzle} = context;

    const {
        typeManager: {createCellDataByDisplayDigit},
        digitsCount = getDefaultDigitsCount(puzzle),
    } = puzzle;

    return <CellWriteModeButton
        top={top}
        left={left}
        cellWriteMode={CellWriteMode.main}
        data={{usersDigit: createCellDataByDisplayDigit(digitsCount, context)}}
        context={context}
    />;
});
