import {useTranslate} from "../../hooks/useTranslate";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";

export const HowToImport = observer(function HowToImport() {
    profiler.trace();

    const translate = useTranslate();

    const fPuzzlesLink = <a href="https://f-puzzles.com" target="_blank">f-puzzles</a>;
    // eslint-disable-next-line no-script-url
    const bookmarkletCode = "javascript:void(d=window.exportPuzzle&&exportPuzzle(),d?open('https://yusitnikov.github.io/puzzletv/#f-puzzles-wizard:load='+d):alert('Unable to extract a puzzle definition'))";

    return <ol>
        <li>{translate({
            [LanguageCode.en]: <>Create the puzzle in {fPuzzlesLink} (like you do it for SudokuPad)</>,
            [LanguageCode.ru]: <>Создайте головоломку в {fPuzzlesLink} (так же, как Вы делаете это для SudokuPad)</>,
            [LanguageCode.de]: <>Erstellen Sie das Rätsel in {fPuzzlesLink} (wie Sie es für SudokuPad tun)</>,
        })}.</li>
        <li>{translate({
            [LanguageCode.en]: "Drag&drop the following bookmarklet into your bookmarks bar (only once)",
            [LanguageCode.ru]: "Перетащите следующий букмарклет в Вашу панель закладок (только один раз)",
            [LanguageCode.de]: "Ziehen Sie das folgende Lesezeichen per Drag&Drop in Ihre Lesezeichenleiste (nur einmal)",
        })}: <a href={bookmarkletCode}>{translate({
            [LanguageCode.en]: "Export to PuzzleTV",
            [LanguageCode.ru]: "Экспорт в PuzzleTV",
            [LanguageCode.de]: "Export nach PuzzleTV",
        })}</a>.</li>
        <li>{translate({
            [LanguageCode.en]: "Click the bookmark",
            [LanguageCode.ru]: "Нажмите на закладку",
            [LanguageCode.de]: "Klicken Sie auf das Lesezeichen",
        })}.</li>
        <li>{translate({
            [LanguageCode.en]: 'Select puzzle options and click "Load"',
            [LanguageCode.ru]: 'Выберите опции головоломки и нажмите "Загрузить"',
            [LanguageCode.de]: 'Wählen Sie die Puzzle-Optionen und klicken Sie auf "Laden"',
        })}.</li>
        <li>{translate({
            [LanguageCode.en]: "Done! Now you can share the link to the puzzle",
            [LanguageCode.ru]: "Готово! Теперь Вы можете поделиться ссылкой на головоломку",
            [LanguageCode.de]: "Erledigt! Nun können Sie den Link zum Rätsel teilen",
        })}.</li>
    </ol>;
});
