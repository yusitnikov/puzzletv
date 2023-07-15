import {JigsawSudokuTypeManager} from "../../jigsaw/types/JigsawSudokuTypeManager";
import {PuzzleImportOptions} from "../../../types/sudoku/PuzzleImportOptions";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {JigsawPTM} from "../../jigsaw/types/JigsawPTM";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {getRectCenter} from "../../../types/layout/Rect";
import {getAveragePosition} from "../../../types/layout/Position";

export const TetrisSudokuTypeManager = (options: PuzzleImportOptions): SudokuTypeManager<JigsawPTM> => ({
    ...JigsawSudokuTypeManager(options, {
        supportGluePieces: false,
        phrases: {
            forActivePiece: {
                [LanguageCode.en]: "For active tetris figure",
                [LanguageCode.ru]: "Для активной тетрисной фигуры",
                [LanguageCode.de]: "Für aktives Tetris-Figur",
            },
            dragPieceToMove: (rotatable) => ({
                [LanguageCode.en]: "Drag the tetris figure to move it" + (rotatable ? ", click it to rotate" : ""),
                [LanguageCode.ru]: "Перетащите тетрисную фигуру, чтобы двигать её" + (rotatable ? ". Щелкните по ней, чтобы повернуть" : ""),
                [LanguageCode.de]: "Ziehen Sie das Tetris-Figur, um es zu verschieben" + (rotatable ? ", und klicken Sie darauf, um es zu drehen" : ""),
            }),
            dragModeTitle: {
                [LanguageCode.en]: "Move the grid and the tetris figures",
                [LanguageCode.ru]: "Двигать поле и тетрисные фигуры",
                [LanguageCode.de]: "Bewegen Sie das Gitter und die Tetris-Figuren",
            },
        },
        getPieceCenter: ({cells, boundingRect}) => {
            // 2x2 quad rotates around the natural center
            if (boundingRect.width === 2 && boundingRect.height === 2) {
                return getRectCenter(boundingRect);
            }

            const {top, left} = getAveragePosition(cells);
            return {
                // subtracting 0.001 from the value is to ensure that 0.5 will be rounded down
                top: Math.round(top - 0.001) + 0.5,
                left: Math.round(left - 0.001) + 0.5,
            };
        },
    }),
});
