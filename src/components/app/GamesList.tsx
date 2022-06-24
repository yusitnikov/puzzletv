import {useLanguageCode, useTranslate} from "../../hooks/useTranslate";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {getQuadMastersTitle} from "../../data/puzzles/QuadMasters";
import {buildLink} from "../../utils/link";
import {Chameleon} from "../../data/authors";
import {GamesListItem} from "./GamesListItem";
import {OpenInNew} from "@emotion-icons/material";

export const GamesList = () => {
    const language = useLanguageCode();
    const translate = useTranslate();

    return <>
        <GamesListItem
            name={"Quad Masters"}
            imageUrl={"/images/QuadMasters.png"}
            author={"Maff"}
            playLink={<>
                <a href={buildLink("quad-masters", language)}>{translate(getQuadMastersTitle(false, false, true))}</a>
                {" "}{translate("or")}{" "}
                <a href={buildLink("daily-quad-masters", language)}>{translate(getQuadMastersTitle(true, false))}</a>
            </>}
        >
            <p>{translate({
                [LanguageCode.en]: <>A multi-turn game for one or more players<br/>based on classic sudoku with a "quadruple" constraint.</>,
                [LanguageCode.ru]: <>Многоходовая игра для одного и более игрока,<br/>основанная на классическом судоку и "четверках".</>,
            })}</p>

            <p>{translate({
                [LanguageCode.en]: <>Players put quadruples and digits on the sudoku grid to gain<br/>information about the solution of the sudoku as soon as possible.</>,
                [LanguageCode.ru]: <>Игроки размещают четверки и цифры на поле судоку,<br/>чтобы как можно быстрее получить информацию о решении судоку.</>,
            })}</p>
        </GamesListItem>

        <GamesListItem
            name={"Quadle"}
            imageUrl={"/images/Quadle.png"}
            imageSize={167}
            playLink={<>
                <a href={buildLink("quadle", language)}>{translate(getQuadMastersTitle(false, true, true))}</a>
                {" "}{translate("or")}{" "}
                <a href={buildLink("daily-quadle", language)}>{translate(getQuadMastersTitle(true, true))}</a>
            </>}
        >
            <p>{translate({
                [LanguageCode.en]: <>Similar to Quad Masters, but the quadruples give more information<br/>about positions of digits relative to the circle.</>,
                [LanguageCode.ru]: <>Похоже на Quad Masters, но четверки дают больше информации<br/>о положении цифр относительно круга.</>,
            })}</p>
        </GamesListItem>

        <GamesListItem
            name={translate({
                [LanguageCode.en]: "Kropki Snake",
                [LanguageCode.ru]: "Змейка Кропки",
            })}
            imageUrl={"/images/KropkiSnake.png"}
            author={translate(Chameleon)}
            playLink={<a href="https://yusitnikov.github.io/kropkisnake/" target="_blank">
                {translate("external link")}&nbsp;<OpenInNew size={"1em"}/>
            </a>}
        >
            <p>{translate({
                [LanguageCode.en]: <>The good old snake, but it gathers Kropki dots<br/>on a sudoku grid. Why not? :-)</>,
                [LanguageCode.ru]: <>Старая добрая змейка, но только она собирает точки Кропки на поле судоку.<br/>А почему бы и нет? :-)</>,
            })}</p>
        </GamesListItem>
    </>;
};
