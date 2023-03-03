import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {DominoLineConstraint} from "../domino-line/DominoLine";
import {peachColor} from "../../../app/globals";
import {LineComponent, LineProps} from "../line/Line";
import {splitMultiLine} from "../../../../utils/lines";
import {Constraint} from "../../../../types/sudoku/Constraint";

export const AlternatingParityLineConstraint = <CellType, ExType, ProcessedExType>(cellLiterals: PositionLiteral[], display = true, split = true) => {
    return DominoLineConstraint<CellType, ExType, ProcessedExType>(
        "alternating parity line",
        true,
        peachColor,
        cellLiterals,
        (digit1, digit2) => Math.abs(digit1 - digit2) % 2 === 1,
        undefined,
        display,
        split,
    );
};

export const SameParityLineConstraint = <CellType, ExType, ProcessedExType>(
    cellLiterals: PositionLiteral[], display = true, split = true
): Constraint<CellType, LineProps, ExType, ProcessedExType> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "same parity line",
        cells,
        color: peachColor,
        props: {},
        component: display ? LineComponent : undefined,
        isObvious: true,
        isValidCell(cell, digits, cells, {puzzle: {typeManager: {getDigitByCellData}}, state}) {
            const digit = getDigitByCellData(digits[cell.top][cell.left]!, state);

            return cells
                .map(({top, left}) => digits[top]?.[left])
                .filter(cellData => cellData !== undefined)
                .map(cellData => getDigitByCellData(cellData!, state))
                .every(digit2 => (digit - digit2) % 2 === 0);
        },
    };
};
