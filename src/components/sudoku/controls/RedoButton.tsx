import {ControlButtonItemProps} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Redo} from "@emotion-icons/material";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback} from "react";
import {ctrlKeyText} from "../../../utils/os";
import {redoAction} from "../../../types/sudoku/GameStateAction";
import {useEventListener} from "../../../hooks/useEventListener";

export const RedoButton = <CellType, ExType, ProcessedExType>(
    {
        context: {
            cellSizeForSidePanel: cellSize,
            state: {isShowingSettings, processed: {isReady}},
            onStateChange,
            multiPlayer: {isEnabled},
        },
        top,
        left,
    }: ControlButtonItemProps<CellType, ExType, ProcessedExType>
) => {
    const translate = useTranslate();

    const handleRedo = useCallback(() => onStateChange(redoAction()), [onStateChange]);

    useEventListener(window, "keydown", (ev) => {
        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

        if (!isShowingSettings && !isEnabled && ctrlKey && code === "KeyY") {
            handleRedo();
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
        onClick={handleRedo}
        title={`${translate("Redo the last action")} (${translate("shortcut")}: ${ctrlKeyText}+Y)`}
    >
        <Redo/>
    </ControlButton>;
};
