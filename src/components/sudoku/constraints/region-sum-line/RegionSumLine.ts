import {parsePositionLiterals, PositionLiteral} from "../../../../types/layout/Position";
import {Constraint} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {LineComponent, LineProps} from "../line/Line";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {blueColor} from "../../../app/globals";

export const regionSumLineColor = blueColor;

export const RegionSumLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    color = regionSumLineColor,
    width: number | undefined = undefined,
): Constraint<T, LineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "region sum line",
        cells,
        color,
        component: LineComponent,
        props: {width},
        isObvious: false,
        isValidCell(
            cell,
            digits,
            cells,
            context
        ) {
            // TODO: support lines entering the region multiple times

            // number - sum of digits in the region, false - there's an empty cell on the line in the region
            const sumsMap: Record<number, number | false> = {};
            for (const cell of cells) {
                const {top, left} = cell;

                const regionIndex = context.getRegionByCell(top, left)?.index;
                if (regionIndex === undefined) {
                    continue;
                }
                const sum = sumsMap[regionIndex] ?? 0;

                const data = digits[top]?.[left];
                if (data === undefined || sum === false) {
                    sumsMap[regionIndex] = false;
                    continue;
                }

                const digit = context.puzzle.typeManager.getDigitByCellData(data, context, cell);
                sumsMap[regionIndex] = sum + digit;
            }

            const sums = Object.values(sumsMap).filter(value => value !== false);
            return sums.length === 0 || sums.every(sum => sum === sums[0]);
        },
    };
};
