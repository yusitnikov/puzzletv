import {Translatable} from "../../../types/translations/Translatable";
import {LanguageCode} from "../../../types/translations/LanguageCode";

export const cubedokuNormalSudokuRules = (fieldSize: number): Translatable => ({
    [LanguageCode.en]: `Fill the cells with the digits 1-${fieldSize}, so that each face of the cube is a valid Sudoku grid`,
    [LanguageCode.ru]: `Заполните ячейки цифрами от 1 до ${fieldSize}, чтобы каждая грань куба была допустимым полем судоку`,
});

export const cubedokuIndexingRules: Translatable = {
    [LanguageCode.en]: "Every digit in each grid indexes a 1x1x1 target cell within the cube, and each target cell must be indexed by all three grids",
    [LanguageCode.ru]: "Каждая цифра на каждой грани индексирует целевую ячейку 1x1x1 в кубе, и каждая целевая ячейка должна быть проиндексирована всеми тремя гранями",
};

export const cubedokuIndexingDetails: Translatable = {
    [LanguageCode.en]: "The digit 1 in a cell specifies that the target cell is the 1x1x1 cube closest to the surface of the cube where the digit is located, whereas a digit 2 in a cell indicates that the target cell is the second cube down from the surface, and so on",
    [LanguageCode.ru]: "Цифра 1 в ячейке указывает, что целевая ячейка представляет собой куб 1x1x1, ближайший к поверхности куба, где расположена цифра, тогда как цифра 2 в ячейке указывает, что целевая ячейка является вторым кубом от поверхности, и так далее",
};
