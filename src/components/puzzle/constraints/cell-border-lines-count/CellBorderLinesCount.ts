import { Constraint } from "../../../../types/puzzle/Constraint";
import { Line, parsePositionLiteral, PositionLiteral } from "../../../../types/layout/Position";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { PuzzleContext } from "../../../../types/puzzle/PuzzleContext";
import { incrementArrayItemByIndex } from "../../../../utils/array";
import { SetInterface } from "../../../../types/struct/Set";
import {
    errorResultCheck,
    notFinishedResultCheck,
    successResultCheck,
} from "../../../../types/puzzle/PuzzleResultCheck";

export const CellBorderLinesCountConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral,
    expectedCount: number,
): Constraint<T> => {
    const { top, left } = parsePositionLiteral(cellLiteral);

    const getBorders = (context: PuzzleContext<T>, lines: SetInterface<Line>) =>
        context.puzzleIndex.allCells[top][left]
            .getTransformedBounds(context)
            .borders.flatMap((points) =>
                points.map((start, index): Line => ({ start, end: incrementArrayItemByIndex(points, index) })),
            )
            .filter((line) => lines.contains(line));

    return {
        name: "cell border lines count",
        cells: [],
        props: undefined,
        isValidPuzzle(lines, _digits, _cells, context) {
            const borders = getBorders(context, lines);
            return borders.length > expectedCount
                ? errorResultCheck()
                : borders.length === expectedCount
                  ? successResultCheck(context)
                  : notFinishedResultCheck();
        },
        getInvalidUserLines(lines, _digits, _cells, context): Line[] {
            const borders = getBorders(context, lines);
            return borders.length > expectedCount ? borders : [];
        },
    };
};
