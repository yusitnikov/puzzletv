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
            const playerObject = playerObjects[getMainDigitDataHash({top, left})];

            return playerObject?.isValid && <circle
                key={`ownership-${top}-${left}`}
                cx={left + 0.5}
                cy={top + 0.5}
                r={0.35}
                fill={"none"}
                stroke={playerObject.clientId === myClientId ? currentPlayerColor : otherPlayerColor}
                strokeWidth={0.05}
                strokeOpacity={0.7}
            />;
        }))}
    </> : null
);

export const CellOwnershipConstraint: Constraint<any> = {
    name: "cell-ownership",
    cells: [],
    component: CellOwnership,
};
