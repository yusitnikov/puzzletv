import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../types/sudoku/Constraint";
import {darkGreyColor, textColor} from "../../../components/app/globals";
import {formatSvgPointsArray} from "../../../types/layout/Position";
import {parseMonumentValleyFieldSize} from "../types/MonumentValleyTypeManager";
import {RotatableGameState} from "../../rotatable/types/RotatableGameState";

export const MonumentValleyGridBorders = withFieldLayer(FieldLayer.lines, (
    {
        context: {
            puzzle: {fieldSize},
            state: {processed: {isMyTurn}},
        }
    }: ConstraintProps
) => {
    const {gridSize, intersectionSize, columnsCount, rowsCount} = parseMonumentValleyFieldSize(fieldSize);

    return <polygon
        points={formatSvgPointsArray([
            {
                left: gridSize + 0.001,
                top: rowsCount - gridSize,
            },
            {
                left: columnsCount / 2,
                top: rowsCount - gridSize - (gridSize - intersectionSize * 2) * Math.sqrt(0.75),
            },
            {
                left: columnsCount - gridSize - 0.001,
                top: rowsCount - gridSize,
            },
        ])}
        fill={isMyTurn ? textColor : darkGreyColor}
        strokeWidth={0}
    />;
}) as ConstraintPropsGenericFc;

export const MonumentValleyGridBordersConstraint = (): Constraint<number, undefined, RotatableGameState> => {
    return {
        name: "grid borders",
        cells: [],
        component: MonumentValleyGridBorders,
        props: undefined,
    };
};
