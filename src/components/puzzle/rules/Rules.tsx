/** @jsxImportSource @emotion/react */
import { Absolute } from "../../layout/absolute/Absolute";
import { Rect } from "../../../types/layout/Rect";
import styled from "@emotion/styled";
import {
    aboveRulesTextHeightCoeff,
    blueColor,
    darkGreyColor,
    greenColor,
    h1HeightCoeff,
    h2HeightCoeff,
    rulesHeaderPaddingCoeff,
    rulesMarginCoeff,
    textHeightCoeff,
} from "../../app/globals";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { ReactElement } from "react";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { Fullscreen, FullscreenExit, OpenInNew } from "@emotion-icons/material";
import { ControlButton } from "../controls/ControlButton";
import { toggleFullScreen } from "../../../utils/fullScreen";
import { useIsFullScreen } from "../../../hooks/useIsFullScreen";
import { indexes } from "../../../utils/indexes";
import { Heart } from "@emotion-icons/fluentui-system-filled";
import { Button } from "../../layout/button/Button";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { MultiPlayerInfo } from "./MultiPlayerInfo";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";

const liveHeartCoeff = 0.3;
const liveHeartMarginCoeff = 0.1;

const StyledContainer = styled(Absolute)({
    display: "flex",
    flexDirection: "column",
});

export interface RulesProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    rect: Rect;
}

