import {ControlButtonItemProps} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Clear} from "@emotion-icons/material";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback} from "react";
import {clearSelectionAction, getNextActionId} from "../../../types/sudoku/GameStateAction";
import {useEventListener} from "../../../hooks/useEventListener";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const deleteHotkeys = ["Delete", "Backspace"];

export const DeleteButton = <T extends AnyPTM>(
    {
        context: {
            cellSizeForSidePanel: cellSize,
            state: {isShowingSettings, processed: {isReady}},
            onStateChange,
        },
        top,
        left,
    }: ControlButtonItemProps<T>
) => {
    const translate = useTranslate();

    const handleClear = useCallback(() => onStateChange(clearSelectionAction(getNextActionId())), [onStateChange]);

    useEventListener(window, "keydown", (ev) => {
        if (!isShowingSettings && deleteHotkeys.includes(ev.code)) {
            handleClear();
            ev.preventDefault();
        }
    });

    if (!isReady) {
        return null;
    }

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        onClick={handleClear}
        title={`${translate("Clear the cell contents")} (${translate("shortcut")}: Delete ${translate("or")} Backspace)`}
    >
        <Clear/>
    </ControlButton>;
};
