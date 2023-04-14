import {CellDataProps, getDefaultCellDataColor} from "../../../components/sudoku/cell/CellDataProps";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {JigsawPTM} from "../types/JigsawPTM";

export const JigsawDigitCellData = (props: CellDataProps<JigsawPTM>) => {
    const {
        puzzle,
        data,
        size,
        isInitial,
        isValid,
        ...absoluteProps
    } = props;
    const {
        typeManager: {
            digitComponentType,
            cellDataDigitComponentType: {
                component: DigitComponent,
            } = digitComponentType,
        },
    } = puzzle;

    return <DigitComponent
        {...absoluteProps}
        {...data}
        puzzle={puzzle}
        size={size}
        color={getDefaultCellDataColor(props)}
    />;
};

export const JigsawDigitCellDataComponentType: CellDataComponentType<JigsawPTM> = {
    component: JigsawDigitCellData,
    // centermarks could be horizontal, so need to give space for them
    widthCoeff: 1.1,
};
