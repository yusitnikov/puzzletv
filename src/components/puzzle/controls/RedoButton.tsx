import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { ControlButton } from "./ControlButton";
import { Redo } from "@emotion-icons/material";
import { useCallback } from "react";
import { ctrlKeyText } from "../../../utils/os";
import { getNextActionId, redoAction, seekHistoryAction } from "../../../types/puzzle/GameStateAction";
import { useEventListener } from "../../../hooks/useEventListener";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export const RedoButton: ControlButtonItemPropsGenericFc = observer(function RedoButton<T extends AnyPTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    const {
        puzzle: {
            typeManager: { applyArrowsToHistory },
        },
        cellSizeForSidePanel: cellSize,
        isReady,
        multiPlayer: { isEnabled },
    } = context;

    const handleRedo = useCallback(() => context.onStateChange(redoAction(getNextActionId())), [context]);

    useEventListener(window, "keydown", (ev) => {
        const { code, ctrlKey: winCtrlKey, metaKey: macCtrlKey } = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

        if (settings.isOpened || isEnabled) {
            return;
        }

        if (ctrlKey && code === "KeyY") {
            handleRedo();
            ev.preventDefault();
        }

        if (applyArrowsToHistory && code === "ArrowRight") {
            if (ctrlKey && context.gridStateHistory.statesCount) {
                context.onStateChange(seekHistoryAction(context.gridStateHistory.statesCount - 1, getNextActionId()));
            } else {
                handleRedo();
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
            onClick={handleRedo}
            title={`${translate("Redo the last action")} (${translate("shortcut")}: ${ctrlKeyText}+Y)`}
        >
            <div style={{ position: "absolute", top: "-10%", width: "100%" }}>
                <Redo />
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
                {translate("Redo")}
            </div>
        </ControlButton>
    );
});
