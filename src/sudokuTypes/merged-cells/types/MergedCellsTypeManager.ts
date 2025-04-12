import { AnyNumberPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { DigitSudokuTypeManager } from "../../default/types/DigitSudokuTypeManager";
import { CellTypeProps } from "../../../types/sudoku/CellTypeProps";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import {
    createRegionsByGivenDigitsMap,
    GivenDigitsMap,
    processGivenDigitsMaps,
} from "../../../types/sudoku/GivenDigitsMap";
import { CustomCellBounds } from "../../../types/sudoku/CustomCellBounds";
import { getRegionBorders } from "../../../utils/regions";
import { getAverageModePosition } from "../../../types/layout/Position";
import { ColorsImportMode } from "../../../types/sudoku/PuzzleImportOptions";

export const MergedCellsTypeManager = <T extends AnyNumberPTM>(): SudokuTypeManager<T> => {
    const baseTypeManager = DigitSudokuTypeManager<T>();

    return {
        ...baseTypeManager,
        getCellTypeProps({ top, left }, puzzle): CellTypeProps<T> {
            // The puzzle wasn't processed yet - ignore cell props for now
            if (!puzzle.customCellBounds) {
                return {};
            }

            return {
                isVisible: puzzle.customCellBounds?.[top]?.[left] !== undefined,
            };
        },
        colorsImportMode: ColorsImportMode.Initials,
        postProcessPuzzle({ initialColors = {}, ...puzzle }): PuzzleDefinition<T> {
            if (typeof initialColors !== "object") {
                throw new Error("initialColors must be a plain object");
            }

            const cellRegions = createRegionsByGivenDigitsMap(
                processGivenDigitsMaps((colors) => colors.join(), [initialColors]),
                puzzle.fieldSize.columnsCount,
                puzzle.fieldSize.rowsCount,
            );

            const customCellBounds: GivenDigitsMap<CustomCellBounds> = {};
            for (const cells of cellRegions) {
                const mainCell = cells[0];

                customCellBounds[mainCell.top] ??= {};
                customCellBounds[mainCell.top][mainCell.left] = {
                    borders: [getRegionBorders(cells, 1, false, false)],
                    userArea: {
                        ...getAverageModePosition(cells),
                        width: 1,
                        height: 1,
                    },
                };
            }

            puzzle = {
                ...puzzle,
                customCellBounds,
            };

            return puzzle;
        },
    };
};
