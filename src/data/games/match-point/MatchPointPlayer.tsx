import {observer} from "mobx-react-lite";
import {useAblyChannelPresence, useSetMyAblyChannelPresence} from "../../../hooks/useAbly";
import {ablyOptions} from "../../../hooks/useMultiPlayer";
import {getMatchPointHostChannelName, getMatchPointPlayerChannelName} from "./network";
import {useState} from "react";
import {MatchPointGameState, MatchPointHostInfo, MatchPointPlayerInfo} from "./types";
import {LargeButton, Paragraph, SubHeader} from "./styled";
import {settings} from "../../../types/layout/Settings";
import {MatchPointPlayStep} from "./MatchPointPlayStep";
import {useTranslate} from "../../../hooks/useTranslate";
import {LanguageCode} from "../../../types/translations/LanguageCode";

interface MatchPointPlayerProps {
    host: string;
    gameId: string;
}

const emptyObject = {};
export const MatchPointPlayer = observer(function MatchPointPlayer({host, gameId}: MatchPointPlayerProps) {
    const translate = useTranslate();

    const [hostInfoMessages, hostInfoLoaded] = useAblyChannelPresence(ablyOptions, getMatchPointHostChannelName(gameId));

    const [answers, setAnswers] = useState<string[]>([]);
    const [submittedAnswers, setSubmittedAnswers] = useState<MatchPointPlayerInfo | undefined>(undefined);

    const hostInfo: MatchPointHostInfo | undefined = hostInfoMessages.find((message) => message.clientId === host)?.data;

    const name = settings.nickname.get();

    useSetMyAblyChannelPresence(
        ablyOptions,
        getMatchPointPlayerChannelName(host, gameId),
        submittedAnswers ?? emptyObject,
        hostInfo?.state === MatchPointGameState.Answer && submittedAnswers !== undefined
    );

    if (!hostInfoLoaded) {
        return <div>{translate("Loading")}...</div>;
    }

    if (!hostInfo) {
        return <div>{translate("The host of the game is not connected")}.</div>;
    }

    const {name: hostName, state, questions} = hostInfo;

    return <div>
        <Paragraph>{translate("Hosted by %1").replace("%1", hostName)}</Paragraph>

        {state === MatchPointGameState.Answer && <div>
            <Paragraph>
                <SubHeader>{translate("What's your name?")}</SubHeader>

                <input
                    type={"text"}
                    value={name}
                    onInput={(ev) => settings.nickname.set(ev.currentTarget.value)}
                    style={{font: "inherit"}}
                />
            </Paragraph>

            {questions.map((question, index) => <Paragraph key={index}>
                <SubHeader>{question}</SubHeader>

                <input
                    type={"text"}
                    value={answers[index] ?? ""}
                    onInput={(ev) => {
                        const text = ev.currentTarget.value;
                        setAnswers(prevAnswers => {
                            const newAnswers = [...prevAnswers];
                            while (newAnswers.length < questions.length) {
                                newAnswers.push("");
                            }
                            newAnswers[index] = text;
                            return newAnswers;
                        });
                    }}
                    style={{font: "inherit", width: "100%", boxSizing: "border-box"}}
                />
            </Paragraph>)}

            <Paragraph>
                <LargeButton
                    onClick={() => setSubmittedAnswers({name, answers})}
                    disabled={
                        name.trim() === "" ||
                        answers.length < questions.length ||
                        answers.some(text => text.trim() === "") ||
                        (answers === submittedAnswers?.answers && name === submittedAnswers?.name)
                    }
                >
                    {
                        submittedAnswers
                            ? translate({
                                [LanguageCode.en]: "Update submission",
                                [LanguageCode.ru]: "Обновить данные",
                                [LanguageCode.de]: "Einreichung aktualisieren",
                            })
                            : translate("Submit")
                    }
                </LargeButton>

                {submittedAnswers && <LargeButton
                    onClick={() => setSubmittedAnswers(undefined)}
                    style={{marginLeft: "0.5em"}}
                >
                    {translate({
                        [LanguageCode.en]: "Cancel my submission",
                        [LanguageCode.ru]: "Отменить мою отправку",
                        [LanguageCode.de]: "Meine Einreichung abbrechen",
                    })}
                </LargeButton>}
            </Paragraph>
        </div>}

        {state === MatchPointGameState.Match && <div>
            <MatchPointPlayStep {...hostInfo}/>
        </div>}
    </div>;
});
