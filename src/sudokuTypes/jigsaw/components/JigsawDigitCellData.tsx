import { CellDataProps, getDefaultCellDataColor } from "../../../components/sudoku/cell/CellDataProps";
import { CellDataComponentType } from "../../../components/sudoku/cell/CellDataComponentType";
import { JigsawPTM } from "../types/JigsawPTM";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";

export const JigsawDigitCellData = observer(function JigsawDigitCellDataFc(props: CellDataProps<JigsawPTM>) {
    profiler.trace();

    const { puzzle, data, size, isInitial, isValid, angle = 0, ...absoluteProps } = props;
    const {
        typeManager: {
            digitComponentType,
            cellDataDigitComponentType: { component: DigitComponent } = digitComponentType,
        },
    } = puzzle;

    return (
        <DigitComponent
            {...absoluteProps}
            digit={data.digit}
            angle={data.angle + angle}
            puzzle={puzzle}
            size={size}
            color={getDefaultCellDataColor(props)}
        />
    );
});

export const JigsawDigitCellDataComponentType = (supportRotation90: boolean): CellDataComponentType<JigsawPTM> => ({
    component: JigsawDigitCellData,
    // centermarks could be horizontal, so need to give space for them
    widthCoeff: supportRotation90 ? 1.1 : undefined,
});
