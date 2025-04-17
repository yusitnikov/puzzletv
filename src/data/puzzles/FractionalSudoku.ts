import { SudokuMaker } from "./Import";
import { ColorsImportMode, PuzzleImportOptions, PuzzleImportPuzzleType } from "../../types/sudoku/PuzzleImportOptions";
import { PuzzleDefinitionLoader } from "../../types/sudoku/PuzzleDefinition";
import { NumberPTM } from "../../types/sudoku/PuzzleTypeMap";

// Note: these puzzles are for import instructions only!
const closeQuartersLoadString =
    "N4IgZg9gTgtghgFwGoFMoGcCWEB2IBcIAjAHQCsJADCADQgAOArgF7MA2KBoOcMnhAYTYR0KAAQBFRnCgI06WiDiMEAC2gEQAWUwBjVXBRsxAGRRgA1hADumBM0W6IMPjgSaAYgCUAggIAqAJIA8gByPiZiAMoAqgAiwQDSMQA6OAC0Yv6qmOhiTKwcYrlicGIALGIA6xViAOZQmAAmYhBgYrpGbOg0YtY5%2BqVQ4jJQcDh1KC2YOGKQjFBiUDZ54y3zi05sjDA4eW1zEAsdXXkocPokYgKnQ%2BJNmABuzVPFbhBiKSCdbMb0mChOugvmIAEYAT3qw0hbBmKHQJDSmQA6o05KUxA86nY5ssYGIiIBkAkqMzE50GPz%2BAM6iIyYjimGxCDy8EhOAgCCWKHo505pLKlNpmUCs3JqiWNl6Wx2OF6azBEAAHr01OIEBy4MYZOdWu1VSdfvlqfCOrgEHAZjM6mJ9VicUQxDBGOhOSgAI7SYz67VlA5lLATIqCrKqcToXjiEoIKCMcSQRa2xl2PIAJl6AGY5TgWuUhWJkaHZpSjYCTaT9eG%2BAbjAZHuJ3Z6xFhmCheuCjo64JCUG40DbQ5hFnbmW8yXZQ4toE00CRFAhwTzNLpneqYIpbE01AQABx0Ad1VTufC7kDwRUMpkEcp0SkKfAAbVAW2gd5TAF8aE%2BIMIMAQAGzlB%2BX4-negGft834vleQEQSBBDvuBz6-seMHYnWeD4NGsZ0I8mqxgQRA3pByFgcBUH4KRsHkZRSF3gBMG0TuDHEXe27MXB%2BAIWRyFcVRJHsdRAnIWxiEsUxokcbxjH4PREmCXJ-EKaxQmvip4nccpSnwWpnE6TRYkUTpIkaepfGqVphkWcZZmmdJvFoT2BBYa2IC4ds-CZjZKEWfpHG%2BeRUkGYFHHWdJoVBTpwXySZlkxf5wl6TpskxeFIWRUZiVWahTyOZhMYuW5%2BEUURknpVl5UxVFPFvgAukRezRhabh3o%2BIDzou%2BCUDB7X8IRIDDNiuAtZQNAjWNNCEZNE2jTN41TVN41zdNC2zTN83TWmm00Gmma7TQmZbVte17Yd237edJ1nUdF37TVtVvm%2BQA";
export const CloseQuarters: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            type: PuzzleImportPuzzleType.MergedCells,
            fractionalSudoku: true,
            load: closeQuartersLoadString,
        } as PuzzleImportOptions),
    slug: "close-quarters",
};
export const CloseQuartersSource: PuzzleDefinitionLoader<NumberPTM> = {
    loadPuzzle: () =>
        SudokuMaker.loadPuzzle({
            colorsImportMode: ColorsImportMode.Initials,
            load: closeQuartersLoadString,
        } as PuzzleImportOptions),
    slug: "close-quarters-source",
};
