import {PartiallyTranslatable} from "../../../types/translations/Translatable";
import {ControlButtonItem, ControlButtonItemProps, ControlButtonRegion} from "./ControlButtonsManager";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButton} from "./ControlButton";
import {defaultScaleStep, gameStateApplyFieldDragGesture} from "../../../types/sudoku/GameState";
import {emptyGestureMetrics} from "../../../utils/gestures";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

const ZoomButton = <T extends AnyPTM>(increment: boolean, title: PartiallyTranslatable, sign: string) =>
    function ZoomButtonComponent({context, top, left}: ControlButtonItemProps<T>) {
        const {
            puzzle: {typeManager: {scaleStep = defaultScaleStep}},
            cellSizeForSidePanel: cellSize,
        } = context;

        const translate = useTranslate();

        return <ControlButton
            top={top}
            left={left}
            cellSize={cellSize}
            onClick={() => gameStateApplyFieldDragGesture(
                context,
                emptyGestureMetrics,
                {...emptyGestureMetrics, scale: increment ? scaleStep : 1 / scaleStep},
                true,
                true,
            )}
            title={`${translate(title)} (${sign})`}
        >
            {sign}
        </ControlButton>;
    }
;

export const ZoomInButton = <T extends AnyPTM>() => ZoomButton<T>(true, "zoom in", "+");

export const ZoomOutButton = <T extends AnyPTM>() => ZoomButton<T>(false, "zoom out", "-");

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
