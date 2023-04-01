import {ControlButtonItemProps} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Undo} from "@emotion-icons/material";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback} from "react";
import {ctrlKeyText} from "../../../utils/os";
import {undoAction} from "../../../types/sudoku/GameStateAction";
import {useEventListener} from "../../../hooks/useEventListener";
import {deleteHotkeys} from "./DeleteButton";

export const UndoButton = <CellType, ExType, ProcessedExType>(
    {
        context: {
            cellSizeForSidePanel: cellSize,
            puzzle: {hideDeleteButton},
            state: {isShowingSettings, processed: {isReady}},
            onStateChange,
            multiPlayer: {isEnabled},
        },
        top,
        left,
    }: ControlButtonItemProps<CellType, ExType, ProcessedExType>
) => {
    const translate = useTranslate();

    const handleUndo = useCallback(() => onStateChange(undoAction()), [onStateChange]);

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

        if (!isShowingSettings && !isEnabled && ((ctrlKey && code === "KeyZ") || (hideDeleteButton && deleteHotkeys.includes(code)))) {
            handleUndo();
            ev.preventDefault();
        }
    });

    if (!isReady || isEnabled) {
        return null;
    }

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        onClick={handleUndo}
        title={`${translate("Undo the last action")} (${translate("shortcut")}: ${ctrlKeyText}+Z)`}
    >
        <Undo/>
    </ControlButton>;
};
