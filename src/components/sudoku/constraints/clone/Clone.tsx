import {lightGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export const Clone = {
    [FieldLayer.beforeSelection]: <T extends AnyPTM>({cells}: ConstraintProps<T>) => <>
        {cells.map(({top, left}, index) => <rect
            key={index}
            x={left}
            y={top}
            width={1}
            height={1}
            fill={lightGreyColor}
        />)}
    </>,
};

export const CloneConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[]): Constraint<T> => ({
    name: "clone",
    cells: parsePositionLiterals(cellLiterals),
    component: Clone,
    props: undefined,
    isObvious: true,
    isValidCell({top, left}, digits, cells, {puzzle, state}) {
        const digit = digits[top][left]!;

        return cells
            .map((cell2) => digits[cell2.top]?.[cell2.left])
            .every((digit2) => digit2 === undefined || puzzle.typeManager.areSameCellData(digit, digit2, puzzle, state, true));
    },
});
