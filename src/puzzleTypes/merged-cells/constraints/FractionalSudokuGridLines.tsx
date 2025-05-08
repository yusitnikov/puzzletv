import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../types/puzzle/Constraint";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { observer } from "mobx-react-lite";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { profiler } from "../../../utils/profiler";
import { useTransformScale } from "../../../contexts/TransformContext";
import { textColor } from "../../../components/app/globals";
import { indexes } from "../../../utils/indexes";

const borderColor = textColor;

export const FractionalSudokuGridLines: ConstraintPropsGenericFcMap = {
    [GridLayer.lines]: observer(function FieldLines<T extends AnyPTM>({
        context: {
            puzzle: {
                gridSize: { columnsCount, rowsCount },
                importOptions: { cellPieceWidth = 2, cellPieceHeight = 2 } = {},
            },
        },
    }: ConstraintProps<T>) {
        profiler.trace();

        const scale = useTransformScale();
        const borderWidth = 1 / scale;

        return (
            <>
                {indexes(rowsCount, true).map(
                    (top) =>
                        top % cellPieceHeight === 0 && (
                            <line
                                key={`horizontal-${top}`}
                                strokeWidth={borderWidth}
                                stroke={borderColor}
                                x1={0}
                                y1={top}
                                x2={columnsCount}
                                y2={top}
                            />
                        ),
                )}

                {indexes(columnsCount, true).map(
                    (left) =>
                        left % cellPieceWidth === 0 && (
                            <line
                                key={`vertical-${left}`}
                                strokeWidth={borderWidth}
                                stroke={borderColor}
                                x1={left}
                                y1={0}
                                x2={left}
                                y2={rowsCount}
                            />
                        ),
                )}
            </>
        );
    }),
};

export const FractionalSudokuGridLinesConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "fractional sudoku bold grid lines",
    cells: [],
    component: FractionalSudokuGridLines,
    props: undefined,
});
