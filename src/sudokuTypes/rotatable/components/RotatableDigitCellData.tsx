import {CellDataProps, getDefaultCellDataColor} from "../../../components/sudoku/cell/CellDataProps";
import {RotatableDigit} from "../types/RotatableDigit";
import {CenteredCalculatorDigit, CenteredCalculatorDigitComponentType} from "../../../components/sudoku/digit/CalculatorDigit";
import {userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";

export const RotatableDigitCellData = (
    props: CellDataProps<RotatableDigit>
) => {
    const {data, size, isInitial, isValid, ...absoluteProps} = props;

    return <CenteredCalculatorDigit
        {...absoluteProps}
        digit={data.digit}
        size={size}
        color={getDefaultCellDataColor(props, data.sticky ? "#0c0" : userDigitColor)}
    />;
};

export const RotatableDigitCellDataComponentType: CellDataComponentType<RotatableDigit> = {
    component: RotatableDigitCellData,
    widthCoeff: CenteredCalculatorDigitComponentType.widthCoeff,
};
