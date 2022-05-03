import {blackColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";

export interface KropkiDotProps {
    isFilled?: boolean;
}

export const KropkiDot = withFieldLayer(FieldLayer.top, ({cells: [cell1, cell2], isFilled}: ConstraintProps<any, KropkiDotProps>) => <circle
    cx={(cell1.left + cell2.left) / 2 + 0.5}
    cy={(cell1.top + cell2.top) / 2 + 0.5}
    r={0.2}
    strokeWidth={0.02}
    stroke={blackColor}
    fill={isFilled ? blackColor : "white"}
/>);

export const KropkiDotConstraint = <CellType,>(
    cellLiteral1: PositionLiteral,
    cellLiteral2: PositionLiteral,
    isFilled: boolean
): Constraint<CellType, KropkiDotProps> => {
    const cell1 = parsePositionLiteral(cellLiteral1);
    const cell2 = parsePositionLiteral(cellLiteral2);

    return ({
        name: `${isFilled ? "black" : "white"} kropki dot`,
        cells: [cell1, cell2],
        isFilled,
        component: KropkiDot,
        isValidCell(cell, digits, {typeManager: {getDigitByCellData}}, state) {
            const data1 = digits[cell1.top]?.[cell1.left];
            const data2 = digits[cell2.top]?.[cell2.left];

            if (data1 === undefined || data2 === undefined) {
                return true;
            }

            const digit1 = getDigitByCellData(data1, state);
            const digit2 = getDigitByCellData(data2, state);

            return isFilled
                ? (digit1 === digit2 * 2 || digit2 === digit1 * 2)
                : Math.abs(digit1 - digit2) === 1;
        },
    });
};
