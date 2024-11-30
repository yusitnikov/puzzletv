import { useLanguageCode, useTranslate } from "../../hooks/useTranslate";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { buildLink } from "../../utils/link";
import { profiler } from "../../utils/profiler";
import { observer } from "mobx-react-lite";

export const HomePage = observer(function HomePage() {
    profiler.trace();

    const language = useLanguageCode();
    const translate = useTranslate();

    const puzzlesLink = buildLink("puzzles", language);
    const gamesLink = buildLink("games", language);
    const settersLink = buildLink("for-setters", language);
    const contactMeLink = buildLink("contacts", language);
    const commonAppLinks = (
        <>
            <a href="https://sudokupad.app/" target="_blank">
                SudokuPad
            </a>
            ,{" "}
            <a href="https://f-puzzles.com/" target="_blank">
                f-puzzles
            </a>
            ,{" "}
            <a href="https://swaroopg92.github.io/penpa-edit/" target="_blank">
                penpa+
            </a>
        </>
    );

    return (
        <>
            <p>
                {translate({
                    [LanguageCode.en]: (
                        <>
                            The mission of the project is to power sudoku and pencil puzzles with unique rules and
                            mechanics that the commonly-used sudoku applications ({commonAppLinks}) don't support.
                        </>
                    ),
                    [LanguageCode.ru]: (
                        <>
                            Миссия этого проекта — создать платформу для судоку и прочих головоломок с уникальными
                            правилами и механикой, не поддерживаемыми популярными приложениями для судоку (
                            {commonAppLinks}).
                        </>
                    ),
                    [LanguageCode.de]: (
                        <>
                            Die Mission des Projekts besteht darin, Sudoku- und Bleistifträtsel mit einzigartigen Regeln
                            und Mechanismen zu versehen, die von den häufig verwendeten Sudoku-Anwendungen (
                            {commonAppLinks}) nicht unterstützt werden.
                        </>
                    ),
                })}
                <br />
                {translate({
                    [LanguageCode.en]: (
                        <>
                            Check out the <a href={puzzlesLink}>puzzles</a> and <a href={gamesLink}>games</a> galleries
                            for examples!
                        </>
                    ),
                    [LanguageCode.ru]: (
                        <>
                            Вы сможете найти примеры в галереях <a href={puzzlesLink}>головоломок</a> и{" "}
                            <a href={gamesLink}>игр.</a>
                        </>
                    ),
                    [LanguageCode.de]: (
                        <>
                            Schauen Sie sich die <a href={puzzlesLink}>Rätsel-</a> und <a href={gamesLink}>Spiele</a>
                            galerien für Beispiele an!
                        </>
                    ),
                })}
            </p>

            <p>
                {translate({
                    [LanguageCode.en]: (
                        <>
                            Have a suggestion or found a bug? Feel free to write to me - see the{" "}
                            <a href={contactMeLink}>contacts page</a>.
                        </>
                    ),
                    [LanguageCode.ru]: (
                        <>
                            Хотите предложить идею, или нашли баг на сайте? Пишите в любое время! Вы сможете найти мои
                            контактные данные <a href={contactMeLink}>здесь</a>.
                        </>
                    ),
                    [LanguageCode.de]: (
                        <>
                            Haben Sie einen Vorschlag oder haben Sie einen Fehler gefunden? Schreiben Sie mir gerne –
                            siehe <a href={contactMeLink}>Kontaktseite</a>.
                        </>
                    ),
                })}
            </p>

            <p>
                {translate({
                    [LanguageCode.en]: (
                        <>
                            If you're a puzzle setter and want to publish your work on Puzzle TV, please see the details{" "}
                            <a href={settersLink}>here</a>.
                        </>
                    ),
                    [LanguageCode.ru]: (
                        <>
                            Если Вы создатель головоломок и хотите опубликовать Вашу работу на Puzzle TV, смотрите
                            детали <a href={settersLink}>здесь</a>.
                        </>
                    ),
                    [LanguageCode.de]: (
                        <>
                            Wenn Sie ein Rätselautor sind und Ihre Arbeit auf Puzzle TV veröffentlichen möchten, sehen
                            Sie sich bitte die Details <a href={settersLink}>hier</a> an.
                        </>
                    ),
                })}
            </p>
        </>
    );
});
