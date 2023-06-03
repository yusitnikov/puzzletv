import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {parsePositionLiteral, Position, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {FieldSize} from "../../../../types/sudoku/FieldSize";
import {indexes} from "../../../../utils/indexes";
import {getDefaultDigitsCount} from "../../../../types/sudoku/PuzzleDefinition";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

export interface SandwichSumProps {
    clueCell: Position;
    sum: number;
}

export const SandwichSum: ConstraintPropsGenericFcMap<SandwichSumProps> = {
    [FieldLayer.regular]: observer(function SandwichSum<T extends AnyPTM>(
        {context: {puzzle}, props: {clueCell: {top, left}, sum}}: ConstraintProps<T, SandwichSumProps>
    ) {
        profiler.trace();

        const {typeManager: {digitComponentType: {svgContentComponent: DigitSvgContent}}} = puzzle;

        return <DigitSvgContent
            puzzle={puzzle}
            digit={sum}
            size={0.5}
            left={left + 0.5}
            top={top + 0.5}
        />;
    }),
};

export const SandwichSumConstraint = <T extends AnyPTM>(
    clueCellLiteral: PositionLiteral,
    {rowsCount, columnsCount}: FieldSize,
    sum: number
): Constraint<T, SandwichSumProps> => {
    const clueCell = parsePositionLiteral(clueCellLiteral);

    return ({
        name: "arrow",
        cells: clueCell.left < 0 || clueCell.left >= columnsCount
            ? indexes(columnsCount).map(left => ({...clueCell, left}))
            : indexes(rowsCount).map(top => ({...clueCell, top})),
        props: {clueCell, sum},
        component: SandwichSum,
        isValidCell(cell, digits, cells, context, constraints, isFinalCheck) {
            const {puzzle} = context;
            const {typeManager: {getDigitByCellData}, digitsCount: maxDigit = getDefaultDigitsCount(puzzle)} = puzzle;

            const currentDigit = getDigitByCellData(digits[cell.top][cell.left], context, cell);
            if (currentDigit !== 1 && currentDigit !== maxDigit) {
                // Highlight only the bread digits as conflicts if something's wrong
                return true;
            }

            const cellDigits = cells.map((cell) => {
                const data = digits[cell.top]?.[cell.left];
                return data === undefined ? undefined : getDigitByCellData(data, context, cell);
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
        clone(constraint, {processCellCoords}): Constraint<T, SandwichSumProps> {
            return {
                ...constraint,
                props: {
                    ...constraint.props,
                    clueCell: processCellCoords(constraint.props.clueCell),
                }
            };
        },
    });
};
