import {CellDataProps, getDefaultCellDataColor} from "../../../components/sudoku/cell/CellDataProps";
import {CenteredCalculatorDigit, CenteredCalculatorDigitComponentType} from "../../../components/sudoku/digit/CalculatorDigit";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {JigsawDigit} from "../types/JigsawDigit";

export const JigsawDigitCellData = (props: CellDataProps<JigsawDigit>) => {
    const {data, size, isInitial, isValid, ...absoluteProps} = props;

    return <CenteredCalculatorDigit
        {...absoluteProps}
        {...data}
        size={size}
        color={getDefaultCellDataColor(props)}
    />;
};

export const JigsawDigitCellDataComponentType: CellDataComponentType<JigsawDigit> = {
    component: JigsawDigitCellData,
    widthCoeff: CenteredCalculatorDigitComponentType.widthCoeff,
};
