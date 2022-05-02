import {lightGreyColor} from "../../../app/globals";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    parsePositionLiteral,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";

const width = 0.8;

export const Even = ({cells: [{left, top}]}: ConstraintProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.beforeSelection);

    return isLayer && <rect
        x={left + 0.5 - width / 2}
        y={top + 0.5 - width / 2}
        width={width}
        height={width}
        fill={lightGreyColor}
    />;
};

export const EvenConstraint = <CellType,>(cellLiteral: PositionLiteral): Constraint<CellType> => {
    const cell = parsePositionLiteral(cellLiteral);

    return ({
        name: "even",
        cells: [cell],
        component: Even,
        isValidCell(cell, digits, {typeManager: {getDigitByCellData}}, state) {
            const digit = getDigitByCellData(digits[cell.top][cell.left]!, state);

            return digit % 2 === 0;
        },
    });
};
