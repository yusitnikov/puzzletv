import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {darkGreyColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    getCircleConnectionPoint,
    getLineVector, isSamePosition, parsePositionLiteral,
    parsePositionLiterals, Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {splitMultiLine} from "../../../../utils/lines";
import {ArrowEnd} from "../../../svg/arrow-end/ArrowEnd";
import {defaultGetDefaultNumberByDigits} from "../../../../types/sudoku/SudokuTypeManager";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

const lineWidth = 0.1;
const arrowSize = 0.25;
const arrowEndMargin = 0.07;
const circleRadius = 0.35;

export interface ArrowProps {
    circleCells: Position[];
    arrowCells: Position[];
    transparentCircle?: boolean;
}

const getPointInfo = <T extends AnyPTM>(context: PuzzleContext<T>, {top, left}: Position, radius: number) => {
    const cellInfo = context.cellsIndex.allCells[top]?.[left];
    return cellInfo
        ? {...cellInfo.center, radius: radius * cellInfo.bounds.userArea.width}
        : {left: left + 0.5, top: top + 0.5, radius};
};

export const Arrow = {
    [FieldLayer.regular]: <T extends AnyPTM>(
        {
            props: {circleCells, arrowCells, transparentCircle},
            context,
        }: ConstraintProps<T, ArrowProps>
    ) => {
        const {left, top, radius: scaledCircleRadius} = getPointInfo(context, circleCells[0], circleRadius);
        const {
            left: left2,
            top: top2,
            radius: scaledLineWidth
        } = getPointInfo(context, circleCells[circleCells.length - 1], lineWidth);

        return <>
            <ArrowLine cells={arrowCells} context={context}/>

            <rect
                x={Math.min(left, left2) - scaledCircleRadius}
                y={Math.min(top, top2) - scaledCircleRadius}
                width={Math.abs(left - left2) + 2 * scaledCircleRadius}
                height={Math.abs(top - top2) + 2 * scaledCircleRadius}
                rx={scaledCircleRadius}
                ry={scaledCircleRadius}
                strokeWidth={scaledLineWidth}
                stroke={darkGreyColor}
                fill={transparentCircle ? "none" : "#fff"}
            />
        </>;
    },
};

export const ArrowLine = <T extends AnyPTM>(
    {cells, context}: {cells: Position[], context: PuzzleContext<T>}
) => {
    if (cells.length < 2) {
        return null;
    }

    const {radius: scaledCircleRadius} = getPointInfo(context, cells[0], circleRadius);

    const transformedCells = cells.map(cell => getPointInfo(context, cell, lineWidth / 2));

    transformedCells[0] = getCircleConnectionPoint(transformedCells[0], transformedCells[1], scaledCircleRadius);

    let last = transformedCells[transformedCells.length - 1];
    const prev = transformedCells[transformedCells.length - 2];
    const arrowDirection = getLineVector({start: prev, end: last});
    last = transformedCells[transformedCells.length - 1] = {
        ...last,
        top: last.top - arrowEndMargin * arrowDirection.top,
        left: last.left - arrowEndMargin * arrowDirection.left,
    };

    return <>
        <RoundedPolyLine
            points={transformedCells}
            strokeWidth={lineWidth}
            stroke={darkGreyColor}
        />

        <ArrowEnd
            position={last}
            direction={arrowDirection}
            arrowSize={getPointInfo(context, cells[cells.length - 1], arrowSize).radius}
            lineWidth={last.radius * 2}
            color={darkGreyColor}
        />
    </>;
};

export const ArrowConstraint = <T extends AnyPTM>(
    circleCellLiterals: PositionLiteral | PositionLiteral[],
    arrowCellLiterals: PositionLiteral[] = [],
    transparentCircle = false,
    arrowStartCellLiteral: PositionLiteral | undefined = undefined,
    product = false,
    split = true,
): Constraint<T, ArrowProps> => {
    circleCellLiterals = Array.isArray(circleCellLiterals) ? circleCellLiterals : [circleCellLiterals];
    const arrowStartCell = parsePositionLiteral(arrowStartCellLiteral ?? circleCellLiterals[0]);
    let circleCells = parsePositionLiterals(circleCellLiterals);
    let arrowCells = parsePositionLiterals(arrowCellLiterals);
    if (split) {
        circleCells = splitMultiLine(circleCells);
        arrowCells = splitMultiLine([arrowStartCell, ...arrowCells]).slice(1);
    } else if (arrowCells[0] && isSamePosition(arrowCells[0], arrowStartCell)) {
        arrowCells = arrowCells.slice(1);
    }

    return {
        name: "arrow",
        props: {
            circleCells,
            arrowCells: [arrowStartCell, ...arrowCells],
            transparentCircle,
        },
        cells: [...circleCells, ...arrowCells],
        component: Arrow,
        isValidCell(cell, digits, cells, context) {
            const {
                puzzle: {
                    typeManager: {
                        getDigitByCellData,
                        getNumberByDigits = defaultGetDefaultNumberByDigits,
                    },
                },
            } = context;

            const circleDigits = circleCells.map((circleCell) => {
                const data = digits[circleCell.top]?.[circleCell.left];
                return data === undefined ? undefined : getDigitByCellData(data, context, circleCell);
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

                const arrowDigit = getDigitByCellData(arrowData, context, arrowCell);
                if (product) {
                    arrowNumber *= arrowDigit;
                } else {
                    arrowNumber += arrowDigit;
                }
            }

            return arrowNumber === circleNumber;
        },
        clone(
            {props: {circleCells, arrowCells, transparentCircle}},
            {processCellCoords},
        ): Constraint<T, ArrowProps> {
            return ArrowConstraint(
                circleCells.map(processCellCoords),
                arrowCells.map(processCellCoords),
                transparentCircle,
                undefined,
                product,
                false,
            );
        },
    };
};
