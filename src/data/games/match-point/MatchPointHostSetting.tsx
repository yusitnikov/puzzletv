import {observer} from "mobx-react-lite";
import {MatchPointGameControllerProps} from "./types";
import {DeleteButton, LargeButton, LinkText, Paragraph, SubHeader} from "./styled";
import {darkGreyColor} from "../../../components/app/globals";
import {settings} from "../../../types/layout/Settings";
import {useLanguageCode, useTranslate} from "../../../hooks/useTranslate";
import {LanguageCode} from "../../../types/translations/LanguageCode";

export const MatchPointHostSetting = observer(function MatchPointHostSetting({controller}: MatchPointGameControllerProps) {
    const languageCode = useLanguageCode();
    const translate = useTranslate();

    return <div>
        <Paragraph>
            <SubHeader>{translate("Link to the game")}:</SubHeader>

            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <span style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    // Ellipsis will get this color, everything else is styled
                    color: darkGreyColor,
                }}>
                    <LinkText>{controller.getLink(languageCode)}</LinkText>
                </span>
                <LinkText>:game=</LinkText>
                <input
                    type={"text"}
                    value={controller.gameId}
                    onInput={(ev) => controller.setGameId(ev.currentTarget.value)}
                    autoFocus={true}
                    style={{font: "inherit"}}
                />
            </div>
        </Paragraph>

        <Paragraph>
            <SubHeader>{translate("Questions")}:</SubHeader>
            {controller.questionsForEditing.map((question, index) => <div
                key={index}
                style={{marginTop: "0.25em", display: "flex", alignItems: "center", gap: "0.5em"}}
            >
                <span>{index + 1}.</span>

                <div style={{position: "relative", width: "100%"}}>
                    <input
                        type={"text"}
                        value={question}
                        onInput={(ev) => controller.setQuestion(index, ev.currentTarget.value)}
                        style={{
                            font: "inherit",
                            width: "100%",
                            paddingRight: "2em",
                            boxSizing: "border-box",
                        }}
                    />

                    {index !== controller.questionsForEditing.length - 1 && <DeleteButton
                        type={"button"}
                        onClick={() => controller.removeQuestion(index)}
                        tabIndex={-1}
                    >
                        &times;
                    </DeleteButton>}
                </div>
            </div>)}
        </Paragraph>

        <Paragraph>
            <SubHeader>{translate("Your name")}:</SubHeader>
            <div>
                <input
                    type={"text"}
                    value={settings.nickname.get()}
                    onInput={(ev) => settings.nickname.set(ev.currentTarget.value)}
                    style={{font: "inherit"}}
                />
            </div>
        </Paragraph>

        <Paragraph>
            <LargeButton
                onClick={() => controller.startAnswering()}
                disabled={settings.nickname.get().trim() === "" || controller.questionsForGame.length === 0}
            >
                {translate({
                    [LanguageCode.en]: "Gather answers",
                    [LanguageCode.ru]: "Собрать ответы",
                    [LanguageCode.de]: "Antworten sammeln",
                })}
            </LargeButton>
        </Paragraph>
    </div>;
});
