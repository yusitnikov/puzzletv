/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import { MatchPointGameControllerProps, MatchPointPlayerInfo } from "./types";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import { useAblyChannelPresence } from "../../../hooks/useAbly";
import { ablyOptions, myClientId } from "../../../hooks/useMultiPlayer";
import { getMatchPointPlayerChannelName } from "./network";
import { LargeButton, paragraphGap, SubHeader } from "./styled";
import { Button } from "../../../components/layout/button/Button";
import { Check } from "@emotion-icons/material";
import { Copy } from "@emotion-icons/boxicons-regular";
import { QRCodeSVG } from "qrcode.react";
import { LanguageCode } from "../../../types/translations/LanguageCode";
import { getRussianPluralForm, translate } from "../../../utils/translate";

export const MatchPointHostGatherAnswers = observer(function MatchPointHostGatherAnswers({
    controller,
}: MatchPointGameControllerProps) {
    const [copy, copied] = useCopyToClipboard();

    const link = controller.getLink(controller.gameId);

    const [playerMessages] = useAblyChannelPresence(
        ablyOptions,
        getMatchPointPlayerChannelName(myClientId, controller.gameId),
    );
    const players = playerMessages.map((message) => message.data as MatchPointPlayerInfo);

    return (
        <ResponsiveGrid>
            <div style={{ gridArea: "link" }}>
                <SubHeader>{translate("Share the link to the game")}:</SubHeader>

                <div>
                    <a href={link} target={"_blank"} style={{ wordBreak: "break-word" }}>
                        {link}
                    </a>

                    <Button onClick={() => copy(link)} style={{ marginLeft: "0.5em" }}>
                        {translate("Copy")}&nbsp;{copied ? <Check size={"1em"} /> : <Copy size={"1em"} />}
                    </Button>
                </div>
            </div>

            <div style={{ gridArea: "qr" }}>
                <QRCodeSVG value={link} size={280} />
            </div>

            <div style={{ gridArea: "questions" }}>
                <SubHeader>{translate("Questions")}:</SubHeader>

                {controller.questionsForGame.map((question, index) => (
                    <div key={index} style={{ marginTop: "0.25em" }}>
                        {index + 1}. {question}
                    </div>
                ))}
            </div>

            <div style={{ gridArea: "submit" }}>
                <LargeButton
                    onClick={() => controller.startMatching(players)}
                    disabled={players.length < 2}
                    style={{ marginRight: "1em" }}
                >
                    {translate("Play")}
                </LargeButton>
                {players.length}{" "}
                {translate({
                    [LanguageCode.en]: `${players.length === 1 ? "player" : "players"} submitted answers`,
                    [LanguageCode.ru]: `${getRussianPluralForm(players.length, "игрок прислал", "игрока прислали", "игроков прислали")} ответы`,
                    [LanguageCode.de]: `Spieler ${players.length === 1 ? "hat" : "haben"} Antworten eingereicht`,
                })}
            </div>
        </ResponsiveGrid>
    );
});

const ResponsiveGrid = styled("div")({
    display: "grid",
    gap: paragraphGap,
    justifyContent: "center",
    alignItems: "start",
    gridTemplate: '"link qr" "questions qr" "submit qr" ". qr"',
    gridTemplateColumns: "max-content max-content",
    gridTemplateRows: "max-content max-content max-content 1fr",
    "@media (max-width: 960px)": {
        gridTemplate: '"link" "qr" "questions" "submit"',
        gridTemplateColumns: "1fr",
    },
});
