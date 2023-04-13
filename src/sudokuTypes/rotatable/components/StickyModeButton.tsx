import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {useTranslate} from "../../../hooks/useTranslate";
import {PushPin} from "@emotion-icons/material";
import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {useEventListener} from "../../../hooks/useEventListener";
import {AnyRotatablePTM} from "../types/RotatablePTM";

export const StickyModeButton = <T extends AnyRotatablePTM>({context, top, left}: ControlButtonItemProps<T>) => {
    const {
        cellSizeForSidePanel: cellSize,
        state: {isShowingSettings, extension: {isStickyMode}},
        onStateChange,
    } = context;

    const translate = useTranslate();

    const handleToggleStickyMode = () => {
        onStateChange(({extension: {isStickyMode}}) => ({extension: {isStickyMode: !isStickyMode}}));
    };

    useEventListener(window, "keydown", (ev) => {
        if (!isShowingSettings && ev.code === "KeyS") {
            handleToggleStickyMode();
            ev.preventDefault();
        }
    });

    return <ControlButton
        left={left}
        top={top}
        cellSize={cellSize}
        checked={isStickyMode}
        onClick={handleToggleStickyMode}
        title={`${translate("Sticky mode")}: ${translate(isStickyMode ? "ON" : "OFF")} (${translate("click to toggle")}, ${translate("shortcut")}: S).\n${translate("Sticky digits will preserve the orientation when rotating the field")}.\n${translate("Sticky digits are highlighted in green")}.`}
    >
        <PushPin/>
    </ControlButton>;
};
