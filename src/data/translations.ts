import {LanguageCode} from "../types/translations/LanguageCode";
import {TranslationItemNoEn} from "../types/translations/TranslationItem";

export const translationsExactType = {
    // region Common
    "by": {
        [LanguageCode.ru]: "от",
    },
    "you": {
        [LanguageCode.ru]: "Вы",
    },
    "or": {
        [LanguageCode.ru]: "или",
    },
    "Tip": {
        [LanguageCode.ru]: "Подсказка",
    },
    "ON": {
        [LanguageCode.ru]: "ВКЛ",
    },
    "OFF": {
        [LanguageCode.ru]: "ВЫКЛ",
    },
    "Play %1": {
        [LanguageCode.ru]: "Играть %1",
    },
    "Loading": {
        [LanguageCode.ru]: "Подключение",
    },
    // endregion
    // region App
    "Sudoku Puzzles": {
        [LanguageCode.ru]: "Судоку",
    },
    "Oops, the puzzle not found!": {
        [LanguageCode.ru]: "Ой, судоку не найден!",
    },
    "Check out the puzzles list": {
        [LanguageCode.ru]: "Перейти к списку судоку",
    },
    // endregion
    // region PageLayout
    "See all puzzles": {
        [LanguageCode.ru]: "Перейти к списку судоку",
    },
    // endregion
    // region Common for controls
    "Shortcut": {
        [LanguageCode.ru]: "Ярлык",
    },
    "shortcut": {
        [LanguageCode.ru]: "ярлык",
    },
    "click to toggle": {
        [LanguageCode.ru]: "нажмите, чтобы переключить",
    },
    // endregion
    // region Puzzle
    "You opened this puzzle in more than one tab": {
        [LanguageCode.ru]: "Вы открыли эту игру на более чем одной вкладке",
    },
    "Please leave only one active tab": {
        [LanguageCode.ru]: "Пожалуйста, оставьте только одну активную вкладку",
    },
    "The host of the game is not connected": {
        [LanguageCode.ru]: "Хост не подключен",
    },
    "Please wait for them to join": {
        [LanguageCode.ru]: "Пожалуйста, подождите когда он присоединится",
    },
    // endregion
    // region Controls
    "Corner": {
        [LanguageCode.ru]: "Угол",
    },
    "Center": {
        [LanguageCode.ru]: "Центр",
    },
    "Colors": {
        [LanguageCode.ru]: "Цвета",
    },
    "Lines": {
        [LanguageCode.ru]: "Линии",
    },
    "Move the grid": {
        [LanguageCode.ru]: "Двигать поле",
    },
    "Clear the cell contents": {
        [LanguageCode.ru]: "Очистить содержимое ячейки",
    },
    "Undo the last action": {
        [LanguageCode.ru]: "Отменить последнее действие",
    },
    "Redo the last action": {
        [LanguageCode.ru]: "Повторить последнее действие",
    },
    "Check the result": {
        [LanguageCode.ru]: "Проверить результат",
    },
    "Absolutely right": {
        [LanguageCode.ru]: "Совершенно верно",
    },
    "Something's wrong here": {
        [LanguageCode.ru]: "Что-то тут не так",
    },
    "Solution code": {
        [LanguageCode.ru]: "Код решения",
    },
    "Exit full screen mode": {
        [LanguageCode.ru]: "Выйти из полноэкранного режима",
    },
    "Enter full screen mode": {
        [LanguageCode.ru]: "Войти в полноэкранный режим",
    },
    // endregion
    // region RulesSpoiler
    "Spoiler": {
        [LanguageCode.ru]: "Спойлер",
    },
    "Click to show": {
        [LanguageCode.ru]: "Нажмите, чтоб показать",
    },
    // endregion
    // region Rules
    "Waiting for people to connect": {
        [LanguageCode.ru]: "Ждём, когда люди подключатся",
    },
    // endregion
    // region ChessMainControls
    "Chess piece color": {
        [LanguageCode.ru]: "Цвет фигур",
    },
    // endregion
    // region RotatableMainControls
    "Please rotate the field once to start solving the puzzle!": {
        [LanguageCode.ru]: "Поверните поле один раз, чтобы начать решать судоку",
    },
    "Rotate the puzzle": {
        [LanguageCode.ru]: "Повернуть поле",
    },
    "use the button from the right side to control the rotation speed": {
        [LanguageCode.ru]: "нажмите на кнопку справа, чтобы изменить скорость вращения поля",
    },
    "Sticky mode": {
        [LanguageCode.ru]: "Фиксированный режим",
    },
    "Sticky digits will preserve the orientation when rotating the field": {
        [LanguageCode.ru]: "Фиксированные цифры сохранят свою ориентацию при повороте поля",
    },
    "Sticky digits are highlighted in green": {
        [LanguageCode.ru]: "Фиксированные цифры помечены зелёным",
    },
    // endregion
    // region RotatableSecondaryControls
    "Rotation speed": {
        [LanguageCode.ru]: "Скорость вращения поля",
    },
    // endregion
    // region SettingsContent
    "Settings": {
        [LanguageCode.ru]: "Настройки",
    },
    "Highlight conflicts": {
        [LanguageCode.ru]: "Подсвечивать конфликты",
    },
    "Auto-check on finish": {
        [LanguageCode.ru]: "Авто-проверка при завершении",
    },
    "Background color's opacity": {
        [LanguageCode.ru]: "Прорачность цвета фона",
    },
    "Nickname": {
        [LanguageCode.ru]: "Никнейм",
    },
    // endregion
    // region useMultiPlayer
    "host": {
        [LanguageCode.ru]: "хост",
    },
    "guest": {
        [LanguageCode.ru]: "гость",
    },
    // endregion
};

export const translations: Record<string, TranslationItemNoEn> = translationsExactType;
