import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {setInfiniteRingOffset} from "../types/InfiniteRingsGameState";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {PartiallyTranslatable} from "../../../types/translations/Translatable";

export const InfiniteRingZoomButton = (increment: number, title: PartiallyTranslatable, sign: string) =>
    function InfiniteRingZoomButtonComponent<CellType, ExType, ProcessedExType>(
        {context, top, left}: ControlButtonItemProps<CellType, ExType, ProcessedExType>
    ) {
        const {
            state: {processed: {scaleLog: ringOffset}},
            onStateChange,
            cellSizeForSidePanel: cellSize,
        } = context;

        const translate = useTranslate();

        return <ControlButton
            top={top}
            left={left}
            cellSize={cellSize}
            onClick={() => onStateChange(setInfiniteRingOffset(context, ringOffset + increment))}
            title={`${translate(title)} (${sign})`}
        >
            {sign}
        </ControlButton>;
    }
;
