import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {InfiniteRingsGameState, setInfiniteRingOffset} from "../types/InfiniteRingsGameState";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {PartiallyTranslatable} from "../../../types/translations/Translatable";

export const InfiniteRingZoomButton = (increment: number, title: PartiallyTranslatable, sign: string) =>
    function InfiniteRingZoomButtonComponent<CellType, ExType extends InfiniteRingsGameState, ProcessedExType>(
        {context, top, left}: ControlButtonItemProps<CellType, ExType, ProcessedExType>
    ) {
        const {
            state: {extension: {ringOffset}},
            cellSizeForSidePanel: cellSize,
        } = context;

        const translate = useTranslate();

        return <ControlButton
            top={top}
            left={left}
            cellSize={cellSize}
            onClick={() => setInfiniteRingOffset(context, ringOffset + increment)}
            title={`${translate(title)} (${sign})`}
        >
            {sign}
        </ControlButton>;
    }
;
