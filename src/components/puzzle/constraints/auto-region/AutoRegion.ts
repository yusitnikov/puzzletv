import { Constraint } from "../../../../types/puzzle/Constraint";
import { isValidCellForRegion } from "../region/Region";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";

export const AutoRegionConstraint = <T extends AnyPTM>(): Constraint<T> => {
    return {
        name: "auto-region",
        cells: [],
        props: undefined,
        isValidCell(cell, digits, cells, context, constraints, constraint, isFinalCheck) {
            const { puzzleIndex, maxDigit: expectedSize } = context;

            const region = puzzleIndex.getCustomRegionByBorderLinesAt(context, cell);

            if (region.length < expectedSize) {
                return false;
            }

            if (region.length > expectedSize) {
                return !isFinalCheck;
            }

            return isValidCellForRegion(region, cell, digits, context);
        },
    };
};
