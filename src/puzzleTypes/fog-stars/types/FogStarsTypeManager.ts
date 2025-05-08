import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { isTextConstraint } from "../../../components/puzzle/constraints/text/Text";
import { FogStarConstraint, fogStarTag } from "../constraints/FogStarConstraint";
import { CellTypeProps } from "../../../types/puzzle/CellTypeProps";
import { arrayContainsPosition } from "../../../types/layout/Position";

export const FogStarsTypeManager = <T extends AnyPTM>(baseTypeManager: PuzzleTypeManager<T>): PuzzleTypeManager<T> => {
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

                    const { fogVisibleCells, allItems } = context;
                    if (!fogVisibleCells) {
                        return false;
                    }

                    if (!fogVisibleCells[cell.top]?.[cell.left]) {
                        return true;
                    }

                    const visibleStars = allItems
                        .filter(({ tags = [] }) => tags.includes(fogStarTag))
                        .flatMap(({ cells }) => cells)
                        .filter(
                            ({ top, left }) =>
                                fogVisibleCells[top]?.[left] && context.getCellDigit(top, left) === undefined,
                        );
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
                        const { cells, color } = item;

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
