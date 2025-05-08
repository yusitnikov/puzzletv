import { currentPlayerColor, h2HeightCoeff, otherPlayerColor, textColor } from "../../app/globals";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { Fragment, ReactElement } from "react";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { Share } from "@emotion-icons/material";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

export interface MultiPlayerInfoProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
}

export const MultiPlayerInfo = observer(function MultiPlayerInfo<T extends AnyPTM>({
    context,
}: MultiPlayerInfoProps<T>) {
    profiler.trace();

    if (!context.multiPlayer.isEnabled) {
        return null;
    }

    const {
        puzzle: {
            params = {},
            typeManager: { getPlayerScore },
        },
        cellSizeForSidePanel: cellSize,
        multiPlayer: { allPlayerIds, playerNicknames },
        currentPlayer,
    } = context;

    return (
        <div style={{ fontSize: cellSize * h2HeightCoeff }}>
            {allPlayerIds.length > 1 &&
                allPlayerIds.map((playerId, index) => (
                    <Fragment key={playerId}>
                        {index > 0 && (params.share ? ", " : <strong> vs </strong>)}
                        <span
                            style={{ cursor: playerId === myClientId ? "pointer" : undefined }}
                            onClick={() => {
                                if (playerId === myClientId) {
                                    settings.toggle(true);
                                }
                            }}
                        >
                            <span style={{ fontWeight: playerId === currentPlayer || params.share ? 700 : 400 }}>
                                {playerNicknames[playerId]}
                            </span>
                            {playerId === myClientId && <>&nbsp;({translate("you")})</>}
                            {!params.share && (
                                <>
                                    &nbsp;
                                    <span
                                        style={{
                                            display: "inline-block",
                                            width: getPlayerScore ? undefined : "0.7em",
                                            height: getPlayerScore ? undefined : "0.7em",
                                            padding: getPlayerScore ? "0 0.25em" : 0,
                                            backgroundColor:
                                                playerId === myClientId ? currentPlayerColor : otherPlayerColor,
                                            border: `1px solid ${textColor}`,
                                        }}
                                        title={getPlayerScore ? translate("Score") : undefined}
                                    >
                                        {getPlayerScore?.(context, playerId)}
                                    </span>
                                </>
                            )}
                        </span>
                    </Fragment>
                ))}

            {allPlayerIds.length <= 1 && (
                <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={() => settings.toggle(true)}
                >
                    <span>{translate("Waiting for people to connect")}...</span>

                    <Share size={"1em"} style={{ marginLeft: "0.5em" }} />
                </div>
            )}
        </div>
    );
}) as <T extends AnyPTM>(props: MultiPlayerInfoProps<T>) => ReactElement;
