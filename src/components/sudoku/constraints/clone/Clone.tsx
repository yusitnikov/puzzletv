import {lightGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";

export const Clone = withFieldLayer(FieldLayer.beforeSelection, ({cells}: ConstraintProps) => <>
    {cells.map(({top, left}, index) => <rect
        key={index}
        x={left}
        y={top}
        width={1}
        height={1}
        fill={lightGreyColor}
    />)}
</>);

export const CloneConstraint = <CellType,>(cellLiterals: PositionLiteral[]): Constraint<CellType> => ({
        name: "clone",
        cells: parsePositionLiterals(cellLiterals),
        component: Clone,
        isValidCell({top, left}, digits, cells, {puzzle: {typeManager: {areSameCellData}}, state}) {
            const digit = digits[top][left]!;

            return cells
                .map((cell2) => digits[cell2.top]?.[cell2.left])
                .every((digit2) => digit2 === undefined || areSameCellData(digit, digit2, state, true));
        },
    });
