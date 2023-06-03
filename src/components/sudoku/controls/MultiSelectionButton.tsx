import {ControlButtonItemProps, ControlButtonItemPropsGenericFc} from "./ControlButtonsManager";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButton} from "./ControlButton";
import {Grid} from "@emotion-icons/fluentui-system-filled";
import {CellSelectionColor} from "../cell/CellSelection";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

export const MultiSelectionButton: ControlButtonItemPropsGenericFc = observer(function MultiSelectionButton<T extends AnyPTM>(
    {context, top, left}: ControlButtonItemProps<T>
) {
    profiler.trace();

    const {
        cellSizeForSidePanel: cellSize,
        isMultiSelection,
    } = context;

    const translate = useTranslate();

    return <ControlButton
        top={top}
        left={left}
        cellSize={cellSize}
        innerBorderWidth={1}
        checked={isMultiSelection}
        onClick={() => context.onStateChange({isMultiSelection: !isMultiSelection})}
        title={translate("Multi-selection")}
    >
        <Grid color={CellSelectionColor.mainCurrent}/>
    </ControlButton>;
});
