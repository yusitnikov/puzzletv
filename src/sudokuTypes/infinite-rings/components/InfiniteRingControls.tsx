import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {AnimationSpeedControlButton} from "../../../components/sudoku/controls/AnimationSpeedControlButton";
import {isFreeSpaceForControlButton} from "../../../components/sudoku/controls/DigitControlButton";
import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {InfiniteRingsGameState, setInfiniteRingOffset} from "../types/InfiniteRingsGameState";
import {useTranslate} from "../../../hooks/useTranslate";

export const InfiniteRingControls = <CellType, ExType extends InfiniteRingsGameState, ProcessedExType>(
    props: ControlsProps<CellType, ExType, ProcessedExType>
) => {
    const {context} = props;
    const {
        state: {extension: {ringOffset}},
        cellSizeForSidePanel: cellSize,
    } = context;

    const translate = useTranslate();

    if (!isFreeSpaceForControlButton(context, {top: 2, left: 0})) {
        return null;
    }

    return <div>
        <AnimationSpeedControlButton top={2} left={0} {...props}/>

        <ControlButton
            top={2}
            left={1}
            cellSize={cellSize}
            onClick={() => setInfiniteRingOffset(context, ringOffset + 1)}
            title={`${translate("zoom in")} (+)`}
        >
            +
        </ControlButton>

        <ControlButton
            top={2}
            left={2}
            cellSize={cellSize}
            onClick={() => setInfiniteRingOffset(context, ringOffset - 1)}
            title={`${translate("zoom out")} (-)`}
        >
            -
        </ControlButton>
    </div>;
};
