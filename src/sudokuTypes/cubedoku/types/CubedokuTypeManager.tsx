import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {createRegularRegions, FieldSize} from "../../../types/sudoku/FieldSize";
import {CellSelectionColor, CellSelectionProps} from "../../../components/sudoku/cell/CellSelection";

export const CubedokuTypeManager: SudokuTypeManager<number> = {
    ...DigitSudokuTypeManager(),

    isValidCell({top, left}, {fieldSize: {rowsCount, columnsCount}}): boolean {
        return left * 2 < columnsCount || top * 2 >= rowsCount;
    },

    processArrowDirection(
        cell,
        xDirection,
        yDirection,
        fieldSize
    ) {
        const realFieldSize = fieldSize.fieldSize / 2;

        cell = defaultProcessArrowDirection(cell, xDirection, yDirection, fieldSize);

        if (cell.left >= realFieldSize && cell.top < realFieldSize) {
            if (xDirection) {
                cell.left -= realFieldSize;
            } else {
                cell.top += realFieldSize;
            }
        }

        return cell;
    },

    transformCoords({top, left}, {fieldSize: {fieldSize}}) {
        const realFieldSize = fieldSize / 2;

        if (top < realFieldSize) {
            return {
                left: realFieldSize + left - top,
                top: (left + top) / 2,
            };
        }

        return {
            left: left,
            top: top - Math.abs(left - realFieldSize) / 2,
        };
    },

    getCellSelectionType: function ({top, left}, {fieldSize: {fieldSize}}, {selectedCells}) {
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

export const createCubedokuFieldSize = (fieldSize: number, regionWidth: number, regionHeight = fieldSize / regionWidth): FieldSize => ({
    fieldSize: fieldSize * 2,
    rowsCount: fieldSize * 2,
    columnsCount: fieldSize * 2,
    regions: createRegularRegions(fieldSize * 2, fieldSize * 2, regionWidth, regionHeight)
        .filter(([[x, y]]) => x < fieldSize || y >= fieldSize)
});
