import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {indexesFromTo} from "../../../utils/indexes";
import {lightGreyColor} from "../../../components/app/globals";
import {QuadMastersGameState} from "../types/QuadMastersGameState";

export const QuadsHint = withFieldLayer(
    FieldLayer.top,
    (
        {
            context: {
                puzzle: {
                    fieldSize: {
                        rowsCount,
                        columnsCount,
                    },
                },
                state: {processed: {isMyTurn}, extension: {isQuadTurn}},
            },
        }: ConstraintProps<number, undefined, QuadMastersGameState, {}>
    ) => isMyTurn && isQuadTurn ? <>
        {indexesFromTo(1, rowsCount).flatMap(y => indexesFromTo(1, columnsCount).map(x => <circle
            key={`circle-${y}-${x}`}
            cx={x}
            cy={y}
            r={0.3}
            fill={lightGreyColor}
            fillOpacity={0.3}
            stroke={"none"}
            strokeWidth={0}
        />))}
    </> : null
);

export const QuadsHintConstraint: Constraint<number, undefined, QuadMastersGameState, {}> = {
    name: "quads-hint",
    cells: [],
    component: QuadsHint,
    props: undefined,
};
