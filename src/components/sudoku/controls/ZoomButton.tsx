import {PartiallyTranslatable} from "../../../types/translations/Translatable";
import {ControlButtonItem, ControlButtonItemProps, ControlButtonRegion} from "./ControlButtonsManager";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButton} from "./ControlButton";
import {gameStateHandleZoomClick} from "../../../types/sudoku/GameState";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {useEventListener} from "../../../hooks/useEventListener";
import {settings} from "../../../types/layout/Settings";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

const ZoomButton = <T extends AnyPTM>(increment: boolean, title: PartiallyTranslatable, hotkeys: string[], sign: string) =>
    observer(function ZoomButtonComponent({context, top, left}: ControlButtonItemProps<T>) {
        profiler.trace();

        const {cellSizeForSidePanel: cellSize} = context;

        const translate = useTranslate();

        const handleAction = () => gameStateHandleZoomClick(context, increment);

        useEventListener(window, "keydown", (ev) => {
            if (!settings.isOpened && hotkeys.includes((ev.shiftKey ? "Shift+" : "") + ev.code)) {
                handleAction();
                ev.preventDefault();
            }
        });

        return <ControlButton
            top={top}
            left={left}
            cellSize={cellSize}
            onClick={handleAction}
            title={`${translate(title)} (${sign})`}
        >
            {sign}
        </ControlButton>;
    });

export const ZoomInButton = <T extends AnyPTM>() => ZoomButton<T>(true, "zoom in", ["NumpadAdd", "Shift+Equal"], "+");

export const ZoomOutButton = <T extends AnyPTM>() => ZoomButton<T>(false, "zoom out", ["Minus", "NumpadSubtract"], "-");

export const ZoomInButtonItem = <T extends AnyPTM>(): ControlButtonItem<T> => ({
    key: "zoom-in",
    region: ControlButtonRegion.additional,
    Component: ZoomInButton(),
});

export const ZoomOutButtonItem = <T extends AnyPTM>(): ControlButtonItem<T> => ({
    key: "zoom-out",
    region: ControlButtonRegion.additional,
    Component: ZoomOutButton(),
});
