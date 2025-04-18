import { ControlButtonItemProps } from "../../../components/sudoku/controls/ControlButtonsManager";
import { PushPin } from "@emotion-icons/material";
import { ControlButton } from "../../../components/sudoku/controls/ControlButton";
import { useEventListener } from "../../../hooks/useEventListener";
import { AnyRotatablePTM } from "../types/RotatablePTM";
import { ReactElement } from "react";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { translate } from "../../../utils/translate";

export const StickyModeButton = observer(function StickyModeButton<T extends AnyRotatablePTM>({
    context,
    top,
    left,
}: ControlButtonItemProps<T>) {
    profiler.trace();

    const {
        cellSizeForSidePanel: cellSize,
        stateExtension: { isStickyMode },
    } = context;

    const handleToggleStickyMode = () =>
        context.onStateChange(({ stateExtension: { isStickyMode } }) => ({
            extension: { isStickyMode: !isStickyMode },
        }));

    useEventListener(window, "keydown", (ev) => {
        if (!settings.isOpened && ev.code === "KeyS") {
            handleToggleStickyMode();
            ev.preventDefault();
        }
    });

    return (
        <ControlButton
            left={left}
            top={top}
            cellSize={cellSize}
            checked={isStickyMode}
            onClick={handleToggleStickyMode}
            title={`${translate("Sticky mode")}: ${translate(isStickyMode ? "ON" : "OFF")} (${translate("click to toggle")}, ${translate("shortcut")}: S).\n${translate("Sticky digits will preserve the orientation when rotating the field")}.\n${translate("Sticky digits are highlighted in green")}.`}
        >
            <PushPin />
        </ControlButton>
    );
}) as <T extends AnyRotatablePTM>(props: ControlButtonItemProps<T>) => ReactElement;
