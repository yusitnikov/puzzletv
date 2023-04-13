import {lightGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export const Odd = withFieldLayer(FieldLayer.beforeSelection, <T extends AnyPTM>({cells: [{left, top}]}: ConstraintProps<T>) => <circle
    cx={left + 0.5}
    cy={top + 0.5}
    r={0.4}
    fill={lightGreyColor}
/>) as ConstraintPropsGenericFc;

export const OddConstraint = <T extends AnyPTM>(cellLiteral: PositionLiteral, visible = true): Constraint<T> => {
    const cell = parsePositionLiteral(cellLiteral);

    return {
        name: "odd",
        cells: [cell],
        component: visible ? Odd : undefined,
        renderSingleCellInUserArea: true,
        props: undefined,
        isObvious: true,
        isValidCell(cell, digits, _, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const digit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);

            return digit % 2 === 1;
        },
    };
};
