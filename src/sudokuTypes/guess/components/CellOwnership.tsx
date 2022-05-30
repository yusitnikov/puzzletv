import {withFieldLayer} from "../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {indexes} from "../../../utils/indexes";
import {currentPlayerColor, otherPlayerColor} from "../../../components/app/globals";
import {getMainDigitDataHash} from "../../../utils/playerDataHash";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";

export const CellOwnership = withFieldLayer(
    FieldLayer.beforeSelection,
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

            return playerObject?.isValid && <AutoSvg
                key={`ownership-${top}-${left}`}
                left={left}
                top={top}
            >
                <rect
                    x={0}
                    y={0}
                    width={1}
                    height={1}
                    fill={"white"}
                    fillOpacity={0.4}
                    stroke={"none"}
                    strokeWidth={0}
                />

                <circle
                    cx={0.5}
                    cy={0.5}
                    r={0.35}
                    fill={"none"}
                    stroke={playerObject.clientId === myClientId ? currentPlayerColor : otherPlayerColor}
                    strokeWidth={0.05}
                    strokeOpacity={0.7}
                />
            </AutoSvg>;
        }))}
    </> : null
);

export const CellOwnershipConstraint: Constraint<any> = {
    name: "cell-ownership",
    cells: [],
    component: CellOwnership,
};
