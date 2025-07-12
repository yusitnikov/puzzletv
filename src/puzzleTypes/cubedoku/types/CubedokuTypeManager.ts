import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { CellHighlightColor, CellHighlightByDataProps } from "../../../components/puzzle/cell/CellHighlight";
import { CubeTypeManager } from "../../cube/types/CubeTypeManager";
import { mergePuzzleItems, PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { CubedokuIndexingConstraint } from "../constraints/CubedokuIndexing";
import { NumberPTM } from "../../../types/puzzle/PuzzleTypeMap";

export const CubedokuTypeManager: PuzzleTypeManager<NumberPTM> = {
    ...CubeTypeManager(false),

    getCellHighlight(
        { top, left },
        {
            puzzle: {
                gridSize: { gridSize },
            },
            selectedCells,
        },
    ) {
        const realGridSize = gridSize / 2;

        const tooltipResult: Required<Pick<CellHighlightByDataProps<NumberPTM>, "color" | "strokeWidth">> = {
            color: CellHighlightColor.secondary,
            strokeWidth: 1,
        };
        const trackResult: Required<Pick<CellHighlightByDataProps<NumberPTM>, "color" | "strokeWidth">> = {
            color: CellHighlightColor.secondary,
            strokeWidth: 0.5,
        };

        let isTrack = false;

        for (const { top: selectedTop, left: selectedLeft } of selectedCells.items) {
            if (selectedTop < realGridSize) {
                if (left === selectedLeft && top > selectedTop) {
                    if (top >= realGridSize) {
                        return tooltipResult;
                    }
                    isTrack = true;
                }

                if (top === selectedTop && left > selectedLeft) {
                    isTrack = true;
                }

                if (left === gridSize - 1 - selectedTop) {
                    return tooltipResult;
                }
            } else if (selectedLeft < realGridSize) {
                if (left === selectedLeft && top < selectedTop) {
                    if (top < realGridSize) {
                        return tooltipResult;
                    }

                    isTrack = true;
                }

                if (top === selectedTop && left > selectedLeft) {
                    if (left >= realGridSize) {
                        return tooltipResult;
                    }

                    isTrack = true;
                }
            } else {
                if (left === selectedLeft && top < selectedTop) {
                    isTrack = true;
                }

                if (top === selectedTop && left < selectedLeft) {
                    if (left < realGridSize) {
                        return tooltipResult;
                    }

                    isTrack = true;
                }

                if (top === gridSize - 1 - selectedLeft) {
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
