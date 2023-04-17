import {ControlButtonItemProps} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Redo} from "@emotion-icons/material";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback} from "react";
import {ctrlKeyText} from "../../../utils/os";
import {getNextActionId, redoAction} from "../../../types/sudoku/GameStateAction";
import {useEventListener} from "../../../hooks/useEventListener";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const RedoButton = <T extends AnyPTM>(
    {
        context: {
            cellSizeForSidePanel: cellSize,
            state: {isShowingSettings, processed: {isReady}},
            onStateChange,
            multiPlayer: {isEnabled},
        },
        top,
        left,
    }: ControlButtonItemProps<T>
) => {
    const translate = useTranslate();

    const handleRedo = useCallback(() => onStateChange(redoAction(getNextActionId())), [onStateChange]);

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
        <div style={{position: "absolute", top: "-10%", width: "100%"}}>
            <Redo/>
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
            {translate("Redo")}
        </div>
    </ControlButton>;
};
