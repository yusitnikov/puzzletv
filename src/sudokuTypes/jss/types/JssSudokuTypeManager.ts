import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {arrayContainsPosition, Position} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {CellTypeProps} from "../../../types/sudoku/CellTypeProps";

const getRegionCells = <T extends AnyPTM>(region: Position[] | Constraint<T, any>) =>
    Array.isArray(region) ? region : region.cells;

export const JssSudokuTypeManager = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>
): SudokuTypeManager<T> => {
    return {
        ...baseTypeManager,
        mapImportedColors: true,
        getCellTypeProps(cell, puzzle): CellTypeProps<T> {
            const result = baseTypeManager.getCellTypeProps?.(cell, puzzle) ?? {};

            if (puzzle.regions?.length && !arrayContainsPosition(puzzle.regions.map(getRegionCells).flat(), cell)) {
                return {
                    ...result,
                    noInteraction: true,
                    noBorders: true,
                };
            }

            return result;
        },
        postProcessPuzzle(puzzle): PuzzleDefinition<T> {
            puzzle = {
                ...puzzle,
                disableBackgroundColorOpacity: true,
            };

            if (puzzle.regions?.length) {
                puzzle = {
                    ...puzzle,
                    regions: [...puzzle.regions]
                        .sort((a, b) => getRegionCells(b).length - getRegionCells(a).length)
                        .slice(1)
                };
            }

            return baseTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;
        },
    };
};
