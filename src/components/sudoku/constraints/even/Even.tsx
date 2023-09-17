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

const width = 0.8;

export const Even: ConstraintPropsGenericFcMap = {
    [FieldLayer.beforeSelection]: observer(function Even<T extends AnyPTM>({cells: [{left, top}]}: ConstraintProps<T>) {
        profiler.trace();

        return <rect
            x={left + 0.5 - width / 2}
            y={top + 0.5 - width / 2}
            width={width}
            height={width}
            fill={darkGreyColor}
            opacity={0.6}
        />;
    }),
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
