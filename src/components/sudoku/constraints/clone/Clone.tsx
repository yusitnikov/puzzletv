import {lightGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFcMap
} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";
import {incrementArrayItem} from "../../../../utils/array";

export const Clone: ConstraintPropsGenericFcMap = {
    [FieldLayer.beforeSelection]: observer(function Clone<T extends AnyPTM>({cells, color = lightGreyColor}: ConstraintProps<T>) {
        profiler.trace();

        return <>
            {cells.map(({top, left}, index) => <rect
                key={index}
                x={left}
                y={top}
                width={1}
                height={1}
                fill={color}
            />)}
        </>;
    }),
};

export const CloneConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[], color?: string): Constraint<T> => ({
    name: "clone",
    cells: parsePositionLiterals(cellLiterals),
    component: Clone,
    color,
    props: undefined,
    isObvious: true,
    isValidCell(cell, digits, cells, context) {
        const digit = digits[cell.top][cell.left]!;

        const cell2 = incrementArrayItem(
            cells,
            position => isSamePosition(cell, position),
            cells.length / 2,
        );
        const digit2 = digits[cell2.top]?.[cell2.left];

        return digit2 === undefined || context.puzzle.typeManager.areSameCellData(digit, digit2, context, cell, cell2);
    },
});
