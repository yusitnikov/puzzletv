import {lightGreyColor, textColor} from "../../../app/globals";
import {ComponentType, memo, ReactElement} from "react";
import {useFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    formatSvgPointsArray,
    isSamePosition,
    parsePositionLiteral,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";

const arrowWidth = 0.1;
const arrowHeight = 0.05;

export const MinMax = memo(({cells: [{left, top}], coeff}: ConstraintProps & {coeff: number}) => {
    const layer = useFieldLayer();

    left += 0.5;
    top += 0.5;

    return <>
        {layer === FieldLayer.beforeSelection && <rect
            x={left - 0.5}
            y={top - 0.5}
            width={1}
            height={1}
            fill={lightGreyColor}
            fillOpacity={0.5}
        />}

        {layer === FieldLayer.regular && <>
            <Arrow cx={left} cy={top} dx={1} dy={0} coeff={coeff}/>
            <Arrow cx={left} cy={top} dx={-1} dy={0} coeff={coeff}/>
            <Arrow cx={left} cy={top} dx={0} dy={1} coeff={coeff}/>
            <Arrow cx={left} cy={top} dx={0} dy={-1} coeff={coeff}/>
        </>}
    </>;
}) as <CellType, ExType, ProcessedExType>(props: ConstraintProps<CellType, undefined, ExType, ProcessedExType> & {coeff: number}) => ReactElement;

export const Min = <CellType, ExType, ProcessedExType>(props: ConstraintProps<CellType, undefined, ExType, ProcessedExType>) =>
    <MinMax coeff={-1} {...props}/>;

export const Max = <CellType, ExType, ProcessedExType>(props: ConstraintProps<CellType, undefined, ExType, ProcessedExType>) =>
    <MinMax coeff={1} {...props}/>;

interface ArrowProps {
    cx: number;
    cy: number;
    dx: number;
    dy: number;
    coeff: number;
}

const Arrow = ({cx, cy, dx, dy, coeff}: ArrowProps) => {
    const start = 0.5 - arrowHeight * (1.5 - 0.5 * coeff);
    cx += start * dx;
    cy += start * dy;
    dx *= coeff;
    dy *= coeff;

    return <polyline
        points={formatSvgPointsArray([
            {
                left: cx - arrowHeight * dx + arrowWidth * dy,
                top: cy - arrowHeight * dy + arrowWidth * dx
            },
            {
                left: cx,
                top: cy
            },
            {
                left: cx - arrowHeight * dx - arrowWidth * dy,
                top: cy - arrowHeight * dy - arrowWidth * dx
            },
        ])}
        stroke={textColor}
        strokeWidth={arrowHeight / 2}
        fill={"none"}
    />;
};

export const MinMaxConstraint = <CellType, ExType, ProcessedExType>(
    cellLiteral: PositionLiteral,
    name: string,
    component: ComponentType<ConstraintProps<CellType, undefined, ExType, ProcessedExType>>,
    coeff: number
): Constraint<CellType, undefined, ExType, ProcessedExType> => {
    const mainCell = parsePositionLiteral(cellLiteral);

    return ({
        name,
        cells: [
            mainCell,
            {left: mainCell.left - 1, top: mainCell.top},
            {left: mainCell.left + 1, top: mainCell.top},
            {left: mainCell.left, top: mainCell.top - 1},
            {left: mainCell.left, top: mainCell.top + 1},
        ],
        component,
        props: undefined,
        isObvious: true,
        isValidCell(cell, digits, [mainCell, ...neighborCells], {puzzle: {typeManager: {compareCellData}}, state}) {
            const digit = digits[cell.top][cell.left]!;

            const mainDigit = digits[mainCell.top]?.[mainCell.left];
            if (mainDigit === undefined) {
                return true;
            }

            return isSamePosition(cell, mainCell)
                ? neighborCells.every(({left, top}) => {
                    const neighborDigit = digits[top]?.[left];
                    return neighborDigit === undefined || compareCellData(mainDigit, neighborDigit, state, true) * coeff > 0;
                })
                : compareCellData(mainDigit, digit, state, true) * coeff > 0;
        },
    });
};

export const MinConstraint = <CellType, ExType, ProcessedExType>(cellLiteral: PositionLiteral) =>
    MinMaxConstraint<CellType, ExType, ProcessedExType>(cellLiteral, "min", Min, -1);
export const MaxConstraint = <CellType, ExType, ProcessedExType>(cellLiteral: PositionLiteral) =>
    MinMaxConstraint<CellType, ExType, ProcessedExType>(cellLiteral, "max", Max, 1);
