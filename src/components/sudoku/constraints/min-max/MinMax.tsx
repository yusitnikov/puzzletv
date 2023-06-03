import {lightGreyColor, textColor} from "../../../app/globals";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    formatSvgPointsArray,
    isSamePosition,
    parsePositionLiteral,
    PositionLiteral
} from "../../../../types/layout/Position";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

const arrowWidth = 0.1;
const arrowHeight = 0.05;

export interface MinMaxProps {
    coeff: number;
}

export const MinMax: ConstraintPropsGenericFcMap<MinMaxProps> = {
    [FieldLayer.beforeSelection]: observer(function MinMaxRect<T extends AnyPTM>({cells: [{left, top}]}: ConstraintProps<T, MinMaxProps>) {
        profiler.trace();

        return <rect
            x={left}
            y={top}
            width={1}
            height={1}
            fill={lightGreyColor}
            fillOpacity={0.5}
        />;
    }),
    [FieldLayer.regular]: observer(function MinMaxArrows<T extends AnyPTM>({cells: [{left, top}], props: {coeff}}: ConstraintProps<T, MinMaxProps>) {
        profiler.trace();

        left += 0.5;
        top += 0.5;

        return <>
            <Arrow cx={left} cy={top} dx={1} dy={0} coeff={coeff}/>
            <Arrow cx={left} cy={top} dx={-1} dy={0} coeff={coeff}/>
            <Arrow cx={left} cy={top} dx={0} dy={1} coeff={coeff}/>
            <Arrow cx={left} cy={top} dx={0} dy={-1} coeff={coeff}/>
        </>;
    }),
}

interface ArrowProps {
    cx: number;
    cy: number;
    dx: number;
    dy: number;
    coeff: number;
}

const Arrow = observer(function ArrowFc({cx, cy, dx, dy, coeff}: ArrowProps) {
    profiler.trace();

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
});

const MinMaxConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral,
    name: string,
    coeff: number
): Constraint<T, MinMaxProps> => {
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
        component: MinMax,
        renderSingleCellInUserArea: true,
        props: {coeff},
        isObvious: true,
        isValidCell(cell, digits, [mainCell, ...neighborCells], context) {
            const {typeManager: {compareCellData}} = context.puzzle;
            const digit = digits[cell.top][cell.left]!;

            const mainDigit = digits[mainCell.top]?.[mainCell.left];
            if (mainDigit === undefined) {
                return true;
            }

            return isSamePosition(cell, mainCell)
                ? neighborCells.every(({left, top}) => {
                    const neighborDigit = digits[top]?.[left];
                    return neighborDigit === undefined || compareCellData(mainDigit, neighborDigit, context) * coeff > 0;
                })
                : compareCellData(mainDigit, digit, context) * coeff > 0;
        },
    });
};

export const MinConstraint = <T extends AnyPTM>(cellLiteral: PositionLiteral) =>
    MinMaxConstraint<T>(cellLiteral, "min", -1);
export const MaxConstraint = <T extends AnyPTM>(cellLiteral: PositionLiteral) =>
    MinMaxConstraint<T>(cellLiteral, "max", 1);
