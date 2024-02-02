import {isSamePosition, parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {darkGreyColor} from "../../../app/globals";
import {LineComponent, LineProps} from "../line/Line";
import {splitMultiLine} from "../../../../utils/lines";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {indexes} from "../../../../utils/indexes";

export const SequenceLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    color = darkGreyColor,
    width: number | undefined = undefined,
): Constraint<T, LineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "sequence line",
        cells,
        color,
        props: {width},
        component: LineComponent,
        isObvious: true,
        isValidCell(cell, digits, cells, context) {
            const {puzzle: {typeManager: {getDigitByCellData}}} = context;

            const index = cells.findIndex((position) => isSamePosition(cell, position));
            for (let index2 = index - 2; index2 <= index; index2++) {
                const [digit1, digit2, digit3] = indexes(3).map((offset) => {
                    const cell2 = cells[index2 + offset];
                    if (!cell2) {
                        return undefined;
                    }

                    const data2 = digits[cell2.top]?.[cell2.left];
                    if (data2 === undefined) {
                        return undefined;
                    }

                    return getDigitByCellData(data2, context, cell2);
                });

                if (digit1 !== undefined && digit2 !== undefined && digit3 !== undefined && digit2 * 2 !== digit1 + digit3) {
                    return false;
                }
            }

            return true;
        },
    };
};
