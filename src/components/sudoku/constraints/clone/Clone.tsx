import {lightGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFcMap
} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

export const Clone: ConstraintPropsGenericFcMap = {
    [FieldLayer.beforeSelection]: observer(function Clone<T extends AnyPTM>({cells}: ConstraintProps<T>) {
        profiler.trace();

        return <>
            {cells.map(({top, left}, index) => <rect
                key={index}
                x={left}
                y={top}
                width={1}
                height={1}
                fill={lightGreyColor}
            />)}
        </>;
    }),
};

export const CloneConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[]): Constraint<T> => ({
    name: "clone",
    cells: parsePositionLiterals(cellLiterals),
    component: Clone,
    props: undefined,
    isObvious: true,
    isValidCell({top, left}, digits, cells, context) {
        const digit = digits[top][left]!;

        return cells
            .map((cell2) => digits[cell2.top]?.[cell2.left])
            .every((digit2) => digit2 === undefined || context.puzzle.typeManager.areSameCellData(digit, digit2, context));
    },
});
