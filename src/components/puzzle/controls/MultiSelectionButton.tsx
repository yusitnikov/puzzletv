import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { ControlButton } from "./ControlButton";
import { Grid } from "@emotion-icons/fluentui-system-filled";
import { CellHighlightColor } from "../cell/CellHighlight";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const MultiSelectionButton: ControlButtonItemPropsGenericFc = observer(function MultiSelectionButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize, isMultiSelection } = context;

    return (
        <ControlButton
            top={top}
            left={left}
            cellSize={cellSize}
            innerBorderWidth={1}
            checked={isMultiSelection}
            onClick={() => context.onStateChange({ isMultiSelection: !isMultiSelection })}
            title={translate("Multi-selection")}
        >
            <Grid color={CellHighlightColor.mainCurrent} />
        </ControlButton>
    );
});
