import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    arrayContainsPosition,
    getCircleConnectionPoint,
    parsePositionLiterals,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {darkGreyColor, lighterGreyColor} from "../../../app/globals";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

const lineWidth = 0.1;
const circleRadius = 0.4;
const backgroundColor = lighterGreyColor;

export const InBetweenLine = {
    [FieldLayer.regular]: <T extends AnyPTM>({cells}: ConstraintProps<T>) => {
        cells = cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

        const edge1 = cells[0];
        const edge2 = cells[cells.length - 1];

        cells[0] = getCircleConnectionPoint(edge1, cells[1], circleRadius);
        cells[cells.length - 1] = getCircleConnectionPoint(edge2, cells[cells.length - 2], circleRadius);

        return <>
            <RoundedPolyLine
                points={cells}
                strokeWidth={lineWidth}
                stroke={darkGreyColor}
            />

            <circle
                cx={edge1.left}
                cy={edge1.top}
                r={circleRadius}
                strokeWidth={lineWidth}
                stroke={darkGreyColor}
                fill={backgroundColor}
            />

            <circle
                cx={edge2.left}
                cy={edge2.top}
                r={circleRadius}
                strokeWidth={lineWidth}
                stroke={darkGreyColor}
                fill={backgroundColor}
            />
        </>;
    },
};

export const InBetweenLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
): Constraint<T> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "in-between line",
        cells,
        component: InBetweenLine,
        props: undefined,
        isValidCell(cell, digits, cells, {puzzle, state}) {
            const {typeManager: {areSameCellData, compareCellData}} = puzzle;

            const digit = digits[cell.top][cell.left]!;

            const edgeCells = [cells[0], cells[cells.length - 1]];
            const [edgeDigit1, edgeDigit2] = edgeCells
                .map(({top, left}) => digits[top]?.[left])
                .filter(digit => digit !== undefined)
                .sort((a, b) => compareCellData(a, b, puzzle, state, true));

            // The current cell is an edge cell
            if (arrayContainsPosition(edgeCells, cell)) {
                // Other edge cells shouldn't be the same
                return edgeDigit2 === undefined || !areSameCellData(edgeDigit1, edgeDigit2, puzzle, state, true);
            } else {
                // The current cell is on the between line
                if (edgeDigit1 !== undefined && edgeDigit2 !== undefined) {
                    return compareCellData(digit, edgeDigit1, puzzle, state, true) > 0
                        && compareCellData(edgeDigit2, digit, puzzle, state, true) > 0;
                } else if (edgeDigit1 !== undefined) {
                    return !areSameCellData(digit, edgeDigit1, puzzle, state, true);
                }
            }

            return true;
        },
    };
};
