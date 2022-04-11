import {LanguageCode} from "../types/translations/LanguageCode";
import {TranslationItemNoEn} from "../types/translations/TranslationItem";

export const translationsExactType = {
    // region Common
    "by": {
        [LanguageCode.ru]: "от",
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
    "Clear the cell contents": {
        [LanguageCode.ru]: "Очистить содержимое ячейки",
    },
    "Undo the last action": {
        [LanguageCode.ru]: "Отменить последнее действие",
    },
    "Redo the last action": {
        [LanguageCode.ru]: "Повторить последнее действие",
    },
    "Exit full screen mode": {
        [LanguageCode.ru]: "Выйти из полноэкранного режима",
    },
    "Enter full screen mode": {
        [LanguageCode.ru]: "Войти в полноэкранный режим",
    },
    // endregion
    // region ChessMainControls
    "Chess piece color": {
        [LanguageCode.ru]: "Цвет шахматных фигур",
    },
    // endregion
    // region RotatableMainControls
    "Please rotate the field once to start solving the puzzle!": {
        [LanguageCode.ru]: "Поверните поле один раз, чтобы начать решать судоку",
    },
    "Rotate the puzzle": {
        [LanguageCode.ru]: "Повернуть поле",
    },
    "use the button below to control the rotation speed": {
        [LanguageCode.ru]: "нажмите на кнопку ниже, чтобы изменить скорость вращения поля",
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
};

export const translations: Record<string, TranslationItemNoEn> = translationsExactType;
