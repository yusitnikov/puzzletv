import {darkGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {RegularCalculatorDigit} from "../../digit/CalculatorDigit";
import {mainDigitCoeff} from "../../cell/CellDigits";

interface FillableCalculatorDigitProps {
    digit: number;
}

export const FillableCalculatorDigit = withFieldLayer(FieldLayer.beforeSelection, <CellType,>(
    {cells: [{left, top}], props: {digit}}: ConstraintProps<CellType, FillableCalculatorDigitProps>
) => <RegularCalculatorDigit
    left={left + 0.5}
    top={top + 0.5}
    size={mainDigitCoeff}
    digit={digit}
    color={darkGreyColor}
/>) as ConstraintPropsGenericFc<FillableCalculatorDigitProps>;

const allowedFillableOptions: Record<number, number[]> = {
    1: [0, 3, 4, 7, 9],
    3: [9],
    4: [9],
    5: [6, 9],
    7: [0, 3, 9],
};

export const FillableCalculatorDigitConstraint = <CellType, ExType, ProcessedExType>(
    cellLiteral: PositionLiteral, digit: number
): Constraint<CellType, FillableCalculatorDigitProps, ExType, ProcessedExType> => {
    const cell = parsePositionLiteral(cellLiteral);

    return ({
        name: "fillable calculator digit",
        cells: [cell],
        component: FillableCalculatorDigit,
        props: {digit},
        isObvious: true,
        isValidCell(cell, digits, _, {puzzle: {typeManager: {getDigitByCellData}}, state}) {
            const actualDigit = getDigitByCellData(digits[cell.top][cell.left]!, state);

            return actualDigit === digit
                || actualDigit === 8
                || (digit in allowedFillableOptions && allowedFillableOptions[digit].includes(actualDigit));
        },
    });
};
