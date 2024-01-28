import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {DominoLineConstraint} from "../domino-line/DominoLine";
import {peachColor} from "../../../app/globals";
import {LineComponent, LineProps} from "../line/Line";
import {splitMultiLine} from "../../../../utils/lines";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

// noinspection JSUnusedGlobalSymbols
export const AlternatingParityLineConstraint = <T extends AnyPTM>(cellLiterals: PositionLiteral[], split = true) =>
    DominoLineConstraint<T>(
        "alternating parity line",
        true,
        peachColor,
        cellLiterals,
        (digit1, digit2) => Math.abs(digit1 - digit2) % 2 === 1,
        undefined,
        split,
    );

export const SameParityLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[], split = true
): Constraint<T, LineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "same parity line",
        cells,
        color: peachColor,
        props: {},
        component: LineComponent,
        isObvious: true,
        isValidCell(cell, digits, cells, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const digit = getDigitByCellData(digits[cell.top][cell.left]!, context, cell);

            return cells
                .map((cell) => ({cell, data: digits[cell.top]?.[cell.left]}))
                .filter(({data}) => data !== undefined)
                .map(({cell, data}) => getDigitByCellData(data!, context, cell))
                .every(digit2 => (digit - digit2) % 2 === 0);
        },
    };
};
