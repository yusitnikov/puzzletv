import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {isTextConstraint} from "../../../components/sudoku/constraints/text/Text";
import {FogStarConstraint, fogStarTag} from "../constraints/FogStarConstraint";
import {CellTypeProps} from "../../../types/sudoku/CellTypeProps";
import {arrayContainsPosition} from "../../../types/layout/Position";

export const FogStarsSudokuTypeManager = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>
): SudokuTypeManager<T> => {
    return {
        ...baseTypeManager,

        getCellTypeProps(cell, puzzle): CellTypeProps<T> {
            const baseProps = baseTypeManager.getCellTypeProps?.(cell, puzzle) ?? {};

            return {
                ...baseProps,
                noMainDigit: (context) => {
                    if (baseProps.noMainDigit?.(context)) {
                        return true;
                    }

                    const {fogVisibleCells, allItems} = context;
                    if (!fogVisibleCells) {
                        return false;
                    }

                    if (!fogVisibleCells[cell.top]?.[cell.left]) {
                        return true;
                    }

                    const visibleStars = allItems
                        .filter(({tags = []}) => tags.includes(fogStarTag))
                        .flatMap(({cells}) => cells)
                        .filter(({top, left}) => fogVisibleCells[top]?.[left] && context.getCellDigit(top, left) === undefined);
                    return visibleStars.length !== 0 && !arrayContainsPosition(visibleStars, cell);
                },
            };
        },

        postProcessPuzzle(puzzle): PuzzleDefinition<T> {
            const originalItems = puzzle.items;
            if (Array.isArray(originalItems)) {
                puzzle = {
                    ...puzzle,
                    items: originalItems.map((item) => {
                        const {cells, color} = item;

                        return isTextConstraint(item) && ["★", "s", "star"].includes(item.props.text.toLowerCase())
                            ? FogStarConstraint(cells, color)
                            : item;
                    }),
                };
            }

            return puzzle;
        },
    };
};
