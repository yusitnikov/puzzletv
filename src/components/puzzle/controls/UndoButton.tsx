import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { ControlButton } from "./ControlButton";
import { Undo } from "@emotion-icons/material";
import { useCallback } from "react";
import { ctrlKeyText } from "../../../utils/os";
import { getNextActionId, seekHistoryAction, undoAction } from "../../../types/puzzle/GameStateAction";
import { useEventListener } from "../../../hooks/useEventListener";
import { deleteHotkeys } from "./DeleteButton";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const UndoButton: ControlButtonItemPropsGenericFc = observer(function UndoButton<T extends AnyPTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    const {
        cellSizeForSidePanel: cellSize,
        puzzle: {
            hideDeleteButton,
            typeManager: { applyArrowsToHistory },
        },
        isReady,
        multiPlayer: { isEnabled },
    } = context;

    const handleUndo = useCallback(() => context.onStateChange(undoAction(getNextActionId())), [context]);

    useEventListener(window, "keydown", (ev) => {
        const { code, ctrlKey: winCtrlKey, metaKey: macCtrlKey } = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

        if (settings.isOpened || isEnabled) {
            return;
        }

        if ((ctrlKey && code === "KeyZ") || (hideDeleteButton && deleteHotkeys.includes(code))) {
            handleUndo();
            ev.preventDefault();
        }

        if (applyArrowsToHistory && code === "ArrowLeft") {
            if (ctrlKey) {
                context.onStateChange(seekHistoryAction(0, getNextActionId()));
            } else {
                handleUndo();
            }
            ev.preventDefault();
        }
    });

    if (!isReady || isEnabled) {
        return null;
    }

    return (
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            onClick={handleUndo}
            title={`${translate("Undo the last action")} (${translate("shortcut")}: ${ctrlKeyText}+Z)`}
        >
            <div style={{ position: "absolute", top: "-10%", width: "100%" }}>
                <Undo />
            </div>

            <div
                style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    width: "100%",
                    fontSize: "30%",
                    lineHeight: "normal",
                    textAlign: "center",
                }}
            >
                {translate("Undo")}
            </div>
        </ControlButton>
    );
});
