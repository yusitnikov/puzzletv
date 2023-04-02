import {ControlButtonItemProps} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Clear} from "@emotion-icons/material";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback} from "react";
import {clearSelectionAction} from "../../../types/sudoku/GameStateAction";
import {useEventListener} from "../../../hooks/useEventListener";

export const deleteHotkeys = ["Delete", "Backspace"];

export const DeleteButton = <CellType, ExType, ProcessedExType>(
    {
        context: {
            cellSizeForSidePanel: cellSize,
            state: {isShowingSettings, processed: {isReady}},
            onStateChange,
        },
        top,
        left,
    }: ControlButtonItemProps<CellType, ExType, ProcessedExType>
) => {
    const translate = useTranslate();

    const handleClear = useCallback(() => onStateChange(clearSelectionAction()), [onStateChange]);

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
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