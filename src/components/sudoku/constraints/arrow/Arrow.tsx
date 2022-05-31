import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {darkGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    getCircleConnectionPoint,
    parsePositionLiteral,
    parsePositionLiterals,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";

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

    const {left: lastX, top: lastY} = cells[cells.length - 1];
    const {left: prevX, top: prevY} = cells[cells.length - 2];
    let dirX = lastX - prevX;
    let dirY = lastY - prevY;
    const dirLength = Math.hypot(dirX, dirY);
    dirX /= dirLength;
    dirY /= dirLength;

    return <>
        <RoundedPolyLine
            points={cells}
            strokeWidth={lineWidth}
            stroke={darkGreyColor}
        />

        <RoundedPolyLine
            strokeWidth={lineWidth}
            stroke={darkGreyColor}
            points={[
                {
                    left: lastX + arrowSize * (-dirX + dirY),
                    top: lastY + arrowSize * (-dirY - dirX)
                },
                {
                    left: lastX,
                    top: lastY
                },
                {
                    left: lastX + arrowSize * (-dirX - dirY),
                    top: lastY + arrowSize * (-dirY + dirX)
                },
            ]}
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
