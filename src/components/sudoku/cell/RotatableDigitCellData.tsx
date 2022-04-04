import {CellDataProps} from "./CellDataProps";
import {isStickyRotatableDigit, RotatableDigit} from "../../../types/sudoku/RotatableDigit";
import {CalculatorDigit, CalculatorDigitComponentType} from "../digit/CalculatorDigit";
import {userDigitColor} from "../../app/globals";
import {CellDataComponentType} from "./CellDataComponentType";
import {RotatableProcessedGameState} from "../../../types/sudoku/RotatableGameState";

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
