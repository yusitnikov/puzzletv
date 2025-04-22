import { LanguageCode } from "../../types/translations/LanguageCode";
import { getQuadMastersTitle } from "../../data/puzzles/QuadMasters";
import { buildLink } from "../../utils/link";
import { Chameleon } from "../../data/authors";
import { GamesListItem } from "./GamesListItem";
import { OpenInNew } from "@emotion-icons/material";
import { profiler } from "../../utils/profiler";
import { observer } from "mobx-react-lite";
import { MatchPointExplanation } from "../../data/games/match-point/MatchPointExplanation";
import { translate } from "../../utils/translate";

export const GamesList = observer(function GamesList() {
    profiler.trace();

    return (
        <>
            <GamesListItem
                name={"Match Point!"}
                imageUrl={"/images/MatchPoint.png"}
                imageSize={{ width: 300, height: 258 }}
                imageBorder={true}
                author={translate(Chameleon)}
                playLink={<a href={buildLink("match-point")}>Match Point!</a>}
            >
                <MatchPointExplanation />
            </GamesListItem>

            <GamesListItem
                name={"Quad Masters"}
                imageUrl={"/images/QuadMasters.png"}
                author={"Maff"}
                playLink={
                    <>
                        <a href={buildLink("quad-masters")}>{translate(getQuadMastersTitle(false, false, true))}</a>{" "}
                        {translate("or")}{" "}
                        <a href={buildLink("daily-quad-masters")}>{translate(getQuadMastersTitle(true, false))}</a>
                    </>
                }
            >
                <p>
                    {translate({
                        [LanguageCode.en]: (
                            <>
                                A multi-turn game for one or more players
                                <br />
                                based on classic sudoku with a "quadruple" constraint.
                            </>
                        ),
                        [LanguageCode.ru]: (
                            <>
                                Многоходовая игра для одного и более игрока,
                                <br />
                                основанная на классическом судоку и "четверках".
                            </>
                        ),
                        [LanguageCode.de]: (
                            <>
                                Ein Spiel mit mehreren Runden für einen oder
                                <br />
                                mehrere Spieler, das auf dem klassischen Sudoku
                                <br />
                                mit einer "Vierfach"-Beschränkung basiert.
                            </>
                        ),
                    })}
                </p>

                <p>
                    {translate({
                        [LanguageCode.en]: (
                            <>
                                Players put quadruples and digits on the sudoku grid to gain
                                <br />
                                information about the solution of the sudoku as soon as possible.
                            </>
                        ),
                        [LanguageCode.ru]: (
                            <>
                                Игроки размещают четверки и цифры на поле судоку,
                                <br />
                                чтобы как можно быстрее получить информацию о решении судоку.
                            </>
                        ),
                        [LanguageCode.de]: (
                            <>
                                Die Spieler tragen Vierfache und Ziffern auf das
                                <br />
                                Sudoku-Raster ein, um so schnell wie möglich
                                <br />
                                Informationen über die Lösung des Sudokus zu erhalten.
                            </>
                        ),
                    })}
                </p>
            </GamesListItem>

            <GamesListItem
                name={"Quadle"}
                imageUrl={"/images/Quadle.png"}
                imageSize={167}
                playLink={
                    <>
                        <a href={buildLink("quadle")}>{translate(getQuadMastersTitle(false, true, true))}</a>{" "}
                        {translate("or")}{" "}
                        <a href={buildLink("daily-quadle")}>{translate(getQuadMastersTitle(true, true))}</a>
                    </>
                }
            >
                <p>
                    {translate({
                        [LanguageCode.en]: (
                            <>
                                Similar to Quad Masters, but the quadruples give more information
                                <br />
                                about positions of digits relative to the circle.
                            </>
                        ),
                        [LanguageCode.ru]: (
                            <>
                                Похоже на Quad Masters, но четверки дают больше информации
                                <br />о положении цифр относительно круга.
                            </>
                        ),
                        [LanguageCode.de]: (
                            <>
                                Ähnlich wie Quad Masters, aber die Quadruples geben mehr
                                <br />
                                Informationen über die Positionen der Ziffern relativ zum Kreis.
                            </>
                        ),
                    })}
                </p>
            </GamesListItem>

            <GamesListItem
                name={translate({
                    [LanguageCode.en]: "Kropki Snake",
                    [LanguageCode.ru]: "Змейка Кропки",
                    [LanguageCode.de]: "Kropki-Schlange",
                })}
                imageUrl={"/images/KropkiSnake.png"}
                author={translate(Chameleon)}
                playLink={
                    <a href="https://yusitnikov.github.io/kropkisnake/" target="_blank">
                        {translate("external link")}&nbsp;
                        <OpenInNew size={"1em"} />
                    </a>
                }
            >
                <p>
                    {translate({
                        [LanguageCode.en]: (
                            <>
                                The good old snake, but it gathers Kropki dots
                                <br />
                                on a sudoku grid. Why not? :-)
                            </>
                        ),
                        [LanguageCode.ru]: (
                            <>
                                Старая добрая змейка, но только она собирает точки Кропки на поле судоку.
                                <br />А почему бы и нет? :-)
                            </>
                        ),
                        [LanguageCode.de]: (
                            <>
                                Die gute alte Schlange, aber sie sammelt Kropki-Punkte
                                <br />
                                auf einem Sudoku-Raster. Warum nicht? :-)
                            </>
                        ),
                    })}
                </p>
            </GamesListItem>
        </>
    );
});
