import { isSamePosition, parsePositionLiterals, PositionLiteral } from "../../../../types/layout/Position";
import { lightRedColor, peachColor } from "../../../app/globals";
import { LineComponent, LineProps } from "../line/Line";
import { splitMultiLine } from "../../../../utils/lines";
import { Constraint } from "../../../../types/sudoku/Constraint";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { PuzzleContext } from "../../../../types/sudoku/PuzzleContext";

export const BaseEntropicLineConstraint = <T extends AnyPTM>(
    name: string,
    cellLiterals: PositionLiteral[],
    digitGroups: (number[] | ((digit: number, context: PuzzleContext<T>) => boolean))[],
    split = true,
    color = peachColor,
    width: number | undefined = undefined,
): Constraint<T, LineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name,
        cells,
        color,
        props: { width },
        component: LineComponent,
        isObvious: true,
        isValidCell(cell, digits, cells, context) {
            const {
                puzzle: {
                    typeManager: { getDigitByCellData },
                },
            } = context;

            const getGroupIndex = (digit: number) =>
                digitGroups.findIndex((group) =>
                    Array.isArray(group) ? group.includes(digit) : group(digit, context),
                );

            const digit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);
            const group = getGroupIndex(digit);
            if (group < 0) {
                return false;
            }

            const index = cells.findIndex((position) => isSamePosition(cell, position));
            for (let index2 = index - digitGroups.length + 1; index2 < index + digitGroups.length; index2++) {
                if (index2 === index) {
                    continue;
                }

                const cell2 = cells[index2];
                if (!cell2) {
                    continue;
                }

                const data2 = digits[cell2.top]?.[cell2.left];
                if (data2 === undefined) {
                    continue;
                }

                const digit2 = getDigitByCellData(data2, context, cell2);
                const group2 = getGroupIndex(digit2);
                if (group2 === group) {
                    return false;
                }
            }

            return true;
        },
    };
};

export const EntropicLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    color = peachColor,
    width: number | undefined = undefined,
) =>
    BaseEntropicLineConstraint<T>(
        "entropic line",
        cellLiterals,
        [
            (digit, { digitsCount }) => digit * 3 <= digitsCount,
            (digit, { digitsCount }) => digit * 3 > digitsCount && digit * 3 <= digitsCount * 2,
            (digit, { digitsCount }) => digit * 3 > digitsCount * 2,
        ],
        split,
        color,
        width,
    );

export const ModularLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    color = "#33bbbb",
    width: number | undefined = undefined,
) =>
    BaseEntropicLineConstraint<T>(
        "modular line",
        cellLiterals,
        [(digit) => digit % 3 === 0, (digit) => digit % 3 === 1, (digit) => digit % 3 === 2],
        split,
        color,
        width,
    );

export const ParityLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    color = lightRedColor,
    width: number | undefined = undefined,
) =>
    BaseEntropicLineConstraint<T>(
        "parity line",
        cellLiterals,
        [(digit) => digit % 2 === 0, (digit) => digit % 2 === 1],
        split,
        color,
        width,
    );
