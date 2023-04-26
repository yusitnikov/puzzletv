import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {indexesFromTo} from "../../../utils/indexes";
import {lightGreyColor} from "../../../components/app/globals";
import {QuadMastersPTM} from "../types/QuadMastersPTM";

export const QuadsHint = {
    [FieldLayer.afterLines]: (
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
        }: ConstraintProps<QuadMastersPTM>
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
    </> : null,
};

export const QuadsHintConstraint: Constraint<QuadMastersPTM> = {
    name: "quads-hint",
    cells: [],
    component: QuadsHint,
    props: undefined,
};
