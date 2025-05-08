import { indexes } from "../../../utils/indexes";
import { lightGreyColor } from "../../../components/app/globals";
import { GridLayer } from "../../../types/sudoku/GridLayer";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../types/sudoku/Constraint";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export const ChessBoardCellsBackground: ConstraintPropsGenericFcMap = {
    [GridLayer.beforeBackground]: observer(function ChessBoardCellsBackground<T extends AnyPTM>({
        context: {
            puzzle: {
                gridSize: { gridSize },
            },
        },
    }: ConstraintProps<T>) {
        profiler.trace();

        const offset = gridSize / 2 - 4;

        return (
            <>
                {indexes(8).flatMap((x) =>
                    indexes(8).map((y) => {
                        const isBlackSquare = (x + y) % 2;
                        const color = isBlackSquare ? lightGreyColor : undefined;

                        return (
                            color && (
                                <rect
                                    key={`${x}-${y}`}
                                    x={x + offset}
                                    y={y + offset}
                                    width={1}
                                    height={1}
                                    fill={color}
                                />
                            )
                        );
                    }),
                )}
            </>
        );
    }),
};

export const ChessBoardCellsBackgroundConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "chess board cells background",
    cells: [],
    component: ChessBoardCellsBackground,
    props: undefined,
});
