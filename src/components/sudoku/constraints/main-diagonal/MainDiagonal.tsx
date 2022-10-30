import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {ConstraintProps, ConstraintPropsGenericFc} from "../../../../types/sudoku/Constraint";
import {getLineVector, PositionLiteral} from "../../../../types/layout/Position";
import {RenbanConstraint} from "../renban/Renban";

const diagonalColor = "#34bbe6";
const diagonalWidth = 0.03;

export const DiagonalComponent = withFieldLayer(FieldLayer.regular, <CellType,>({cells, color = diagonalColor, context: {cellSize}}: ConstraintProps<CellType>) => {
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
}) as ConstraintPropsGenericFc;

const BaseDiagonalConstraint = <CellType, ExType, ProcessedExType>(cellLiterals: PositionLiteral[]) => ({
    ...RenbanConstraint<CellType, ExType, ProcessedExType>(cellLiterals, false),
    name: "main diagonal",
    color: diagonalColor,
    width: diagonalWidth,
    component: DiagonalComponent,
});

export const PositiveDiagonalConstraint = <CellType, ExType, ProcessedExType>(fieldSize: number) => ({
    ...BaseDiagonalConstraint<CellType, ExType, ProcessedExType>([{top: fieldSize - 1, left: 0}, {top: 0, left: fieldSize - 1}]),
    name: "main positive diagonal",
});

export const NegativeDiagonalConstraint = <CellType, ExType, ProcessedExType>(fieldSize: number) => ({
    ...BaseDiagonalConstraint<CellType, ExType, ProcessedExType>([{top: 0, left: 0}, {top: fieldSize - 1, left: fieldSize - 1}]),
    name: "main negative diagonal",
});
