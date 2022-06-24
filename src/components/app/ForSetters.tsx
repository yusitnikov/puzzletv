import {useTranslate} from "../../hooks/useTranslate";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {ContactMeShort} from "./ContactMe";
import {ReactNode} from "react";

export const ForSetters = () => {
    const translate = useTranslate();

    return <>
        <dl>
            <FaqItem question={translate({
                [LanguageCode.en]: "How can I set a puzzle on Puzzle TV?",
                [LanguageCode.ru]: "Как я могу создать головоломку на Puzzle TV?",
            })}>
                <p>
                    {translate({
                        [LanguageCode.en]: "Since the purpose of Puzzle TV is to support puzzles with unique rules and mechanics, the site doesn't have a \"setter mode\".",
                        [LanguageCode.ru]: "Поскольку целью Puzzle TV является поддержка головоломок с уникальными правилами и механикой, на сайте нет «режима редактирования».",
                    })}{" "}
                    {translate({
                        [LanguageCode.en]: "The only way to publish a puzzle here is to contact me (the site creator).",
                        [LanguageCode.ru]: "Единственный способ опубликовать здесь головоломку — связаться со мной (создателем сайта).",
                    })}
                </p>

                <p><ContactMeShort/></p>
            </FaqItem>

            <FaqItem question={translate({
                [LanguageCode.en]: "What is possible to implement on Puzzle TV?",
                [LanguageCode.ru]: "Что возможно реализовать на Puzzle TV?",
            })}>
                <p>{translate({
                    [LanguageCode.en]: "Everything. It's just a matter of time.",
                    [LanguageCode.ru]: "Всё. Это только вопрос времени.",
                })}</p>
            </FaqItem>

            <FaqItem question={translate({
                [LanguageCode.en]: "Is it for free?",
                [LanguageCode.ru]: "Это бесплатно?",
            })}>
                <p>{translate({
                    [LanguageCode.en]: "Yes. The project is driven only by enthusiasm and passion for setting and solving puzzles.",
                    [LanguageCode.ru]: "Да. Проектом движет исключтельно энтузиазм и любовь к составлению и решению головоломок.",
                })}</p>
            </FaqItem>

            <FaqItem question={translate({
                [LanguageCode.en]: "Who will be mentioned as the author of the puzzle?",
                [LanguageCode.ru]: "Кто будет упомянут в качестве автора головоломки?",
            })}>
                <p>{translate({
                    [LanguageCode.en]: "Only you, the actual creator of the puzzle, and your collaborators if any. " +
                    "I (the site creator) will not put myself as the puzzle author, and will not ask for any additional credit.",
                    [LanguageCode.ru]: "Только Вы, фактический создатель головоломки. " +
                    "Я (создатель сайта) не буду называть себя автором головоломки.",
                })}</p>
            </FaqItem>

            <FaqItem question={translate({
                [LanguageCode.en]: "What is the criteria for the puzzle to be published on Puzzle TV?",
                [LanguageCode.ru]: "Каковы критерии для публикации головоломки на Puzzle TV?",
            })}>
                <p>{translate({
                    [LanguageCode.en]: "The following factors will be considered when making decision to start implementing a new puzzle on Puzzle TV or not to:",
                    [LanguageCode.ru]: "При принятии решения о начале разработки новой головоломки на Puzzle TV будут учитываться следующие факторы:",
                })}</p>

                <ul>
                    <li>{translate({
                        [LanguageCode.en]: "Does the puzzle contain unique rules or mechanics that other popular platforms don't support? " +
                        "If f-puzzles or penpa+ can handle the puzzle, it will not be published on Puzzle TV.",
                        [LanguageCode.ru]: "Содержит ли головоломка уникальные правила или механику, которые не поддерживаются другими популярными платформами? " +
                        "Если f-puzzles или penpa+ могут справиться с головоломкой, она не будет опубликована на Puzzle TV.",
                    })}</li>

                    <li>{translate({
                        [LanguageCode.en]: "Ease of implementation.",
                        [LanguageCode.ru]: "Простота реализации.",
                    })}</li>

                    <li>{translate({
                        [LanguageCode.en]: "Did you already create a puzzle, or just have an idea of it? " +
                        "Having just an idea is not enough (unless it's extremely easy to implement). " +
                        "Feel free to ping me with your idea to get rough time estimation for it, though.",
                        [LanguageCode.ru]: "Вы уже создали головоломку, или у Вас есть только идея? " +
                        "Одной лишь идеи недостаточно (если только ее не очень легко реализовать).",
                    })}</li>

                    <li>{translate({
                        [LanguageCode.en]: "Quality of the puzzle. Software development is time, and the puzzle should be worth it.",
                        [LanguageCode.ru]: "Качество головоломки. Разработка программного обеспечения — это время, и головоломка должна того стоить.",
                    })}</li>
                </ul>
            </FaqItem>
        </dl>
    </>;
};

interface FaqItemProps {
    question: ReactNode;
    // answer
    children: ReactNode;
}

const FaqItem = ({question, children: answer}: FaqItemProps) => <>
    <dt><strong>{question}</strong></dt>
    <dd>{answer}</dd>
</>;
