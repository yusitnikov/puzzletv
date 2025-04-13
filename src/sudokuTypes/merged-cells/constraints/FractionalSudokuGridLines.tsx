import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../types/sudoku/Constraint";
import { FieldLayer } from "../../../types/sudoku/FieldLayer";
import { observer } from "mobx-react-lite";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { profiler } from "../../../utils/profiler";
import { useTransformScale } from "../../../contexts/TransformContext";
import { textColor } from "../../../components/app/globals";
import { indexes } from "../../../utils/indexes";

const borderColor = textColor;

export const FractionalSudokuGridLines: ConstraintPropsGenericFcMap = {
    [FieldLayer.lines]: observer(function FieldLines<T extends AnyPTM>({
        context: {
            puzzle: {
                fieldSize: { columnsCount, rowsCount },
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
                        top % 2 === 0 && (
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
                        left % 2 === 0 && (
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
