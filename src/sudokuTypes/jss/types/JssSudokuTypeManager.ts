import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {Position} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";

const getRegionCells = <T extends AnyPTM>(region: Position[] | Constraint<T, any>) =>
    Array.isArray(region) ? region : region.cells;

export const JssSudokuTypeManager = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>
): SudokuTypeManager<T> => {
    return {
        ...baseTypeManager,
        mapImportedColors: true,
        postProcessPuzzle(puzzle): PuzzleDefinition<T> {
            puzzle = {
                ...puzzle,
                disableBackgroundColorOpacity: true,
            };

            if (puzzle.regions?.length) {
                const [inactiveRegion, ...activeRegions] = [...puzzle.regions]
                    .sort((a, b) => getRegionCells(b).length - getRegionCells(a).length);

                puzzle = {
                    ...puzzle,
                    regions: activeRegions,
                    inactiveCells: [
                        ...(puzzle.inactiveCells ?? []),
                        ...getRegionCells(inactiveRegion),
                    ],
                };
            }

            return baseTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;
        },
    };
};
