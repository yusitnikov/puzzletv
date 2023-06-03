import {ControlButtonItemProps, ControlButtonItemPropsGenericFc} from "./ControlButtonsManager";
import {ControlButton} from "./ControlButton";
import {Redo} from "@emotion-icons/material";
import {useTranslate} from "../../../hooks/useTranslate";
import {useCallback} from "react";
import {ctrlKeyText} from "../../../utils/os";
import {getNextActionId, redoAction} from "../../../types/sudoku/GameStateAction";
import {useEventListener} from "../../../hooks/useEventListener";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {settings} from "../../../types/layout/Settings";
import {profiler} from "../../../utils/profiler";

export const RedoButton: ControlButtonItemPropsGenericFc = observer(function RedoButton<T extends AnyPTM>(
    {context, top, left}: ControlButtonItemProps<T>
) {
    profiler.trace();

    const {
        cellSizeForSidePanel: cellSize,
        isReady,
        multiPlayer: {isEnabled},
    } = context;

    const translate = useTranslate();

    const handleRedo = useCallback(() => context.onStateChange(redoAction(getNextActionId())), [context]);

    useEventListener(window, "keydown", (ev) => {
        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

        if (!settings.isOpened && !isEnabled && ctrlKey && code === "KeyY") {
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
});
