import {lightGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    parsePositionLiteral,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

const width = 0.8;

export const Even = {
    [FieldLayer.beforeSelection]: <T extends AnyPTM>({cells: [{left, top}]}: ConstraintProps<T>) => <rect
        x={left + 0.5 - width / 2}
        y={top + 0.5 - width / 2}
        width={width}
        height={width}
        fill={lightGreyColor}
    />,
};

export const EvenConstraint = <T extends AnyPTM>(cellLiteral: PositionLiteral): Constraint<T> => {
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
