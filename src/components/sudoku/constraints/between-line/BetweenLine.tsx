import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    arrayContainsPosition,
    getCircleConnectionPoint,
    parsePositionLiterals,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {darkGreyColor, lighterGreyColor} from "../../../app/globals";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

export interface BetweenLineProps {
    lineColor?: string;
    lineWidth?: number;
    bulbRadius?: number;
    bulbBackgroundColor?: string;
    bulbLineColor?: string;
    bulbLineWidth?: number;
}

export const BetweenLine: ConstraintPropsGenericFcMap<BetweenLineProps> = {
    [FieldLayer.regular]: observer(function InBetweenLine<T extends AnyPTM>(
        {
            cells,
            props: {
                lineColor = darkGreyColor,
                lineWidth = 0.1,
                bulbRadius = 0.4,
                bulbBackgroundColor = lighterGreyColor,
                bulbLineColor = darkGreyColor,
                bulbLineWidth = 0.1,
            },
        }: ConstraintProps<T, BetweenLineProps>
    ) {
        profiler.trace();

        cells = cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

        const edge1 = cells[0];
        const edge2 = cells[cells.length - 1];

        cells[0] = getCircleConnectionPoint(edge1, cells[1], bulbRadius);
        cells[cells.length - 1] = getCircleConnectionPoint(edge2, cells[cells.length - 2], bulbRadius);

        return <>
            <RoundedPolyLine
                points={cells}
                strokeWidth={lineWidth}
                stroke={lineColor}
            />

            <circle
                cx={edge1.left}
                cy={edge1.top}
                r={bulbRadius}
                strokeWidth={bulbLineWidth}
                stroke={bulbLineColor}
                fill={bulbBackgroundColor}
            />

            <circle
                cx={edge2.left}
                cy={edge2.top}
                r={bulbRadius}
                strokeWidth={bulbLineWidth}
                stroke={bulbLineColor}
                fill={bulbBackgroundColor}
            />
        </>;
    }),
};

export const BetweenLineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    split = true,
    lineColor?: string,
    lineWidth?: number,
    bulbRadius?: number,
    bulbBackgroundColor?: string,
    bulbLineColor = lineColor,
    bulbLineWidth = lineWidth,
): Constraint<T, BetweenLineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "between line",
        cells,
        component: BetweenLine,
        color: lineColor,
        props: {
            lineColor,
            lineWidth,
            bulbRadius,
            bulbBackgroundColor,
            bulbLineColor,
            bulbLineWidth,
        },
        isValidCell(cell, digits, cells, context) {
            const {puzzle} = context;
            const {typeManager: {areSameCellData, compareCellData}} = puzzle;

            const digit = digits[cell.top][cell.left]!;

            const edgeCells = [cells[0], cells[cells.length - 1]];
            const [edgeCell1, edgeCell2] = edgeCells
                .map(({top, left}) => ({top, left, digit: digits[top]?.[left]}))
                .filter(({digit}) => digit !== undefined)
                .sort((a, b) => compareCellData(a.digit, b.digit, context));

            // The current cell is an edge cell
            if (arrayContainsPosition(edgeCells, cell)) {
                // Other edge cells shouldn't be the same
                return edgeCell2 === undefined || !areSameCellData(edgeCell1.digit, edgeCell2.digit, context, edgeCell1, edgeCell2);
            } else {
                // The current cell is on the between line
                if (edgeCell1 !== undefined && edgeCell2 !== undefined) {
                    return compareCellData(digit, edgeCell1.digit, context) > 0
                        && compareCellData(edgeCell2.digit, digit, context) > 0;
                } else if (edgeCell1 !== undefined) {
                    return !areSameCellData(digit, edgeCell1.digit, context, cell, edgeCell1);
                }
            }

            return true;
        },
    };
};
