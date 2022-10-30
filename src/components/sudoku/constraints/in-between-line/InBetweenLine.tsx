import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    getCircleConnectionPoint,
    isSamePosition,
    parsePositionLiterals,
    PositionLiteral
} from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {darkGreyColor, lighterGreyColor} from "../../../app/globals";

const lineWidth = 0.1;
const circleRadius = 0.4;
const backgroundColor = lighterGreyColor;

export const InBetweenLine = withFieldLayer(FieldLayer.regular, ({cells}: ConstraintProps) => {
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
}) as ConstraintPropsGenericFc;

export const InBetweenLineConstraint = <CellType, ExType, ProcessedExType>(cellLiterals: PositionLiteral[]): Constraint<CellType, undefined, ExType, ProcessedExType> => {
    const cells = splitMultiLine(parsePositionLiterals(cellLiterals));

    return {
        name: "in-between line",
        cells,
        component: InBetweenLine,
        props: undefined,
        isValidCell(cell, digits, cells, {puzzle: {typeManager: {areSameCellData, compareCellData}}, state}) {
            const digit = digits[cell.top][cell.left]!;

            const edgeCells = [cells[0], cells[cells.length - 1]];
            const [edgeDigit1, edgeDigit2] = edgeCells
                .map(({top, left}) => digits[top]?.[left])
                .filter(digit => digit !== undefined)
                .sort((a, b) => compareCellData(a, b, state, true));

            // The current cell is an edge cell
            if (edgeCells.some(position => isSamePosition(position, cell))) {
                // Other edge cells shouldn't be the same
                return edgeDigit2 === undefined || !areSameCellData(edgeDigit1, edgeDigit2, state, true);
            } else {
                // The current cell is on the between line
                if (edgeDigit1 !== undefined && edgeDigit2 !== undefined) {
                    return compareCellData(digit, edgeDigit1, state, true) > 0
                        && compareCellData(edgeDigit2, digit, state, true) > 0;
                } else if (edgeDigit1 !== undefined) {
                    return !areSameCellData(digit, edgeDigit1, state, true);
                }
            }

            return true;
        },
    };
};
