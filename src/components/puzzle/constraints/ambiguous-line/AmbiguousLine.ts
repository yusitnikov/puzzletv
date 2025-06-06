import { parsePositionLiterals, PositionLiteral } from "../../../../types/layout/Position";
import { Constraint } from "../../../../types/puzzle/Constraint";
import { splitMultiLine } from "../../../../utils/lines";
import { LineComponent, LineProps } from "../line/Line";
import { peachColor } from "../../../app/globals";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";

export const AmbiguousLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    constraintOptionsConstructors: ((cellLiterals: PositionLiteral[]) => Constraint<T, LineProps>)[],
    width: number | undefined = undefined,
    color = peachColor,
    split = true,
): Constraint<T, LineProps> => {
    const constraintOptions = constraintOptionsConstructors.map((constructor) => constructor(cellLiterals));

    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "ambiguous line",
        cells,
        color,
        component: width !== 0 ? LineComponent : undefined,
        props: { width },
        isObvious: false,
        isValidCell(cell, digits, cells, ...args) {
            // Check the ambiguous constraints only if all line cells are fulfilled
            if (cells.some(({ top, left }) => !digits[top]?.[left])) {
                return true;
            }

            return constraintOptions.some(
                ({ isValidCell }) => !isValidCell || cells.every((cell) => isValidCell(cell, digits, cells, ...args)),
            );
        },
    };
};
