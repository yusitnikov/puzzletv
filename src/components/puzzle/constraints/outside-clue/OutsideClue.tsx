import {
    isSamePosition,
    parsePositionLiteral,
    parsePositionLiterals,
    Position,
    PositionLiteral,
} from "../../../../types/layout/Position";
import { GridSize } from "../../../../types/puzzle/GridSize";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../../types/puzzle/Constraint";
import { GridLayer } from "../../../../types/puzzle/GridLayer";
import { observer } from "mobx-react-lite";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { profiler } from "../../../../utils/profiler";
import { PuzzleContext } from "../../../../types/puzzle/PuzzleContext";

export enum OutsideClueLineDirectionType {
    straight = "straight",
    positiveDiagonal = "diagonal+",
    negativeDiagonal = "diagonal-",
}

export type OutsideClueLineDirectionLiteral = OutsideClueLineDirectionType | PositionLiteral;

export const detectOutsideClueDirection = (
    startCellLiteral: PositionLiteral,
    { rowsCount, columnsCount }: GridSize,
    directionType: OutsideClueLineDirectionLiteral = OutsideClueLineDirectionType.straight,
) => {
    let startCell = parsePositionLiteral(startCellLiteral);

    const detectDirection = (diagonalCoeff: number): Position => {
        if (startCell.top < 0) {
            return { top: 1, left: -diagonalCoeff };
        } else if (startCell.top >= columnsCount) {
            return { top: -1, left: diagonalCoeff };
        } else if (startCell.left < 0) {
            return { top: -diagonalCoeff, left: 1 };
        } else if (startCell.left >= rowsCount) {
            return { top: diagonalCoeff, left: -1 };
        } else if (startCell.top <= 0) {
            return { top: 1, left: -diagonalCoeff };
        } else if (startCell.top >= columnsCount - 1) {
            return { top: -1, left: diagonalCoeff };
        } else if (startCell.left <= 0) {
            return { top: -diagonalCoeff, left: 1 };
        } else {
            return { top: diagonalCoeff, left: -1 };
        }
    };
    switch (directionType) {
        case OutsideClueLineDirectionType.straight:
            return detectDirection(0);
        case OutsideClueLineDirectionType.positiveDiagonal:
            return detectDirection(1);
        case OutsideClueLineDirectionType.negativeDiagonal:
            return detectDirection(-1);
        default:
            return parsePositionLiteral(directionType);
    }
};

export const getLineCellsByOutsideCell = (
    startCellLiteral: PositionLiteral,
    gridSize: GridSize,
    directionLiteral: OutsideClueLineDirectionLiteral = OutsideClueLineDirectionType.straight,
) => {
    const { rowsCount, columnsCount } = gridSize;

    let startCell = parsePositionLiteral(startCellLiteral);
    const direction = detectOutsideClueDirection(startCellLiteral, gridSize, directionLiteral);

    const isInnerCell = (top: number, left: number) => top >= 0 && top < rowsCount && left >= 0 && left < columnsCount;
    if (!isInnerCell(startCell.top, startCell.left)) {
        startCell = {
            top: startCell.top + direction.top,
            left: startCell.left + direction.left,
        };
    }

    const cells: Position[] = [];
    for (let { top, left } = startCell; isInnerCell(top, left); top += direction.top, left += direction.left) {
        cells.push({ top, left });
    }

    return cells;
};

export interface OutsideClueProps {
    clueCell: Position;
    value: number;
}

export const OutsideClue: ConstraintPropsGenericFcMap<OutsideClueProps> = {
    [GridLayer.regular]: observer(function OutsideClue<T extends AnyPTM>({
        context,
        color,
        props: {
            clueCell: { top, left },
            value,
        },
    }: ConstraintProps<T, OutsideClueProps>) {
        profiler.trace();

        const {
            puzzle: {
                typeManager: {
                    digitComponentType: { svgContentComponent: DigitSvgContent, widthCoeff },
                },
            },
        } = context;

        const valueArr = value.toString().split("").map(Number);

        return (
            <>
                {valueArr.map((num, index) => (
                    <DigitSvgContent
                        key={index}
                        context={context}
                        color={color}
                        digit={num}
                        size={0.5}
                        left={left + 0.5 + 0.5 * widthCoeff * (index - (valueArr.length - 1) / 2)}
                        top={top + 0.5}
                    />
                ))}
            </>
        );
    }),
};

export const OutsideClueConstraint = <T extends AnyPTM>(
    name: string,
    clueCellLiteral: PositionLiteral,
    cellLiteralsOrFieldSize: GridSize | PositionLiteral[],
    value: number,
    color: string | undefined,
    isValidCell: (
        currentDigit: number,
        cellDigits: (number | undefined)[],
        context: PuzzleContext<T>,
        isFinalCheck: boolean,
        cellIndex: number,
        value: number,
    ) => boolean,
): Constraint<T, OutsideClueProps> => {
    const clueCell = parsePositionLiteral(clueCellLiteral);
    const cells = Array.isArray(cellLiteralsOrFieldSize)
        ? parsePositionLiterals(cellLiteralsOrFieldSize)
        : getLineCellsByOutsideCell(clueCellLiteral, cellLiteralsOrFieldSize);

    const constraint: Constraint<T, OutsideClueProps> = {
        name,
        cells,
        color,
        props: { clueCell, value },
        component: OutsideClue,
        isValidCell(cell, digits, cells, context, _constraints, _constraint, isFinalCheck = false) {
            const {
                puzzle: {
                    typeManager: { getDigitByCellData, transformNumber },
                },
            } = context;

            const currentDigit = getDigitByCellData(digits[cell.top][cell.left], context, cell);
            const cellDigits = cells.map((cell) => {
                const data = digits[cell.top]?.[cell.left];
                return data === undefined ? undefined : getDigitByCellData(data, context, cell);
            });
            const cellIndex = cells.findIndex((position) => isSamePosition(cell, position));

            const expectedValue = transformNumber ? transformNumber(value ?? 0, context, cells[0], constraint) : value;

            return isValidCell(currentDigit, cellDigits, context, isFinalCheck, cellIndex, expectedValue);
        },
        clone(constraint, { processCellCoords }): Constraint<T, OutsideClueProps> {
            return {
                ...constraint,
                props: {
                    ...constraint.props,
                    clueCell: processCellCoords(constraint.props.clueCell),
                },
            };
        },
    };

    return constraint;
};
