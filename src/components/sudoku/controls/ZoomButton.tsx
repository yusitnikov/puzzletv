import {PartiallyTranslatable} from "../../../types/translations/Translatable";
import {ControlButtonItem, ControlButtonItemProps, ControlButtonRegion} from "./ControlButtonsManager";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButton} from "./ControlButton";
import {defaultScaleStep, gameStateApplyFieldDragGesture} from "../../../types/sudoku/GameState";
import {emptyGestureMetrics} from "../../../utils/gestures";

const ZoomButton = <CellType, ExType, ProcessedExType>(increment: boolean, title: PartiallyTranslatable, sign: string) =>
    function ZoomButtonComponent(
        {context, top, left}: ControlButtonItemProps<CellType, ExType, ProcessedExType>
    ) {
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

export const ZoomInButton = <CellType, ExType, ProcessedExType>() =>
    ZoomButton<CellType, ExType, ProcessedExType>(true, "zoom in", "+");

export const ZoomOutButton = <CellType, ExType, ProcessedExType>() =>
    ZoomButton<CellType, ExType, ProcessedExType>(false, "zoom out", "-");

export const ZoomInButtonItem = <CellType, ExType, ProcessedExType>(): ControlButtonItem<CellType, ExType, ProcessedExType> => ({
    key: "zoom-in",
    region: ControlButtonRegion.additional,
    Component: ZoomInButton(),
});

export const ZoomOutButtonItem = <CellType, ExType, ProcessedExType>(): ControlButtonItem<CellType, ExType, ProcessedExType> => ({
    key: "zoom-out",
    region: ControlButtonRegion.additional,
    Component: ZoomOutButton(),
});
