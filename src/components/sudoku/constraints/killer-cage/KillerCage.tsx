import {useMemo} from "react";
import {blackColor} from "../../../app/globals";
import {
    formatSvgPointsArray,
    parsePositionLiteral,
    parsePositionLiterals,
    Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {useDigitComponentType} from "../../../../contexts/DigitComponentTypeContext";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {getRegionBorders, getRegionBoundingBox} from "../../../../utils/regions";
import {isValidCellForRegion} from "../region/Region";
import {indexes} from "../../../../utils/indexes";
import {CenteredText} from "../../../svg/centered-text/CenteredText";

const borderPadding = 0.1;
const sumDigitSize = 0.15;

export interface KillerCageProps {
    sum?: string | number;
    showBottomSum?: boolean;
    lineColor?: string;
    fontColor?: string;
}

export const KillerCage = withFieldLayer(FieldLayer.regular, (
    {cells, sum, showBottomSum, lineColor = blackColor, fontColor = blackColor}: ConstraintProps<any, KillerCageProps>
) => {
    const {widthCoeff} = useDigitComponentType();

    const points = useMemo(() => getRegionBorders(cells), [cells]);

    const boundingBox = useMemo(() => getRegionBoundingBox(cells), [cells]);
    const bottom = boundingBox.top + boundingBox.height;
    const right = useMemo(
        () => Math.max(...cells.filter(cell => cell.top === bottom - 1).map(cell => cell.left)) + 1,
        [cells, bottom]
    );

    return <>
        <polygon
            points={formatSvgPointsArray(
                points
                    .map(({left: x, top: y}, index) => {
                        const {left: prevX, top: prevY} = points[(index + points.length - 1) % points.length];
                        const {left: nextX, top: nextY} = points[(index + 1) % points.length];
                        const prevDirX = Math.sign(x - prevX);
                        const prevDirY = Math.sign(y - prevY);
                        const nextDirX = Math.sign(nextX - x);
                        const nextDirY = Math.sign(nextY - y);

                        return {
                            left: x + borderPadding * (nextDirY + prevDirY),
                            top: y - borderPadding * (nextDirX + prevDirX)
                        };
                    })
            )}
            strokeWidth={0.02}
            strokeDasharray={0.15}
            stroke={lineColor}
            fill={"none"}
        />

        {sum && <>
            <KillerCageSum
                sum={sum}
                left={points[0].left + borderPadding - sumDigitSize * widthCoeff / 2}
                top={points[0].top + borderPadding}
                color={fontColor}
            />

            {showBottomSum && <KillerCageSum
                sum={sum}
                left={right - borderPadding - sumDigitSize * widthCoeff * (sum.toString().length - 0.5)}
                top={bottom - borderPadding}
                color={fontColor}
            />}
        </>}
    </>;
});

interface KillerCageSumProps extends Position {
    sum: string | number;
    color?: string;
}

const KillerCageSum = ({sum, color = blackColor, left, top}: KillerCageSumProps) => {
    const {
        svgContentComponent: DigitSvgContent,
        widthCoeff,
    } = useDigitComponentType();

    return <>
        <rect
            x={left}
            y={top - sumDigitSize / 2}
            width={sumDigitSize * widthCoeff * sum.toString().length}
            height={sumDigitSize}
            fill={"white"}
        />

        {typeof sum === "number" && sum.toString().split("").map((digit, index) => <DigitSvgContent
            key={`digit-${index}`}
            digit={Number(digit)}
            size={sumDigitSize}
            left={left + sumDigitSize * widthCoeff * (index + 0.5)}
            top={top}
            color={color}
        />)}

        {typeof sum === "string" && sum.split("").map((character, index) => <CenteredText
            key={`character-${index}`}
            size={sumDigitSize}
            left={left + sumDigitSize * widthCoeff * (index + 0.5)}
            top={top}
            fill={color}
        >
            {character}
        </CenteredText>)}
    </>;
};

export const DecorativeCageConstraint = <CellType,>(
    cellLiterals: PositionLiteral[],
    sum?: string | number,
    showBottomSum?: boolean,
    lineColor?: string,
    fontColor?: string
): Constraint<CellType, KillerCageProps> => ({
    name: "cage",
    cells: parsePositionLiterals(cellLiterals),
    sum,
    showBottomSum,
    lineColor,
    fontColor,
    component: KillerCage,
});

export const KillerCageConstraint = <CellType,>(
    cellLiterals: PositionLiteral[],
    sum?: number,
    showBottomSum?: boolean,
    lineColor?: string,
    fontColor?: string
): Constraint<CellType, KillerCageProps> => ({
    ...DecorativeCageConstraint(cellLiterals, sum, showBottomSum, lineColor, fontColor),
    name: "killer cage",
    isValidCell(cell, digits, cells, {puzzle, state}) {
        if (!isValidCellForRegion(cells, cell, digits, puzzle, state)) {
            return false;
        }

        if (sum === undefined) {
            return true;
        }

        let realSum = 0;

        for (const constraintCell of cells) {
            const constraintDigit = digits[constraintCell.top]?.[constraintCell.left];

            if (constraintDigit === undefined) {
                return true;
            }

            realSum += puzzle.typeManager.getDigitByCellData(constraintDigit, state);
        }

        const expectedSum = puzzle.typeManager.transformDigit
            ? puzzle.typeManager.transformDigit(sum, puzzle, state)
            : sum;

        return realSum === expectedSum;
    },
});

export const KillerCageConstraintByRect = <CellType,>(topLeft: PositionLiteral, width: number, height: number, sum?: number, showBottomSum?: boolean) => {
    const {top, left} = parsePositionLiteral(topLeft);

    return KillerCageConstraint<CellType>(
        indexes(height).flatMap(dy => indexes(width).map(dx => ({top: top + dy, left: left + dx}))),
        sum,
        showBottomSum
    );
};
