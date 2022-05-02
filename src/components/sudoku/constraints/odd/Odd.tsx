import {lightGreyColor} from "../../../app/globals";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";

export const Odd = ({cells: [{left, top}]}: ConstraintProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.beforeSelection);

    return isLayer && <circle
        cx={left + 0.5}
        cy={top + 0.5}
        r={0.4}
        fill={lightGreyColor}
    />;
};

export const OddConstraint = <CellType,>(cellLiteral: PositionLiteral): Constraint<CellType> => {
    const cell = parsePositionLiteral(cellLiteral);

    return ({
        name: "odd",
        cells: [cell],
        component: Odd,
        isValidCell(cell, digits, {typeManager: {getDigitByCellData}}, state) {
            const digit = getDigitByCellData(digits[cell.top][cell.left]!, state);

            return digit % 2 === 1;
        },
    });
};
