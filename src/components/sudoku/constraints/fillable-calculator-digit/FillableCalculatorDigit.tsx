import {darkGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {RegularCalculatorDigit} from "../../digit/CalculatorDigit";
import {mainDigitCoeff} from "../../cell/CellDigits";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

interface FillableCalculatorDigitProps {
    digit: number;
}

export const FillableCalculatorDigit = {
    [FieldLayer.beforeSelection]: <T extends AnyPTM>(
        {context: {puzzle}, cells: [{left, top}], props: {digit}}: ConstraintProps<T, FillableCalculatorDigitProps>
    ) => <RegularCalculatorDigit
        puzzle={puzzle}
        left={left + 0.5}
        top={top + 0.5}
        size={mainDigitCoeff}
        digit={digit}
        color={darkGreyColor}
    />,
};

const allowedFillableOptions: Record<number, number[]> = {
    1: [0, 3, 4, 7, 9],
    3: [9],
    4: [9],
    5: [6, 9],
    7: [0, 3, 9],
};

export const FillableCalculatorDigitConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral, digit: number
): Constraint<T, FillableCalculatorDigitProps> => {
    const cell = parsePositionLiteral(cellLiteral);

    return ({
        name: "fillable calculator digit",
        cells: [cell],
        component: FillableCalculatorDigit,
        renderSingleCellInUserArea: true,
        props: {digit},
        isObvious: true,
        isValidCell(cell, digits, _, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const actualDigit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);

            return actualDigit === digit
                || actualDigit === 8
                || (digit in allowedFillableOptions && allowedFillableOptions[digit].includes(actualDigit));
        },
    });
};
