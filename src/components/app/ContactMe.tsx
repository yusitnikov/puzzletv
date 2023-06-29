import {useLanguageCode, useTranslate} from "../../hooks/useTranslate";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {buildLink} from "../../utils/link";
import {DiscordAlt, Whatsapp} from "@emotion-icons/boxicons-logos";
import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";

export const ContactMe = observer(function ContactMe() {
    profiler.trace();

    const language = useLanguageCode();
    const translate = useTranslate();

    const settersLink = buildLink("for-setters", language);

    return <>
        <p>{translate({
            [LanguageCode.en]: "Hello! I'm Chameleon, the creator of Puzzle TV.",
            [LanguageCode.ru]: "Привет! Я Хамелеон, создатель Puzzle TV.",
        })}</p>

        <p>{translate({
            [LanguageCode.en]: "I'll be happy to hear your suggestions and ideas.",
            [LanguageCode.ru]: "Я буду рад обсудить Ваши предложения и идеи.",
        })}</p>

        <p><ContactMeShort/></p>

        <p>{translate({
            [LanguageCode.en]: <>Note: if you're a puzzle setter and want to publish your work on Puzzle TV, you can also find answers for common questions <a href={settersLink}>here</a>.</>,
            [LanguageCode.ru]: <>Примечание: если Вы создатель головоломок и хотите опубликовать Вашу работу на Puzzle TV, Вы также найдете ответы на распространенные вопросы <a href={settersLink}>здесь</a>.</>,
        })}</p>
    </>;
});

export const ContactMeShort = observer(function ContactMeShort() {
    profiler.trace();

    const translate = useTranslate();

    return <>
        {translate({
            [LanguageCode.en]: "You can find me in:",
            [LanguageCode.ru]: "Вы сможете найти меня в:",
        })}<br/>

        <span style={{display: "flex", alignItems: "center"}}>
            <DiscordAlt size={"1.2em"} color={"#5865f2"}/>&nbsp;Discord:&nbsp;
            <a href="https://discordapp.com/users/814965184438337618" target="_blank">yura_chameleon</a>
        </span>
        <span style={{display: "flex", alignItems: "center"}}>
            <Whatsapp size={"1.2em"} color={"#0dc143"}/>&nbsp;WhatsApp:&nbsp;+972527367825
        </span>
    </>;
});
