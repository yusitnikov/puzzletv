import {darkGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    parsePositionLiteral,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";
import {parseColorWithOpacity, rgba} from "../../../../utils/color";

export interface EvenProps {
    size?: number;
}

export const Even: ConstraintPropsGenericFcMap<EvenProps> = {
    [FieldLayer.beforeSelection]: observer(function Even<T extends AnyPTM>({cells: [{left, top}], color = rgba(darkGreyColor, 0.6), props: {size = 0.8}}: ConstraintProps<T, EvenProps>) {
        profiler.trace();

        const {rgb, a} = parseColorWithOpacity(color);

        return <rect
            x={left + 0.5 - size / 2}
            y={top + 0.5 - size / 2}
            width={size}
            height={size}
            fill={rgb}
            opacity={a}
        />;
    }),
};

export const EvenConstraint = <T extends AnyPTM>(cellLiteral: PositionLiteral, color?: string, size?: number): Constraint<T, EvenProps> => {
    const cell = parsePositionLiteral(cellLiteral);

    return {
        name: "even",
        cells: [cell],
        component: Even,
        renderSingleCellInUserArea: true,
        props: {size},
        color,
        isObvious: true,
        isValidCell(cell, digits, _, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const digit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);

            return digit % 2 === 0;
        },
    };
};
