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
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {ArrowEnd} from "../../../svg/arrow-end/ArrowEnd";
import {defaultGetDefaultNumberByDigits} from "../../../../types/sudoku/SudokuTypeManager";

const lineWidth = 0.1;
const arrowSize = 0.25;
const arrowEndMargin = 0.07;
const circleRadius = 0.35;

export interface ArrowProps {
    circleCells: Position[];
    arrowCells: Position[];
    transparentCircle?: boolean;
}

export const Arrow = withFieldLayer(FieldLayer.regular, <CellType,>({props: {circleCells, arrowCells, transparentCircle}}: ConstraintProps<CellType, ArrowProps>) => {
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
}) as ConstraintPropsGenericFc<ArrowProps>;

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

export const ArrowConstraint = <CellType, ExType, ProcessedExType>(
    circleCellLiterals: PositionLiteral | PositionLiteral[],
    arrowCellLiterals: PositionLiteral[] = [],
    transparentCircle = false,
    arrowStartCellLiteral: PositionLiteral | undefined = undefined,
    product = false
): Constraint<CellType, ArrowProps, ExType, ProcessedExType> => {
    circleCellLiterals = Array.isArray(circleCellLiterals) ? circleCellLiterals : [circleCellLiterals];
    const arrowStartCell = parsePositionLiteral(arrowStartCellLiteral ?? circleCellLiterals[0]);
    const circleCells = splitMultiLine(parsePositionLiterals(circleCellLiterals));
    const arrowCells = splitMultiLine([arrowStartCell, ...parsePositionLiterals(arrowCellLiterals)]).slice(1);

    return ({
        name: "arrow",
        props: {
            circleCells,
            arrowCells: [arrowStartCell, ...arrowCells],
            transparentCircle,
        },
        cells: [...circleCells, ...arrowCells],
        component: Arrow,
        isValidCell(cell, digits, cells, {puzzle: {typeManager: {getDigitByCellData, getNumberByDigits = defaultGetDefaultNumberByDigits}}, state}) {
            const circleDigits = circleCells.map(({top, left}) => {
                const data = digits[top]?.[left];
                return data === undefined ? undefined : getDigitByCellData(data, state);
            });
            if (circleDigits.some(digit => digit === undefined)) {
                return true;
            }
            const circleNumber = getNumberByDigits(circleDigits as number[]);
            if (circleNumber === undefined) {
                return false;
            }

            if (arrowCells.length === 0) {
                return true;
            }

            let arrowNumber = product ? 1 : 0;
            for (const arrowCell of arrowCells) {
                const arrowData = digits[arrowCell.top]?.[arrowCell.left];

                if (arrowData === undefined) {
                    return true;
                }

                const arrowDigit = getDigitByCellData(arrowData, state);
                if (product) {
                    arrowNumber *= arrowDigit;
                } else {
                    arrowNumber += arrowDigit;
                }
            }

            return arrowNumber === circleNumber;
        },
    });
};
