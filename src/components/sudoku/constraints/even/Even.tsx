import {lightGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    parsePositionLiteral,
    PositionLiteral
} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";

const width = 0.8;

export const Even = withFieldLayer(FieldLayer.beforeSelection, ({cells: [{left, top}]}: ConstraintProps) => <rect
    x={left + 0.5 - width / 2}
    y={top + 0.5 - width / 2}
    width={width}
    height={width}
    fill={lightGreyColor}
/>) as ConstraintPropsGenericFc;

export const EvenConstraint = <CellType, ExType, ProcessedExType>(cellLiteral: PositionLiteral): Constraint<CellType, undefined, ExType, ProcessedExType> => {
    const cell = parsePositionLiteral(cellLiteral);

    return {
        name: "even",
        cells: [cell],
        component: Even,
        renderSingleCellInUserArea: true,
        props: undefined,
        isObvious: true,
        isValidCell(cell, digits, _, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const digit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);

            return digit % 2 === 0;
        },
    };
};
