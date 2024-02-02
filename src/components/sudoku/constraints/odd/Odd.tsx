import {darkGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";
import {parseColorWithOpacity, rgba} from "../../../../utils/color";

export interface OddProps {
    size?: number;
}

export const Odd: ConstraintPropsGenericFcMap<OddProps> = {
    [FieldLayer.beforeSelection]: observer(function Odd<T extends AnyPTM>({cells: [{left, top}], color = rgba(darkGreyColor, 0.6), props: {size = 0.8}}: ConstraintProps<T, OddProps>) {
        profiler.trace();

        const {rgb, a} = parseColorWithOpacity(color);

        return <circle
            cx={left + 0.5}
            cy={top + 0.5}
            r={size / 2}
            fill={rgb}
            opacity={a}
        />;
    }),
};

export const OddConstraint = <T extends AnyPTM>(cellLiteral: PositionLiteral, color?: string, size?: number): Constraint<T, OddProps> => {
    const cell = parsePositionLiteral(cellLiteral);

    return {
        name: "odd",
        cells: [cell],
        component: Odd,
        renderSingleCellInUserArea: true,
        props: {size},
        color,
        isObvious: true,
        isValidCell(cell, digits, _, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const digit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);

            return digit % 2 === 1;
        },
    };
};
