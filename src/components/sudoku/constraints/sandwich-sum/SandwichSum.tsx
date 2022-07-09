import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, Position, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {useDigitComponentType} from "../../../../contexts/DigitComponentTypeContext";
import {FieldSize} from "../../../../types/sudoku/FieldSize";
import {indexes} from "../../../../utils/indexes";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";

export interface SandwichSumProps {
    clueCell: Position;
    sum: number;
}

export const SandwichSum = withFieldLayer(FieldLayer.regular, ({clueCell: {top, left}, sum}: ConstraintProps<any, SandwichSumProps>) => {
    const {
        svgContentComponent: DigitSvgContent,
    } = useDigitComponentType();

    return <DigitSvgContent
        digit={sum}
        size={0.5}
        left={left + 0.5}
        top={top + 0.5}
    />;
});

export const SandwichSumConstraint = <CellType,>(
    clueCellLiteral: PositionLiteral,
    {rowsCount, columnsCount}: FieldSize,
    sum: number
): Constraint<CellType, SandwichSumProps> => {
    const clueCell = parsePositionLiteral(clueCellLiteral);

    return ({
        name: "arrow",
        cells: clueCell.left < 0 || clueCell.left >= columnsCount
            ? indexes(columnsCount).map(left => ({...clueCell, left}))
            : indexes(rowsCount).map(top => ({...clueCell, top})),
        clueCell,
        sum,
        component: SandwichSum,
        isValidCell(cell, digits, cells, {puzzle, state}, constraints, isFinalCheck) {
            const {typeManager: {getDigitByCellData}, digitsCount: maxDigit = getDefaultDigitsCount(puzzle)} = puzzle;

            const currentDigit = getDigitByCellData(digits[cell.top][cell.left], state);
            if (currentDigit !== 1 && currentDigit !== maxDigit) {
                // Highlight only the bread digits as conflicts if something's wrong
                return true;
            }

            const cellDigits = cells.map(({top, left}) => {
                const data = digits[top]?.[left];
                return data === undefined ? undefined : getDigitByCellData(data, state);
            });

            const [minIndex, maxIndex] = [cellDigits.indexOf(1), cellDigits.indexOf(maxDigit)].sort();
            if (minIndex < 0) {
                // One of bread digits not filled in the row/column yet
                return !isFinalCheck;
            }

            let actualSum = 0;

            for (let index = minIndex + 1; index < maxIndex; index++) {
                const digit = cellDigits[index];

                if (digit === undefined) {
                    return true;
                }

                actualSum += digit;
            }

            return actualSum === sum;
        },
    });
};
