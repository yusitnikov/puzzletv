import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {getLineVector, PositionLiteral} from "../../../../types/layout/Position";
import {RenbanConstraint} from "../renban/Renban";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {LineProps} from "../line/Line";

const diagonalColor = "#34bbe6";
const diagonalWidth = 0.03;

export const DiagonalComponent = {
    [FieldLayer.regular]: <T extends AnyPTM>(
        {cells, color = diagonalColor, context: {cellSize}}: ConstraintProps<T, LineProps>
    ) => {
        cells = cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

        const [first, second] = cells;
        const last = cells[cells.length - 1];
        const direction = getLineVector({start: first, end: second});

        return <line
            x1={first.left - direction.left / 2}
            y1={first.top - direction.top / 2}
            x2={last.left + direction.left / 2}
            y2={last.top + direction.top / 2}
            strokeWidth={3 / cellSize}
            stroke={color}
        />;
    },
};

const BaseDiagonalConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[]): Constraint<T, LineProps> => ({
    ...RenbanConstraint<T>(cellLiterals, false),
    name: "main diagonal",
    color: diagonalColor,
    props: {width: diagonalWidth},
    component: DiagonalComponent,
});

export const PositiveDiagonalConstraint = <T extends AnyPTM>(fieldSize: number): Constraint<T, LineProps> => ({
    ...BaseDiagonalConstraint<T>([{top: fieldSize - 1, left: 0}, {top: 0, left: fieldSize - 1}]),
    name: "main positive diagonal",
});

export const NegativeDiagonalConstraint = <T extends AnyPTM>(fieldSize: number): Constraint<T, LineProps> => ({
    ...BaseDiagonalConstraint<T>([{top: 0, left: 0}, {top: fieldSize - 1, left: fieldSize - 1}]),
    name: "main negative diagonal",
});
