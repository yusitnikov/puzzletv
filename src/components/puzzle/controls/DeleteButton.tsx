import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { ControlButton } from "./ControlButton";
import { Clear } from "@emotion-icons/material";
import { useCallback } from "react";
import { clearSelectionAction, getNextActionId } from "../../../types/puzzle/GameStateAction";
import { useEventListener } from "../../../hooks/useEventListener";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const deleteHotkeys = ["Delete", "Backspace"];

export const DeleteButton: ControlButtonItemPropsGenericFc = observer(function DeleteButton<T extends AnyPTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize, isReady } = context;

    const handleClear = useCallback(() => context.onStateChange(clearSelectionAction(getNextActionId())), [context]);

    useEventListener(window, "keydown", (ev) => {
        if (!settings.isOpened && deleteHotkeys.includes(ev.code)) {
            handleClear();
            ev.preventDefault();
        }
    });

    if (!isReady) {
        return null;
    }

    return (
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            onClick={handleClear}
            title={`${translate("Clear the cell contents")} (${translate("shortcut")}: Delete ${translate("or")} Backspace)`}
        >
            <Clear />
        </ControlButton>
    );
});
