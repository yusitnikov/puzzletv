import { GridLayer } from "../../../types/puzzle/GridLayer";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../types/puzzle/Constraint";
import { indexes } from "../../../utils/indexes";
import { currentPlayerColor, otherPlayerColor } from "../../../components/app/globals";
import { getMainDigitDataHash } from "../../../utils/playerDataHash";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export const CellOwnership: ConstraintPropsGenericFcMap = {
    [GridLayer.beforeSelection]: observer(function CellOwnership<T extends AnyPTM>({
        context: {
            puzzle: {
                gridSize: { rowsCount, columnsCount },
            },
            playerObjects,
            multiPlayer: { isEnabled },
        },
    }: ConstraintProps<T>) {
        profiler.trace();

        if (!isEnabled) {
            return null;
        }

        return (
            <>
                {indexes(rowsCount).flatMap((top) =>
                    indexes(columnsCount).map((left) => {
                        const playerObject = playerObjects[getMainDigitDataHash({ top, left })];

                        return (
                            playerObject?.isValid && (
                                <AutoSvg key={`ownership-${top}-${left}`} left={left} top={top}>
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
                                        stroke={
                                            playerObject.clientId === myClientId ? currentPlayerColor : otherPlayerColor
                                        }
                                        strokeWidth={0.05}
                                        strokeOpacity={0.7}
                                    />
                                </AutoSvg>
                            )
                        );
                    }),
                )}
            </>
        );
    }),
};

export const CellOwnershipConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "cell-ownership",
    cells: [],
    component: CellOwnership,
    props: undefined,
});
