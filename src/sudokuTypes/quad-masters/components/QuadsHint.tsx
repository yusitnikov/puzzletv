import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {indexesFromTo} from "../../../utils/indexes";
import {lightGreyColor} from "../../../components/app/globals";
import {QuadMastersPTM} from "../types/QuadMastersPTM";
import {profiler} from "../../../utils/profiler";
import {observer} from "mobx-react-lite";

export const QuadsHint = {
    [FieldLayer.afterLines]: observer(function QuadsHint(
        {
            context: {
                puzzle: {
                    fieldSize: {
                        rowsCount,
                        columnsCount,
                    },
                },
                stateExtension: {isQuadTurn},
                isMyTurn,
            },
        }: ConstraintProps<QuadMastersPTM>
    ) {
        profiler.trace();

        if (!isMyTurn || !isQuadTurn) {
            return null;
        }

        return <>
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
        </>;
    }),
};

export const QuadsHintConstraint: Constraint<QuadMastersPTM> = {
    name: "quads-hint",
    cells: [],
    component: QuadsHint,
    props: undefined,
};
