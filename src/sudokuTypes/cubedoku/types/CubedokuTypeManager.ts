import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { CellSelectionColor, CellSelectionByDataProps } from "../../../components/sudoku/cell/CellSelection";
import { CubeTypeManager } from "../../cube/types/CubeTypeManager";
import { mergePuzzleItems, PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import { CubedokuIndexingConstraint } from "../constraints/CubedokuIndexing";
import { NumberPTM } from "../../../types/sudoku/PuzzleTypeMap";

export const CubedokuTypeManager: SudokuTypeManager<NumberPTM> = {
    ...CubeTypeManager(false),

    getCellSelectionType(
        { top, left },
        {
            puzzle: {
                fieldSize: { fieldSize },
            },
            selectedCells,
        },
    ) {
        const realFieldSize = fieldSize / 2;

        const tooltipResult: Required<Pick<CellSelectionByDataProps<NumberPTM>, "color" | "strokeWidth">> = {
            color: CellSelectionColor.secondary,
            strokeWidth: 1,
        };
        const trackResult: Required<Pick<CellSelectionByDataProps<NumberPTM>, "color" | "strokeWidth">> = {
            color: CellSelectionColor.secondary,
            strokeWidth: 0.5,
        };

        let isTrack = false;

        for (const { top: selectedTop, left: selectedLeft } of selectedCells.items) {
            if (selectedTop < realFieldSize) {
                if (left === selectedLeft && top > selectedTop) {
                    if (top >= realFieldSize) {
                        return tooltipResult;
                    }
                    isTrack = true;
                }

                if (top === selectedTop && left > selectedLeft) {
                    isTrack = true;
                }

                if (left === fieldSize - 1 - selectedTop) {
                    return tooltipResult;
                }
            } else if (selectedLeft < realFieldSize) {
                if (left === selectedLeft && top < selectedTop) {
                    if (top < realFieldSize) {
                        return tooltipResult;
                    }

                    isTrack = true;
                }

                if (top === selectedTop && left > selectedLeft) {
                    if (left >= realFieldSize) {
                        return tooltipResult;
                    }

                    isTrack = true;
                }
            } else {
                if (left === selectedLeft && top < selectedTop) {
                    isTrack = true;
                }

                if (top === selectedTop && left < selectedLeft) {
                    if (left < realFieldSize) {
                        return tooltipResult;
                    }

                    isTrack = true;
                }

                if (top === fieldSize - 1 - selectedLeft) {
                    return tooltipResult;
                }
            }
        }

        return isTrack ? trackResult : undefined;
    },

    postProcessPuzzle({ items, ...puzzle }): PuzzleDefinition<NumberPTM> {
        return {
            ...puzzle,
            items: mergePuzzleItems([CubedokuIndexingConstraint()], items),
        };
    },
};
