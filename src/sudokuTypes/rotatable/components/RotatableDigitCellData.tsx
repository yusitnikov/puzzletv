import {CellDataProps, getDefaultCellDataColor} from "../../../components/sudoku/cell/CellDataProps";
import {RotatableDigit} from "../types/RotatableDigit";
import {CalculatorDigit, CalculatorDigitComponentType} from "../../../components/sudoku/digit/CalculatorDigit";
import {userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {RotatableProcessedGameState} from "../types/RotatableGameState";

export const RotatableDigitCellData = (
    props: CellDataProps<RotatableDigit, RotatableProcessedGameState>
) => {
    const {data, size, state, isInitial, isValid = true, ...absoluteProps} = props;

    return <CalculatorDigit
        {...absoluteProps}
        digit={data.digit}
        size={size}
        color={getDefaultCellDataColor(props, data.sticky ? "#0c0" : userDigitColor)}
    />;
};

export const RotatableDigitCellDataComponentType: CellDataComponentType<RotatableDigit, RotatableProcessedGameState> = {
    component: RotatableDigitCellData,
    widthCoeff: CalculatorDigitComponentType.widthCoeff,
};
