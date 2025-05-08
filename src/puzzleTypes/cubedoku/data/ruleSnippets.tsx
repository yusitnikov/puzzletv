import { Translatable } from "../../../types/translations/Translatable";
import { LanguageCode } from "../../../types/translations/LanguageCode";

export const cubedokuNormalSudokuRules = (gridSize: number): Translatable => ({
    [LanguageCode.en]: `Fill the cells with the digits 1-${gridSize}, so that each face of the cube is a valid sudoku grid`,
    [LanguageCode.ru]: `Заполните ячейки цифрами от 1 до ${gridSize}, чтобы каждая грань куба была допустимым полем судоку`,
    [LanguageCode.de]: `Füllen Sie die Zellen mit den Ziffern 1–${gridSize}, sodass jede Seite des Würfels ein gültiges Sudoku-Gitter darstellt`,
});

export const cubedokuIndexingRules: Translatable = {
    [LanguageCode.en]:
        "Every digit in each grid indexes a 1x1x1 target cell within the cube, and each target cell must be indexed by all three grids",
    [LanguageCode.ru]:
        "Каждая цифра на каждой грани индексирует целевую ячейку 1x1x1 в кубе, и каждая целевая ячейка должна быть проиндексирована всеми тремя гранями",
    [LanguageCode.de]:
        "Jede Ziffer in jedem Raster indiziert eine 1x1x1-Zielzelle innerhalb des Würfels, und jede Zielzelle muss von allen drei Rastern indiziert werden",
};

export const cubedokuIndexingDetails: Translatable = {
    [LanguageCode.en]:
        "The digit 1 in a cell specifies that the target cell is the 1x1x1 cube closest to the surface of the cube where the digit is located, whereas a digit 2 in a cell indicates that the target cell is the second cube down from the surface, and so on",
    [LanguageCode.ru]:
        "Цифра 1 в ячейке указывает, что целевая ячейка представляет собой куб 1x1x1, ближайший к поверхности куба, где расположена цифра, тогда как цифра 2 в ячейке указывает, что целевая ячейка является вторым кубом от поверхности, и так далее",
    [LanguageCode.de]:
        "Die Ziffer 1 in einer Zelle gibt an, dass die Zielzelle der 1x1x1-Würfel ist, der der Oberfläche des Würfels, auf dem sich die Ziffer befindet, am nächsten liegt, während eine Ziffer 2 in einer Zelle angibt, dass die Zielzelle der zweite Würfel unterhalb der Oberfläche ist, und bald",
};
