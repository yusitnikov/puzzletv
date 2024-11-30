import { observer } from "mobx-react-lite";
import { useTranslate } from "../../../hooks/useTranslate";
import { LanguageCode } from "../../../types/translations/LanguageCode";

export const MatchPointExplanation = observer(function MatchPointExplanation() {
    const translate = useTranslate();

    return (
        <div>
            <p>
                {translate({
                    [LanguageCode.en]: "A game for a company of friends or colleagues.",
                    [LanguageCode.ru]: "Игра для компании друзей или коллег.",
                    [LanguageCode.de]: "Ein Spiel für eine Gruppe von Freunden oder Kollegen.",
                })}
            </p>

            <p>
                {translate({
                    [LanguageCode.en]: (
                        <>
                            Each participant gets a form with one or more
                            <br />
                            personal questions that they need to answer.
                        </>
                    ),
                    [LanguageCode.ru]: (
                        <>
                            Каждый участник получает форму с одним или несколькими
                            <br />
                            личными вопросами, на которые ему необходимо ответить.
                        </>
                    ),
                    [LanguageCode.de]: (
                        <>
                            Jeder Teilnehmer erhält einen Fragebogen mit einer oder
                            <br />
                            mehreren persönlichen Fragen, die er beantworten muss.
                        </>
                    ),
                })}
            </p>

            <p>
                {translate({
                    [LanguageCode.en]: (
                        <>
                            After that, the players' answers are displayed
                            <br />
                            on the screen one by one.
                        </>
                    ),
                    [LanguageCode.ru]: <>После этого, ответы игроков отображаются на экране один за другим.</>,
                    [LanguageCode.de]: (
                        <>
                            Anschließend werden die Antworten der Spieler
                            <br />
                            nacheinander auf dem Bildschirm angezeigt.
                        </>
                    ),
                })}
            </p>

            <p>
                {translate({
                    [LanguageCode.en]: "The goal of the game is to guess who wrote which answers.",
                    [LanguageCode.ru]: "Цель игры - угадать кто написал какие ответы.",
                    [LanguageCode.de]: "Ziel des Spiels ist es zu erraten, wer welche Antworten geschrieben hat.",
                })}
            </p>
        </div>
    );
});
