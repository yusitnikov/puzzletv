import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {indexes} from "../../../utils/indexes";
import {currentPlayerColor, otherPlayerColor} from "../../../components/app/globals";
import {getMainDigitDataHash} from "../../../utils/playerDataHash";
import {myClientId} from "../../../hooks/useMultiPlayer";

export const CellOwnership = withFieldLayer(
    FieldLayer.regular,
    (
        {
            context: {
                puzzle: {
                    fieldSize: {
                        rowsCount,
                        columnsCount,
                    },
                },
                state: {playerObjects},
                multiPlayer: {isEnabled},
            },
        }: ConstraintProps
    ) => isEnabled ? <>
        {indexes(rowsCount).flatMap(top => indexes(columnsCount).map(left => {
            const ownerId = playerObjects[getMainDigitDataHash({top, left})];

            return ownerId && <circle
                key={`ownership-${top}-${left}`}
                cx={left + 0.5}
                cy={top + 0.5}
                r={0.35}
                fill={ownerId === myClientId ? currentPlayerColor : otherPlayerColor}
                fillOpacity={0.7}
                stroke={"none"}
                strokeWidth={0}
            />;
        }))}
    </> : null
);

export const CellOwnershipConstraint: Constraint<any> = {
    name: "cell-ownership",
    cells: [],
    component: CellOwnership,
};
