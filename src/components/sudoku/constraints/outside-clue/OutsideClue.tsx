import {
    isSamePosition,
    parsePositionLiteral,
    parsePositionLiterals,
    Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {FieldSize} from "../../../../types/sudoku/FieldSize";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {observer} from "mobx-react-lite";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {profiler} from "../../../../utils/profiler";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";

export enum OutsideClueLineDirectionType {
    straight = "straight",
    positiveDiagonal = "diagonal+",
    negativeDiagonal = "diagonal-",
}

export type OutsideClueLineDirectionLiteral = OutsideClueLineDirectionType | PositionLiteral;

export const detectOutsideClueDirection = (
    startCellLiteral: PositionLiteral,
    {rowsCount, columnsCount}: FieldSize,
    directionType: OutsideClueLineDirectionLiteral = OutsideClueLineDirectionType.straight,
) => {
    let startCell = parsePositionLiteral(startCellLiteral);

    const detectDirection = (diagonalCoeff: number): Position => {
        if (startCell.top < 0) {
            return {top: 1, left: -diagonalCoeff};
        } else if (startCell.top >= columnsCount) {
            return {top: -1, left: diagonalCoeff};
        } else if (startCell.left < 0) {
            return {top: -diagonalCoeff, left: 1};
        } else if (startCell.left >= rowsCount) {
            return {top: diagonalCoeff, left: -1};
        } else if (startCell.top <= 0) {
            return {top: 1, left: -diagonalCoeff};
        } else if (startCell.top >= columnsCount - 1) {
            return {top: -1, left: diagonalCoeff};
        } else if (startCell.left <= 0) {
            return {top: -diagonalCoeff, left: 1};
        } else {
            return {top: diagonalCoeff, left: -1};
        }
    };
    switch (directionType) {
        case OutsideClueLineDirectionType.straight: return detectDirection(0);
        case OutsideClueLineDirectionType.positiveDiagonal: return detectDirection(1);
        case OutsideClueLineDirectionType.negativeDiagonal: return detectDirection(-1);
        default: return parsePositionLiteral(directionType);
    }
};

export const getLineCellsByOutsideCell = (
    startCellLiteral: PositionLiteral,
    fieldSize: FieldSize,
    directionLiteral: OutsideClueLineDirectionLiteral = OutsideClueLineDirectionType.straight,
) => {
    const {rowsCount, columnsCount} = fieldSize;

    let startCell = parsePositionLiteral(startCellLiteral);
    const direction = detectOutsideClueDirection(startCellLiteral, fieldSize, directionLiteral);

    const isInnerCell = (top: number, left: number) => top >= 0 && top < rowsCount && left >= 0 && left < columnsCount;
    if (!isInnerCell(startCell.top, startCell.left)) {
        startCell = {
            top: startCell.top + direction.top,
            left: startCell.left + direction.left,
        };
    }

    const cells: Position[] = [];
    for (let {top, left} = startCell; isInnerCell(top, left); top += direction.top, left += direction.left) {
        cells.push({top, left});
    }

    return cells;
};

export interface OutsideClueProps {
    clueCell: Position;
    value: number;
}

export const OutsideClue: ConstraintPropsGenericFcMap<OutsideClueProps> = {
    [FieldLayer.regular]: observer(function OutsideClue<T extends AnyPTM>(
        {context: {puzzle}, color, props: {clueCell: {top, left}, value}}: ConstraintProps<T, OutsideClueProps>
    ) {
        profiler.trace();

        const {typeManager: {digitComponentType: {svgContentComponent: DigitSvgContent, widthCoeff}}} = puzzle;

        const valueArr = value.toString().split("").map(Number);

        return <>
            {valueArr.map((num, index) => <DigitSvgContent
                key={index}
                puzzle={puzzle}
                color={color}
                digit={num}
                size={0.5}
                left={left + 0.5 + 0.5 * widthCoeff * (index - (valueArr.length - 1) / 2)}
                top={top + 0.5}
            />)}
        </>;
    }),
};

export const OutsideClueConstraint = <T extends AnyPTM>(
    name: string,
    clueCellLiteral: PositionLiteral,
    cellLiteralsOrFieldSize: FieldSize | PositionLiteral[],
    value: number,
    color: string | undefined,
    isValidCell: (
        currentDigit: number,
        cellDigits: (number | undefined)[],
        context: PuzzleContext<T>,
        isFinalCheck: boolean,
        cellIndex: number,
    ) => boolean,
): Constraint<T, OutsideClueProps> => {
    const clueCell = parsePositionLiteral(clueCellLiteral);
    const cells = Array.isArray(cellLiteralsOrFieldSize)
        ? parsePositionLiterals(cellLiteralsOrFieldSize)
        : getLineCellsByOutsideCell(clueCellLiteral, cellLiteralsOrFieldSize);

    return {
        name,
        cells,
        color,
        props: {clueCell, value},
        component: OutsideClue,
        isValidCell(cell, digits, cells, context, _constraints, _constraint, isFinalCheck = false) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const currentDigit = getDigitByCellData(digits[cell.top][cell.left], context, cell);
            const cellDigits = cells.map((cell) => {
                const data = digits[cell.top]?.[cell.left];
                return data === undefined ? undefined : getDigitByCellData(data, context, cell);
            });
            const cellIndex = cells.findIndex(position => isSamePosition(cell, position));

            return isValidCell(currentDigit, cellDigits, context, isFinalCheck, cellIndex);
        },
        clone(constraint, {processCellCoords}): Constraint<T, OutsideClueProps> {
            return {
                ...constraint,
                props: {
                    ...constraint.props,
                    clueCell: processCellCoords(constraint.props.clueCell),
                }
            };
        },
    };
};
