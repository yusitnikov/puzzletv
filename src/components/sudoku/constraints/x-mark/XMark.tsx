import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {blackColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";

const radius = 0.2;
const lineWidth = 0.02;

export const XMark = withFieldLayer(FieldLayer.top, ({cells: [cell1, cell2]}: ConstraintProps) => {
    const left = (cell1.left + cell2.left) / 2 + 0.5;
    const top = (cell1.top + cell2.top) / 2 + 0.5;

    return <>
        <line
            x1={left - radius * 0.7}
            y1={top - radius * 0.7}
            x2={left + radius * 0.7}
            y2={top + radius * 0.7}
            strokeWidth={lineWidth}
            stroke={blackColor}
        />

        <line
            x1={left + radius * 0.7}
            y1={top - radius * 0.7}
            x2={left - radius * 0.7}
            y2={top + radius * 0.7}
            strokeWidth={lineWidth}
            stroke={blackColor}
        />
    </>;
});

export const XMarkConstraint = <CellType,>(cellLiteral1: PositionLiteral, cellLiteral2: PositionLiteral): Constraint<CellType> => {
    const cell1 = parsePositionLiteral(cellLiteral1);
    const cell2 = parsePositionLiteral(cellLiteral2);

    return ({
        name: "X",
        cells: [cell1, cell2],
        component: XMark,
        isValidCell(cell, digits, [cell1, cell2], {puzzle: {typeManager: {getDigitByCellData}}, state}) {
            const digit1 = digits[cell1.top]?.[cell1.left];
            const digit2 = digits[cell2.top]?.[cell2.left];

            return digit1 === undefined || digit2 === undefined
                || getDigitByCellData(digit1, state) + getDigitByCellData(digit2, state) === 10;
        },
    });
};
