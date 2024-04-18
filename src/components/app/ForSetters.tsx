import {useLanguageCode, useTranslate} from "../../hooks/useTranslate";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {ContactMeShort} from "./ContactMe";
import {ReactNode} from "react";
import {buildLink} from "../../utils/link";
import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";

export const ForSetters = observer(function ForSetters() {
    profiler.trace();

    const language = useLanguageCode();
    const translate = useTranslate();

    const fPuzzlesLink = <a href="https://f-puzzles.com" target="_blank">f-puzzles</a>;
    const sudokuMakerLink = <a href="https://sudokumaker.app" target="_blank">Sudoku Maker</a>;
    const importLink = buildLink("how-to-import-puzzle", language);

    return <>
        <dl>
            <FaqItem question={translate({
                [LanguageCode.en]: "How can I set a puzzle on Puzzle TV?",
                [LanguageCode.ru]: "Как я могу создать головоломку на Puzzle TV?",
                [LanguageCode.de]: "Wie kann ich auf Puzzle TV ein Rätsel erstellen?",
            })}>
                <p>
                    {translate({
                        [LanguageCode.en]: <>Several popular puzzle genres (e.g. wraparound, rotational, infinity loop, etc.) could be imported from {fPuzzlesLink} or {sudokuMakerLink}. See the details <a href={importLink}>here</a></>,
                        [LanguageCode.ru]: <>Некоторые популярные жанры (тороидное поле, перевёртыш, бесконечный цикл и т.д.) можно импортировать из {fPuzzlesLink} или {sudokuMakerLink}'а. Подробнее <a href={importLink}>здесь</a></>,
                        [LanguageCode.de]: <>Mehrere beliebte Rätselgenres (z. B. Wraparound, Rotation, Infinity Loop usw.) könnten aus {fPuzzlesLink} oder {sudokuMakerLink} importiert werden. Die Details finden Sie <a href={importLink}>hier</a></>,
                    })}.
                </p>

                <p>
                    {translate({
                        [LanguageCode.en]: "For creating puzzles of new genres, please contact me (the site creator) with your idea",
                        [LanguageCode.ru]: "Для создания головоломок в новых жанрах, напишите мне (создателю сайта) о своей идее",
                        [LanguageCode.de]: "Wenn Sie Rätsel neuer Genres erstellen möchten, wenden Sie sich bitte mit Ihrer Idee an mich (den Ersteller der Website)",
                    })} ({translate({
                        [LanguageCode.en]: "since the purpose of Puzzle TV is to support puzzles with unique rules and mechanics, the site doesn't have a \"setter mode\"",
                        [LanguageCode.ru]: "поскольку целью Puzzle TV является поддержка головоломок с уникальными правилами и механикой, на сайте нет «режима редактирования»",
                        [LanguageCode.de]: "da der Zweck von Puzzle TV darin besteht, Rätsel mit einzigartigen Regeln und Mechanismen zu unterstützen, verfügt die Website nicht über einen \"Setter-Modus\"",
                    })}).
                </p>

                <p><ContactMeShort/></p>
            </FaqItem>

            <FaqItem question={translate({
                [LanguageCode.en]: "What is possible to implement on Puzzle TV?",
                [LanguageCode.ru]: "Что возможно реализовать на Puzzle TV?",
                [LanguageCode.de]: "Was ist auf Puzzle TV umsetzbar?",
            })}>
                <p>{translate({
                    [LanguageCode.en]: "Everything. It's just a matter of time.",
                    [LanguageCode.ru]: "Всё. Это только вопрос времени.",
                    [LanguageCode.de]: "Alles. Es ist nur eine Frage der Zeit.",
                })}</p>
            </FaqItem>

            <FaqItem question={translate({
                [LanguageCode.en]: "Is it for free?",
                [LanguageCode.ru]: "Это бесплатно?",
                [LanguageCode.de]: "Ist es kostenlos?",
            })}>
                <p>{translate({
                    [LanguageCode.en]: "Yes. The project is driven only by enthusiasm and passion for setting and solving puzzles.",
                    [LanguageCode.ru]: "Да. Проектом движет исключтельно энтузиазм и любовь к составлению и решению головоломок.",
                    [LanguageCode.de]: "Ja. Das Projekt wird nur von der Begeisterung und Leidenschaft für das Setzen und Lösen von Rätseln angetrieben.",
                })}</p>
            </FaqItem>

            <FaqItem question={translate({
                [LanguageCode.en]: "Who will be mentioned as the author of the puzzle?",
                [LanguageCode.ru]: "Кто будет упомянут в качестве автора головоломки?",
                [LanguageCode.de]: "Wer wird als Autor des Rätsels genannt?",
            })}>
                <p>{translate({
                    [LanguageCode.en]: "Only you, the actual creator of the puzzle, and your collaborators if any. " +
                    "I (the site creator) will not put myself as the puzzle author, and will not ask for any additional credit.",
                    [LanguageCode.ru]: "Только Вы, фактический создатель головоломки. " +
                    "Я (создатель сайта) не буду называть себя автором головоломки.",
                    [LanguageCode.de]: "Nur Sie, der eigentliche Ersteller des Puzzles, und Ihre Mitarbeiter (falls vorhanden). " +
                    "Ich (der Ersteller der Website) bezeichne mich nicht als Autor des Rätsels und verlange auch keine zusätzliche Anerkennung.",
                })}</p>
            </FaqItem>

            <FaqItem question={translate({
                [LanguageCode.en]: "What is the criteria for the puzzle to be published on Puzzle TV?",
                [LanguageCode.ru]: "Каковы критерии для публикации головоломки на Puzzle TV?",
                [LanguageCode.de]: "Welche Kriterien gelten für die Veröffentlichung des Rätsels auf Puzzle TV?",
            })}>
                <p>{translate({
                    [LanguageCode.en]: "The following factors will be considered when making decision to start implementing a new puzzle on Puzzle TV or not to:",
                    [LanguageCode.ru]: "При принятии решения о начале разработки новой головоломки на Puzzle TV будут учитываться следующие факторы:",
                    [LanguageCode.de]: "Die folgenden Faktoren werden bei der Entscheidung berücksichtigt, mit der Implementierung eines neuen Rätsels auf Puzzle TV zu beginnen oder nicht:",
                })}</p>

                <ul>
                    <li>{translate({
                        [LanguageCode.en]: "Does the puzzle contain unique rules or mechanics that other popular platforms don't support? " +
                        "If f-puzzles (imported into SudokuPad) or penpa+ can handle the puzzle, it will not be published on Puzzle TV.",
                        [LanguageCode.ru]: "Содержит ли головоломка уникальные правила или механику, которые не поддерживаются другими популярными платформами? " +
                        "Если f-puzzles (импортированный в SudokuPad) или penpa+ могут справиться с головоломкой, она не будет опубликована на Puzzle TV.",
                        [LanguageCode.de]: "Enthält das Rätsel einzigartige Regeln oder Mechanismen, die andere beliebte Plattformen nicht unterstützen? " +
                        "Wenn f-puzzles (in SudokuPad importiert) oder penpa+ mit dem Rätsel umgehen können, wird es nicht auf Puzzle TV veröffentlicht.",
                    })}</li>

                    <li>{translate({
                        [LanguageCode.en]: "Ease of implementation.",
                        [LanguageCode.ru]: "Простота реализации.",
                        [LanguageCode.de]: "Leichtigkeit der Durchsetzung",
                    })}</li>

                    <li>{translate({
                        [LanguageCode.en]: "Did you already create a puzzle, or just have an idea of it? " +
                        "Having just an idea is not enough (unless it's extremely easy to implement). " +
                        "Feel free to ping me with your idea to get rough time estimation for it, though.",
                        [LanguageCode.ru]: "Вы уже создали головоломку, или у Вас есть только идея? " +
                        "Одной лишь идеи недостаточно (если только ее не очень легко реализовать).",
                        [LanguageCode.de]: "Haben Sie bereits ein Rätsel erstellt oder haben Sie nur eine Idee davon? " +
                        "Es reicht nicht aus, nur eine Idee zu haben (es sei denn, sie lässt sich ganz einfach umsetzen).",
                    })}</li>

                    <li>{translate({
                        [LanguageCode.en]: "Quality of the puzzle. Software development is time, and the puzzle should be worth it.",
                        [LanguageCode.ru]: "Качество головоломки. Разработка программного обеспечения — это время, и головоломка должна того стоить.",
                        [LanguageCode.de]: "Qualität des Rätsels. Softwareentwicklung braucht Zeit, und das Rätsel sollte sich lohnen.",
                    })}</li>
                </ul>
            </FaqItem>
        </dl>
    </>;
});

interface FaqItemProps {
    question: ReactNode;
    // answer
    children: ReactNode;
}

const FaqItem = observer(function FaqItem({question, children: answer}: FaqItemProps) {
    profiler.trace();

    return <>
        <dt><strong>{question}</strong></dt>
        <dd>{answer}</dd>
    </>;
});
