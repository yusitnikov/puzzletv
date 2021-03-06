/** @jsxImportSource @emotion/react */
import {Absolute} from "../../layout/absolute/Absolute";
import {Rect} from "../../../types/layout/Rect";
import styled from "@emotion/styled";
import {
    blueColor,
    currentPlayerColor,
    greenColor,
    h1HeightCoeff,
    h2HeightCoeff,
    otherPlayerColor,
    rulesHeaderPaddingCoeff,
    rulesMarginCoeff,
    textColor,
    textHeightCoeff
} from "../../app/globals";
import {useTranslate} from "../../../hooks/useTranslate";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {Fragment} from "react";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {GameState} from "../../../types/sudoku/GameState";
import {Fullscreen, FullscreenExit, OpenInNew, Share} from "@emotion-icons/material";
import {ControlButton} from "../controls/ControlButton";
import {toggleFullScreen} from "../../../utils/fullScreen";
import {useIsFullScreen} from "../../../hooks/useIsFullScreen";

const StyledContainer = styled(Absolute)({
    display: "flex",
    flexDirection: "column",
});

export interface RulesProps<CellType> {
    context: PuzzleContext<CellType, any, any>;
    rect: Rect;
}

export const Rules = <CellType,>({rect, context}: RulesProps<CellType>) => {
    const translate = useTranslate();

    const isFullScreen = useIsFullScreen();

    const {
        puzzle: {params = {}, title, author, rules, aboveRules, typeManager: {getPlayerScore}, lmdLink},
        state: {currentPlayer},
        cellSize,
        multiPlayer: {isEnabled, allPlayerIds, playerNicknames},
    } = context;

    const isCompetitive = isEnabled && !params.share;

    return <StyledContainer {...rect} pointerEvents={true}>
        <div
            style={{
                padding: cellSize * rulesHeaderPaddingCoeff,
                textAlign: "center",
                marginBottom: cellSize * rulesMarginCoeff,
                backgroundColor: blueColor,
            }}
        >
            <h1 style={{
                position: "relative",
                fontSize: cellSize * h1HeightCoeff,
                margin: 0,
                padding: `0 ${cellSize * (h1HeightCoeff + rulesHeaderPaddingCoeff)}px`
            }}>
                {translate(title)}
            </h1>

            <div style={{
                position: "absolute",
                top: cellSize * rulesHeaderPaddingCoeff / 2,
                right: cellSize * rulesHeaderPaddingCoeff / 2,
                width: cellSize * (h1HeightCoeff + rulesHeaderPaddingCoeff),
                height: cellSize * (h1HeightCoeff + rulesHeaderPaddingCoeff),
            }}>
                <ControlButton
                    left={0}
                    top={0}
                    cellSize={cellSize * (h1HeightCoeff + rulesHeaderPaddingCoeff)}
                    onClick={toggleFullScreen}
                    fullSize={true}
                    title={translate(isFullScreen ? "Exit full screen mode" : "Enter full screen mode")}
                >
                    {isFullScreen ? <FullscreenExit/> : <Fullscreen/>}
                </ControlButton>
            </div>

            {(author || lmdLink) && <div style={{fontSize: cellSize * h2HeightCoeff}}>
                {author && <span>{translate("by")} {translate(author)}</span>}

                {lmdLink && <span>
                    {author && " ("}

                    {/*eslint-disable-next-line react/jsx-no-target-blank*/}
                    <a
                        href={lmdLink}
                        target={"_blank"}
                        onClick={() => context.onStateChange({openedLmdOnce: true} as Partial<GameState<CellType>>)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            color: "#00c",
                            textDecoration: "none",
                        }}
                    >
                        <span>{translate("open in LMD")}&nbsp;</span><OpenInNew size={"1em"}/>
                    </a>

                    {author && ")"}
                </span>}
            </div>}

            {isEnabled && <div style={{fontSize: cellSize * h2HeightCoeff}}>
                {allPlayerIds.length > 1 && allPlayerIds.map((playerId, index) => <Fragment key={playerId}>
                    {index > 0 && (params.share ? ", " : <strong> vs </strong>)}
                    <span
                        style={{cursor: playerId === myClientId ? "pointer" : undefined}}
                        onClick={() => {
                            if (playerId === myClientId) {
                                context.onStateChange({isShowingSettings: true} as Partial<GameState<CellType>>);
                            }
                        }}
                    >
                        <span style={{fontWeight: playerId === currentPlayer || params.share ? 700 : 400}}>{playerNicknames[playerId]}</span>
                        {playerId === myClientId && <>&nbsp;({translate("you")})</>}
                        {!params.share && <>
                            &nbsp;
                            <span
                                style={{
                                    display: "inline-block",
                                    width: getPlayerScore ? undefined : "0.7em",
                                    height: getPlayerScore ? undefined : "0.7em",
                                    padding: getPlayerScore ? "0 0.25em" : 0,
                                    backgroundColor: playerId === myClientId ? currentPlayerColor : otherPlayerColor,
                                    border: `1px solid ${textColor}`,
                                }}
                                title={getPlayerScore ? translate("Score") : undefined}
                            >
                                {getPlayerScore?.(context, playerId)}
                            </span>
                        </>}
                    </span>
                </Fragment>)}

                {allPlayerIds.length <= 1 && <div
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                    onClick={() => context.onStateChange({isShowingSettings: true} as Partial<GameState<CellType>>)}
                >
                    <span>{translate("Waiting for people to connect")}...</span>

                    <Share size={"1em"} style={{marginLeft: "0.5em"}}/>
                </div>}
            </div>}

            {!isCompetitive && getPlayerScore && <div style={{fontSize: cellSize * h2HeightCoeff}}>
                {translate("Score")}: {getPlayerScore(context, myClientId)}
            </div>}
        </div>

        {aboveRules?.(translate, context)}

        <div
            style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: 0,
                minHeight: 0,
                overflow: "auto",
                backgroundColor: greenColor,
            }}
        >
            <div
                style={{
                    padding: cellSize * rulesHeaderPaddingCoeff,
                    fontSize: cellSize * textHeightCoeff,
                }}
            >
                {rules?.(translate, context)}
            </div>
        </div>
    </StyledContainer>;
};
