import {darkGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

export const Odd: ConstraintPropsGenericFcMap = {
    [FieldLayer.beforeSelection]: observer(function Odd<T extends AnyPTM>({cells: [{left, top}]}: ConstraintProps<T>) {
        profiler.trace();

        return <circle
            cx={left + 0.5}
            cy={top + 0.5}
            r={0.4}
            fill={darkGreyColor}
            opacity={0.6}
        />;
    }),
};

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
