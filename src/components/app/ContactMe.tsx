import { LanguageCode } from "../../types/translations/LanguageCode";
import { buildLink } from "../../utils/link";
import { DiscordAlt, Whatsapp } from "@emotion-icons/boxicons-logos";
import { observer } from "mobx-react-lite";
import { profiler } from "../../utils/profiler";
import { translate } from "../../utils/translate";

export const ContactMe = observer(function ContactMe() {
    profiler.trace();

    const settersLink = buildLink("for-setters");

    return (
        <>
            <p>
                {translate({
                    [LanguageCode.en]: "Hello! I'm Chameleon, the creator of Puzzle TV.",
                    [LanguageCode.ru]: "Привет! Я Хамелеон, создатель Puzzle TV.",
                    [LanguageCode.de]: "Hallo! Ich bin Chameleon, der Schöpfer von Puzzle TV.",
                })}
            </p>

            <p>
                {translate({
                    [LanguageCode.en]: "I'll be happy to hear your suggestions and ideas.",
                    [LanguageCode.ru]: "Я буду рад обсудить Ваши предложения и идеи.",
                    [LanguageCode.de]: "Ich freue mich über Ihre Anregungen und Ideen.",
                })}
            </p>

            <p>
                <ContactMeShort />
            </p>

            <p>
                {translate({
                    [LanguageCode.en]: (
                        <>
                            Note: if you're a puzzle setter and want to publish your work on Puzzle TV, you can also
                            find answers for common questions <a href={settersLink}>here</a>.
                        </>
                    ),
                    [LanguageCode.ru]: (
                        <>
                            Примечание: если Вы создатель головоломок и хотите опубликовать Вашу работу на Puzzle TV, Вы
                            также найдете ответы на распространенные вопросы <a href={settersLink}>здесь</a>.
                        </>
                    ),
                    [LanguageCode.de]: (
                        <>
                            Hinweis: Wenn Sie ein Rätselautor sind und Ihre Arbeit auf Puzzle TV veröffentlichen
                            möchten, finden Sie <a href={settersLink}>hier</a> auch Antworten auf häufig gestellte
                            Fragen.
                        </>
                    ),
                })}
            </p>
        </>
    );
});

export const ContactMeShort = observer(function ContactMeShort() {
    profiler.trace();

    return (
        <>
            {translate({
                [LanguageCode.en]: "You can find me in:",
                [LanguageCode.ru]: "Вы сможете найти меня в:",
                [LanguageCode.de]: "Sie finden mich in:",
            })}
            <br />

            <span style={{ display: "flex", alignItems: "center" }}>
                <DiscordAlt size={"1.2em"} color={"#5865f2"} />
                &nbsp;Discord:&nbsp;
                <a href="https://discordapp.com/users/814965184438337618" target="_blank">
                    yura_chameleon
                </a>
            </span>
            <span style={{ display: "flex", alignItems: "center" }}>
                <Whatsapp size={"1.2em"} color={"#0dc143"} />
                &nbsp;WhatsApp:&nbsp;+972527367825
            </span>
        </>
    );
});
