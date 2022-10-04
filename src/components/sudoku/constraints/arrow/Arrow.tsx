import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {darkGreyColor} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    getCircleConnectionPoint,
    getLineVector, parsePositionLiteral,
    parsePositionLiterals, Position,
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
    circleCells: Position[];
    arrowCells: Position[];
    transparentCircle?: boolean;
}

export const Arrow = withFieldLayer(FieldLayer.regular, ({circleCells, arrowCells, transparentCircle}: ConstraintProps<any, ArrowProps>) => {
    circleCells = circleCells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

    const {left, top} = circleCells[0];
    const {left: left2, top: top2} = circleCells[circleCells.length - 1];

    return <>
        <ArrowLine cells={arrowCells}/>

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

export const ArrowLine = ({cells}: {cells: Position[]}) => {
    if (cells.length < 2) {
        return null;
    }

    cells = cells.map(({left, top}) => ({left: left + 0.5, top: top + 0.5}));

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
    </>;
};

export const ArrowConstraint = <CellType,>(
    circleCellLiterals: PositionLiteral | PositionLiteral[],
    arrowCellLiterals: PositionLiteral[] = [],
    transparentCircle = false,
    arrowStartCellLiteral: PositionLiteral | undefined = undefined
): Constraint<CellType, ArrowProps> => {
    circleCellLiterals = Array.isArray(circleCellLiterals) ? circleCellLiterals : [circleCellLiterals];
    const arrowStartCell = parsePositionLiteral(arrowStartCellLiteral ?? circleCellLiterals[0]);
    const circleCells = parsePositionLiterals(circleCellLiterals);
    const arrowCells = parsePositionLiterals(arrowCellLiterals);
    const cells = splitMultiLine([...circleCells, ...arrowCells]);

    return ({
        name: "arrow",
        circleCells,
        arrowCells: [arrowStartCell, ...arrowCells],
        cells,
        transparentCircle,
        component: Arrow,
        isValidCell(cell, digits, cells, {puzzle: {typeManager: {getDigitByCellData}}, state}) {
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