export const Rules = observer(function Rules<T extends AnyPTM>({ rect, context }: RulesProps<T>) {
    profiler.trace();

    const isFullScreen = useIsFullScreen();
    const windowSize = useWindowSize();
    const isPortrait = windowSize.width < windowSize.height;

    const {
        puzzle: {
            params = {},
            title,
            author,
            rules,
            aboveRules: puzzleAboveRules,
            typeManager: { getPlayerScore, getAboveRules: typeAboveRules },
            lmdLink,
            initialLives = 0,
        },
        lives,
        fogDemoGridStateHistory,
        fogProps,
        disableFogDemo,
        cellSizeForSidePanel: cellSize,
        multiPlayer: { isEnabled },
    } = context;

    const isCompetitive = isEnabled && !params.share;

    return (
        <StyledContainer {...rect} pointerEvents={true}>
            <div
                style={{
                    padding: cellSize * rulesHeaderPaddingCoeff,
                    textAlign: "center",
                    marginBottom: cellSize * rulesMarginCoeff,
                    backgroundColor: blueColor,
                }}
            >
                <h1
                    style={{
                        position: "relative",
                        fontSize: cellSize * h1HeightCoeff,
                        margin: 0,
                        padding: `0 ${cellSize * (h1HeightCoeff + rulesHeaderPaddingCoeff)}px`,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {translate(title)}
                </h1>

                <div
                    style={{
                        position: "absolute",
                        top: (cellSize * rulesHeaderPaddingCoeff) / 2,
                        right: (cellSize * rulesHeaderPaddingCoeff) / 2,
                        width: cellSize * (h1HeightCoeff + rulesHeaderPaddingCoeff),
                        height: cellSize * (h1HeightCoeff + rulesHeaderPaddingCoeff),
                    }}
                >
                    <ControlButton
                        left={0}
                        top={0}
                        cellSize={cellSize * (h1HeightCoeff + rulesHeaderPaddingCoeff)}
                        onClick={toggleFullScreen}
                        fullHeight={true}
                        title={translate(isFullScreen ? "Exit full screen mode" : "Enter full screen mode")}
                    >
                        {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
                    </ControlButton>
                </div>

                {(author || lmdLink) && (
                    <div style={{ fontSize: cellSize * h2HeightCoeff }}>
                        {author && (
                            <span>
                                {translate("by")} {translate(author)}
                            </span>
                        )}

                        {lmdLink && (
                            <span>
                                {author && " ("}

                                {/*eslint-disable-next-line react/jsx-no-target-blank*/}
                                <a
                                    href={lmdLink}
                                    target={"_blank"}
                                    onClick={() => runInAction(() => context.onStateChange({ openedLmdOnce: true }))}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        color: "#00c",
                                        textDecoration: "none",
                                    }}
                                >
                                    <span>{translate("open in LMD")}&nbsp;</span>
                                    <OpenInNew size={"1em"} />
                                </a>

                                {author && ")"}
                            </span>
                        )}
                    </div>
                )}

                <MultiPlayerInfo context={context} />

                {!isCompetitive && getPlayerScore && (
                    <div style={{ fontSize: cellSize * h2HeightCoeff }}>
                        {translate("Score")}: {getPlayerScore(context, myClientId)}
                    </div>
                )}
            </div>

            {initialLives > 0 && (
                <div
                    style={{
                        height: cellSize * liveHeartCoeff,
                        lineHeight: `${cellSize * liveHeartCoeff}px`,
                        fontSize: cellSize * liveHeartCoeff * 0.9,
                        textAlign: "center",
                        marginBottom: cellSize * rulesMarginCoeff,
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            left: `calc(50% - ${(cellSize * liveHeartCoeff * (lives + (lives - 1) * liveHeartMarginCoeff)) / 2}px)`,
                        }}
                    >
                        {indexes(lives).map((index) => (
                            <div
                                key={index}
                                style={{
                                    position: "absolute",
                                    left: cellSize * liveHeartCoeff * index * (1 + liveHeartMarginCoeff),
                                    width: cellSize * liveHeartCoeff,
                                    height: cellSize * liveHeartCoeff,
                                    color: "#f00",
                                }}
                            >
                                <Heart />
                            </div>
                        ))}
                    </div>

                    {!lives && translate("You lost") + "!"}
                </div>
            )}

            {!disableFogDemo && fogProps && (
                <div
                    style={{
                        marginBottom: cellSize * rulesMarginCoeff,
                        lineHeight: `${cellSize * textHeightCoeff}px`,
                        fontSize: cellSize * textHeightCoeff,
                    }}
                    title={translate({
                        [LanguageCode.en]:
                            "Turn on to safely modify the grid without revealing the fog.\n" +
                            "All actions made in this mode will be reverted after turning it back off.",
                        [LanguageCode.ru]:
                            "Включите, чтобы свободно изменять вещи на поле, не раскрывая при этом туман.\n" +
                            "Все действия, совершенные в этом режиме, будут отменены после его выключения.",
                        [LanguageCode.de]:
                            "Aktivieren Sie diese Option, um das Raster sicher zu ändern, ohne den Nebel sichtbar zu machen.\n" +
                            "Alle in diesem Modus ausgeführten Aktionen werden nach dem Deaktivieren rückgängig gemacht.",
                    })}
                >
                    {translate({
                        [LanguageCode.en]: "No fog reveal mode",
                        [LanguageCode.ru]: "Режим без раскрытия тумана",
                        [LanguageCode.de]: "Kein-Nebel-Enthüllungsmodus",
                    })}{" "}
                    <span
                        style={{
                            background: darkGreyColor,
                            color: "#fff",
                            display: "inline-block",
                            textAlign: "center",
                            width: "1.2em",
                            height: "1.2em",
                            lineHeight: "1.2em",
                            borderRadius: "50%",
                            cursor: "pointer",
                        }}
                    >
                        ?
                    </span>
                    : {translate(fogDemoGridStateHistory ? "ON" : "OFF")}
                    <Button
                        type={"button"}
                        cellSize={cellSize}
                        style={{
                            fontFamily: "inherit",
                            fontSize: "inherit",
                            lineHeight: `${cellSize * aboveRulesTextHeightCoeff * 1.5 - 2}px`,
                            paddingTop: 0,
                            paddingBottom: 0,
                            marginLeft: cellSize * rulesMarginCoeff,
                        }}
                        onClick={() =>
                            context.onStateChange(
                                fogDemoGridStateHistory
                                    ? {
                                          gridStateHistory: fogDemoGridStateHistory,
                                          fogDemoGridStateHistory: undefined,
                                      }
                                    : { fogDemoGridStateHistory: context.gridStateHistory },
                            )
                        }
                    >
                        {translate(fogDemoGridStateHistory ? "Turn off" : "Turn on")}
                    </Button>
                </div>
            )}

            {puzzleAboveRules?.(context, isPortrait)}
            {typeAboveRules?.(context, isPortrait)}

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
                    {rules?.(context)}
                </div>
            </div>
        </StyledContainer>
    );
}) as <T extends AnyPTM>(props: RulesProps<T>) => ReactElement;
