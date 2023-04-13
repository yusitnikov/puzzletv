import {lightGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export const Clone = withFieldLayer(FieldLayer.beforeSelection, <T extends AnyPTM>({cells}: ConstraintProps<T>) => <>
    {cells.map(({top, left}, index) => <rect
        key={index}
        x={left}
        y={top}
        width={1}
        height={1}
        fill={lightGreyColor}
    />)}
</>) as ConstraintPropsGenericFc;

export const CloneConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[]): Constraint<T> => ({
    name: "clone",
    cells: parsePositionLiterals(cellLiterals),
    component: Clone,
    props: undefined,
    isObvious: true,
    isValidCell({top, left}, digits, cells, {puzzle: {typeManager: {areSameCellData}}, state}) {
        const digit = digits[top][left]!;

        return cells
            .map((cell2) => digits[cell2.top]?.[cell2.left])
            .every((digit2) => digit2 === undefined || areSameCellData(digit, digit2, state, true));
    },
});
