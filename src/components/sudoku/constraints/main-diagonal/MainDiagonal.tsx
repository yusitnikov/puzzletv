import { FieldLayer } from "../../../../types/sudoku/FieldLayer";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../../types/sudoku/Constraint";
import { getLineVector, normalizeVector, PositionLiteral, scaleVector } from "../../../../types/layout/Position";
import { RenbanConstraint } from "../renban/Renban";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { LineProps } from "../line/Line";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";

const diagonalColor = "#34bbe6";

export const DiagonalComponent: ConstraintPropsGenericFcMap<LineProps> = {
    [FieldLayer.regular]: observer(function Diagonal<T extends AnyPTM>({
        cells,
        color = diagonalColor,
        context: { cellSize },
        props: { width = 3 / cellSize },
    }: ConstraintProps<T, LineProps>) {
        profiler.trace();

        width = Math.max(width, 1 / cellSize);

        cells = cells.map(({ left, top }) => ({ left: left + 0.5, top: top + 0.5 }));

        const [first, second] = cells;
        const last = cells[cells.length - 1];
        const direction = getLineVector({ start: first, end: second });
        const widthOffset = scaleVector(normalizeVector(direction), width);

        const x1 = first.left - direction.left / 2;
        const y1 = first.top - direction.top / 2;
        const x2 = last.left + direction.left / 2;
        const y2 = last.top + direction.top / 2;

        return (
            <path
                d={[
                    "M",
                    x1,
                    y1 + widthOffset.top,
                    "v",
                    -widthOffset.top,
                    "h",
                    widthOffset.left,
                    "L",
                    x2,
                    y2 - widthOffset.top,
                    "v",
                    widthOffset.top,
                    "h",
                    -widthOffset.left,
                    "z",
                ].join(" ")}
                fill={color}
                strokeWidth={0}
                stroke={"none"}
            />
        );
    }),
};

const BaseDiagonalConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    color?: string,
    width?: number,
): Constraint<T, LineProps> => ({
    ...RenbanConstraint<T>(cellLiterals),
    name: "main diagonal",
    color,
    props: { width },
    component: DiagonalComponent,
});

export const PositiveDiagonalConstraint = <T extends AnyPTM>(
    fieldSize: number,
    color?: string,
    width?: number,
): Constraint<T, LineProps> => ({
    ...BaseDiagonalConstraint<T>(
        [
            { top: fieldSize - 1, left: 0 },
            { top: 0, left: fieldSize - 1 },
        ],
        color,
        width,
    ),
    name: "main positive diagonal",
});

export const NegativeDiagonalConstraint = <T extends AnyPTM>(
    fieldSize: number,
    color?: string,
    width?: number,
): Constraint<T, LineProps> => ({
    ...BaseDiagonalConstraint<T>(
        [
            { top: 0, left: 0 },
            { top: fieldSize - 1, left: fieldSize - 1 },
        ],
        color,
        width,
    ),
    name: "main negative diagonal",
});
