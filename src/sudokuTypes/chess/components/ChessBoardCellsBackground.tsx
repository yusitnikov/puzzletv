import {indexes} from "../../../utils/indexes";
import {lightGreyColor} from "../../../components/app/globals";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export interface ChessBoardCellsBackgroundProps {
    shifted?: boolean;
}

export const ChessBoardCellsBackground = {
    [FieldLayer.beforeBackground]: <T extends AnyPTM>({shifted}: ConstraintProps<T> & ChessBoardCellsBackgroundProps) => <>
        {indexes(8).flatMap(
            x => indexes(8).map(
                y => {
                    const isBlackSquare = (x + y) % 2;
                    const isLeft = x < 4;
                    const isTop = y < 4;
                    const isMainSquare = isLeft === isTop;

                    const color = isBlackSquare
                        ? shifted
                            ? isMainSquare
                                ? "#b85621"
                                : "#ac9120"
                            : lightGreyColor
                        : shifted
                            ? isMainSquare
                                ? "#edb79a"
                                : "#ebd992"
                            : undefined;

                    return color && <rect
                        key={`${x}-${y}`}
                        x={x + (shifted && !isTop ? 1 : 0)}
                        y={y + (shifted && isLeft ? 1 : 0)}
                        width={1}
                        height={1}
                        fill={color}
                    />;
                }
            )
        )}
    </>,
};

export const ChessBoardCellsBackgroundConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "chess board cells background",
    cells: [],
    component: ChessBoardCellsBackground,
    props: undefined,
});
