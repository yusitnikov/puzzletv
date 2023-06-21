import {indexes} from "../../../utils/indexes";
import {lightGreyColor, veryDarkGreyColor} from "../../../components/app/globals";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {useTransformScale} from "../../../contexts/TransformContext";

export const ChessBoardCellsBackground: ConstraintPropsGenericFcMap = {
    [FieldLayer.beforeBackground]: observer(function ChessBoardCellsBackground<T extends AnyPTM>(
        {context: {puzzle: {fieldSize: {fieldSize}}}}: ConstraintProps<T>
    ) {
        profiler.trace();

        const offset = fieldSize / 2 - 4;

        const scale = useTransformScale();

        return <>
            {indexes(8).flatMap(
                x => indexes(8).map(
                    y => {
                        const isBlackSquare = (x + y) % 2;
                        const color = isBlackSquare ? lightGreyColor : undefined;

                        return color && <rect
                            key={`${x}-${y}`}
                            x={x + offset}
                            y={y + offset}
                            width={1}
                            height={1}
                            fill={color}
                        />;
                    }
                )
            )}

            <rect
                x={offset}
                y={offset}
                width={8}
                height={8}
                fill={"none"}
                stroke={veryDarkGreyColor}
                strokeWidth={1 / scale}
            />
        </>;
    }),
};

export const ChessBoardCellsBackgroundConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "chess board cells background",
    cells: [],
    component: ChessBoardCellsBackground,
    props: undefined,
});
