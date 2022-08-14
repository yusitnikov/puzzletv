import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {darkGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    getCircleConnectionPoint,
    getLineVector,
    parsePositionLiterals,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {ArrowEnd} from "../../../svg/arrow-end/ArrowEnd";

const lineWidth = 0.1;
const arrowSize = 0.25;
const arrowEndMargin = 0.07;
const circleRadius = 0.35;

export interface ArrowProps {
    doubleCircle?: boolean;
    transparentCircle?: boolean;
}

export const Arrow = withFieldLayer(FieldLayer.regular, ({cells, doubleCircle, transparentCircle}: ConstraintProps<any, ArrowProps>) => {
    cells = cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

    const lastCircleIndex = doubleCircle ? 1 : 0;
    const {left, top} = cells[0];
    const {left: left2, top: top2} = cells[lastCircleIndex];
    if (doubleCircle) {
        cells = cells.slice(1);
    }
    cells[0] = getCircleConnectionPoint(cells[0], cells[1], circleRadius);

    let last = cells[cells.length - 1];
    const prev = cells[cells.length - 2];
    const arrowDirection = getLineVector({start: prev, end: last});
    last = cells[cells.length - 1] = {
        top: last.top - arrowEndMargin * arrowDirection.top,
        left: last.left - arrowEndMargin * arrowDirection.left,
    };

    return <>
        <RoundedPolyLine
            points={cells}
            strokeWidth={lineWidth}
            stroke={darkGreyColor}
        />

        <ArrowEnd
            position={last}
            direction={arrowDirection}
            arrowSize={arrowSize}
            lineWidth={lineWidth}
            color={darkGreyColor}
        />

        <rect
            x={Math.min(left, left2) - circleRadius}
            y={Math.min(top, top2) - circleRadius}
            width={Math.abs(left - left2) + 2 * circleRadius}
            height={Math.abs(top - top2) + 2 * circleRadius}
            rx={circleRadius}
            ry={circleRadius}
            strokeWidth={lineWidth}
            stroke={darkGreyColor}
            fill={transparentCircle ? "none" : "#fff"}
        />
    </>;
});

export const ArrowConstraint = <CellType,>(
    circleCellLiterals: PositionLiteral | PositionLiteral[],
    arrowCellLiterals: PositionLiteral[],
    transparentCircle = false
): Constraint<CellType, ArrowProps> => {
    circleCellLiterals = Array.isArray(circleCellLiterals) ? circleCellLiterals : [circleCellLiterals];
    const circleCells = parsePositionLiterals(circleCellLiterals);
    const circleCellsCount = circleCells.length;
    const cells = splitMultiLine([...circleCells, ...parsePositionLiterals(arrowCellLiterals)]);

    return ({
        name: "arrow",
        cells,
        doubleCircle: circleCellsCount > 1,
        transparentCircle,
        component: Arrow,
        isValidCell(cell, digits, cells, {puzzle: {typeManager: {getDigitByCellData}}, state}) {
            const circleCells = cells.slice(0, circleCellsCount).sort((a, b) => a.top - b.top || a.left - b.left);
            const arrowCells = cells.slice(circleCellsCount);
            let sum = 0;
            for (const circleCell of circleCells) {
                const sumData = digits[circleCell.top]?.[circleCell.left];
                if (sumData === undefined) {
                    return true;
                }
                sum *= 10;
                sum += getDigitByCellData(sumData, state);
            }

            for (const arrowCell of arrowCells) {
                const arrowDigit = digits[arrowCell.top]?.[arrowCell.left];

                if (arrowDigit === undefined) {
                    return true;
                }

                sum -= getDigitByCellData(arrowDigit, state);
            }

            return sum === 0;
        },
    });
};
