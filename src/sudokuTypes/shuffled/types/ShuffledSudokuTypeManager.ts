import {JigsawSudokuTypeManager} from "../../jigsaw/types/JigsawSudokuTypeManager";
import {PuzzleImportOptions} from "../../../types/sudoku/PuzzleImportOptions";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {JigsawPTM} from "../../jigsaw/types/JigsawPTM";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {isStickyRegionCell, PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {Constraint, toDecorativeConstraint} from "../../../types/sudoku/Constraint";
import {RectConstraint} from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {PositionSet} from "../../../types/layout/Position";

export const ShuffledSudokuTypeManager = (options: PuzzleImportOptions): SudokuTypeManager<JigsawPTM> => {
    const baseTypeManager = JigsawSudokuTypeManager(options, {
        supportGluePieces: false,
        phrases: {
            forActivePiece: {
                [LanguageCode.en]: "For active clue",
                [LanguageCode.ru]: "Для активной фигуры",
                [LanguageCode.de]: "Für aktives Figur",
            },
            dragPieceToMove: (rotatable) => ({
                [LanguageCode.en]: "Drag the clue to move it, click it to focus" + (rotatable ? ", click again to rotate" : ""),
                [LanguageCode.ru]: "Перетащите фигуру, чтобы двигать её. Щелкните по ней, чтобы выделить" + (rotatable ? ". Щелкните еще раз, чтобы повернуть" : ""),
                [LanguageCode.de]: "Ziehen Sie das Figur, um es zu verschieben, klicken Sie darauf, um es zu fokussieren" + (rotatable ? ", und klicken Sie erneut, um es zu drehen" : ""),
            }),
            dragModeTitle: {
                [LanguageCode.en]: "Move the grid and the clues",
                [LanguageCode.ru]: "Двигать поле и фигуры",
                [LanguageCode.de]: "Bewegen Sie das Gitter und die Figuren",
            },
        },
    });

    return {
        ...baseTypeManager,

        postProcessPuzzle(puzzle): PuzzleDefinition<JigsawPTM> {
            puzzle = baseTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;

            const items = puzzle.items ?? [];
            const processItems = (items: Constraint<JigsawPTM, any>[]): Constraint<JigsawPTM, any>[] => {
                const constraintCells = items
                    .flatMap((item) => item.cells)
                    .filter((cell) => isStickyRegionCell(puzzle, cell));
                const uniqueConstraintCells = new PositionSet(constraintCells).items;

                return [
                    ...items.map((item) => {
                        const cell = item.cells[0];
                        return cell && isStickyRegionCell(puzzle, cell)
                            ? toDecorativeConstraint(item)
                            : item;
                    }),
                    ...uniqueConstraintCells.map((cell) => RectConstraint(
                        [cell],
                        1,
                        "rgba(224, 200, 200, 0.5)",
                    ))
                ];
            };

            return {
                ...puzzle,
                items: typeof items === "function"
                    ? (...args) => processItems(items(...args))
                    : processItems(items),
            };
        },
    };
};
