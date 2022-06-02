import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {darkGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    getCircleConnectionPoint,
    getLineVector,
    parsePositionLiteral,
    parsePositionLiterals,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {ArrowEnd} from "../../../svg/arrow-end/ArrowEnd";

const lineWidth = 0.1;
const arrowSize = 0.35;
const circleRadius = 0.4;

export interface ArrowProps {
    transparentCircle?: boolean;
}

export const Arrow = withFieldLayer(FieldLayer.regular, ({cells, transparentCircle}: ConstraintProps<any, ArrowProps>) => {
    cells = cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

    const {left, top} = cells[0];
    cells[0] = getCircleConnectionPoint(cells[0], cells[1], circleRadius);

    const last = cells[cells.length - 1];
    const prev = cells[cells.length - 2];

    return <>
        <RoundedPolyLine
            points={cells}
            strokeWidth={lineWidth}
            stroke={darkGreyColor}
        />

        <ArrowEnd
            position={last}
            direction={getLineVector({start: prev, end: last})}
            arrowSize={arrowSize}
            lineWidth={lineWidth}
            color={darkGreyColor}
        />

        <circle
            cx={left}
            cy={top}
            r={circleRadius}
            strokeWidth={lineWidth}
            stroke={darkGreyColor}
            fill={transparentCircle ? "none" : "#fff"}
        />
    </>;
});

export const ArrowConstraint = <CellType,>(
    circleCellLiteral: PositionLiteral,
    arrowCellLiterals: PositionLiteral[],
    transparentCircle = false
): Constraint<CellType, ArrowProps> => {
    const circleCell = parsePositionLiteral(circleCellLiteral);
    const cells = splitMultiLine([circleCell, ...parsePositionLiterals(arrowCellLiterals)]);

    return ({
        name: "arrow",
        cells,
        transparentCircle,
        component: Arrow,
        isValidCell(cell, digits, [circleCell, ...arrowCells], {typeManager: {getDigitByCellData}}, state) {
            const sumData = digits[circleCell.top]?.[circleCell.left];
            if (sumData === undefined) {
                return true;
            }
            let sum = getDigitByCellData(sumData, state);

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
