import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {CellSelectionColor, CellSelectionProps} from "../../../components/sudoku/cell/CellSelection";
import {CubeTypeManager} from "../../cube/types/CubeTypeManager";

export const CubedokuTypeManager: SudokuTypeManager<number> = {
    ...CubeTypeManager(false),

    getCellSelectionType: function ({top, left}, {puzzle: {fieldSize: {fieldSize}}, state: {selectedCells}}) {
        const realFieldSize = fieldSize / 2;

        const tooltipResult: Required<Pick<CellSelectionProps, "color" | "strokeWidth">> = {
            color: CellSelectionColor.secondary,
            strokeWidth: 1,
        };
        const trackResult: Required<Pick<CellSelectionProps, "color" | "strokeWidth">> = {
            color: CellSelectionColor.secondary,
            strokeWidth: 0.5,
        };

        let isTrack = false;

        for (const {top: selectedTop, left: selectedLeft} of selectedCells.items) {
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
    }
};
