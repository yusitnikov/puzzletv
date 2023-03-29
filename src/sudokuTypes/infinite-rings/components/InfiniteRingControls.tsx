import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {AnimationSpeedControlButton} from "../../../components/sudoku/controls/AnimationSpeedControlButton";
import {AnimationSpeed} from "../../../types/sudoku/AnimationSpeed";
import {isFreeSpaceForControlButton} from "../../../components/sudoku/controls/DigitControlButton";
import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {InfiniteRingsGameState} from "../types/InfiniteRingsGameState";
import {useTranslate} from "../../../hooks/useTranslate";

export const InfiniteRingControls = <CellType, ExType extends InfiniteRingsGameState & { animationSpeed: AnimationSpeed }, ProcessedExType>(
    props: ControlsProps<CellType, ExType, ProcessedExType>
) => {
    const {context} = props;
    const {
        state: {extension: {ringOffset}, selectedCells},
        onStateChange,
        cellSizeForSidePanel: cellSize,
    } = context;

    const translate = useTranslate();

    if (!isFreeSpaceForControlButton(context, {top: 2, left: 0})) {
        return null;
    }

    const setRingOffset = (ringOffset: number) => onStateChange({
        extension: {ringOffset} as Partial<ExType>,
        selectedCells: selectedCells.clear(),
    });

    return <div>
        <AnimationSpeedControlButton top={2} left={0} {...props}/>

        <ControlButton
            top={2}
            left={1}
            cellSize={cellSize}
            onClick={() => setRingOffset(ringOffset + 1)}
            title={`${translate("zoom in")} (+)`}
        >
            +
        </ControlButton>

        <ControlButton
            top={2}
            left={2}
            cellSize={cellSize}
            onClick={() => setRingOffset(ringOffset - 1)}
            title={`${translate("zoom out")} (-)`}
        >
            -
        </ControlButton>
    </div>;
};
