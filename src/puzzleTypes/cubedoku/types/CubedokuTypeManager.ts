import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { CellSelectionColor, CellSelectionByDataProps } from "../../../components/puzzle/cell/CellSelection";
import { CubeTypeManager } from "../../cube/types/CubeTypeManager";
import { mergePuzzleItems, PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { CubedokuIndexingConstraint } from "../constraints/CubedokuIndexing";
import { NumberPTM } from "../../../types/puzzle/PuzzleTypeMap";

export const CubedokuTypeManager: PuzzleTypeManager<NumberPTM> = {
    ...CubeTypeManager(false),

    getCellSelectionType(
        { top, left },
        {
            puzzle: {
                gridSize: { gridSize },
            },
            selectedCells,
        },
    ) {
        const realGridSize = gridSize / 2;

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
