import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {indexes} from "../../../utils/indexes";
import {lightGreyColor} from "../../../components/app/globals";

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
                state: {isMyTurn, isQuadTurn},
            },
        }: ConstraintProps
    ) => isMyTurn && isQuadTurn && <>
        {indexes(rowsCount, true).flatMap(y => indexes(columnsCount, true).map(x => <circle
            key={`circle-${y}-${x}`}
            cx={x}
            cy={y}
            r={0.3}
            fill={lightGreyColor}
            fillOpacity={0.3}
            stroke={"none"}
            strokeWidth={0}
        />))}
    </>
);

export const QuadsHintConstraint: Constraint<any> = {
    name: "quads-hint",
    cells: [],
    component: QuadsHint,
};
