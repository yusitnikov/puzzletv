import {ControlButtonItemProps} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Undo} from "@emotion-icons/material";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback} from "react";
import {ctrlKeyText} from "../../../utils/os";
import {getNextActionId, undoAction} from "../../../types/sudoku/GameStateAction";
import {useEventListener} from "../../../hooks/useEventListener";
import {deleteHotkeys} from "./DeleteButton";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const UndoButton = <T extends AnyPTM>(
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
    }: ControlButtonItemProps<T>
) => {
    const translate = useTranslate();

    const handleUndo = useCallback(() => onStateChange(undoAction(getNextActionId())), [onStateChange]);

    useEventListener(window, "keydown", (ev) => {
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
        <div style={{position: "absolute", top: "-10%", width: "100%"}}>
            <Undo/>
        </div>

        <div style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            fontSize: "30%",
            lineHeight: "normal",
            textAlign: "center",
        }}>
            {translate("Undo")}
        </div>
    </ControlButton>;
};
