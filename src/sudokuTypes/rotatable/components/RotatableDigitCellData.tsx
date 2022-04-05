import {CellDataProps} from "../../../components/sudoku/cell/CellDataProps";
import {isStickyRotatableDigit, RotatableDigit} from "../types/RotatableDigit";
import {CalculatorDigit, CalculatorDigitComponentType} from "../../../components/sudoku/digit/CalculatorDigit";
import {userDigitColor} from "../../../components/app/globals";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {RotatableProcessedGameState} from "../types/RotatableGameState";

export const RotatableDigitCellData = (
    {data, size, state, isInitial, ...absoluteProps}: CellDataProps<RotatableDigit, RotatableProcessedGameState>
) => <CalculatorDigit
    {...absoluteProps}
    digit={data.digit}
    size={size}
    color={isInitial ? undefined : (data.sticky ? "#0c0" : userDigitColor)}
    angle={isStickyRotatableDigit(data) ? -(state?.animatedAngle || 0) : 0}
/>;

export const RotatableDigitCellDataComponentType: CellDataComponentType<RotatableDigit, RotatableProcessedGameState> = {
    component: RotatableDigitCellData,
    widthCoeff: CalculatorDigitComponentType.widthCoeff,
};
