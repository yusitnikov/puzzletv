import {useMemo} from "react";
import {blackColor} from "../../../app/globals";
import {
    formatSvgPointsArray,
    parsePositionLiteral,
    parsePositionLiterals,
    Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {getRegionBorders, getRegionBoundingBox} from "../../../../utils/regions";
import {isValidCellForRegion} from "../region/Region";
import {indexes} from "../../../../utils/indexes";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {incrementArrayItemByIndex} from "../../../../utils/array";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {PuzzleDefinition} from "../../../../types/sudoku/PuzzleDefinition";

export const cageTag = "cage";

export interface KillerCageProps {
    sum?: string | number;
    showBottomSum?: boolean;
    sumPointIndex?: number;
    lineColor?: string;
    fontColor?: string;
    largeSum?: boolean;
}

export const KillerCage = {
    [FieldLayer.regular]: <T extends AnyPTM>(
        {
            context: {puzzle},
            cells,
            props: {
                sum,
                showBottomSum,
                sumPointIndex = 0,
                lineColor = blackColor,
                fontColor = blackColor,
                largeSum,
            },
        }: ConstraintProps<T, KillerCageProps>
    ) => {
        const {
            prioritizeSelection,
            typeManager: {
                digitComponentType: {widthCoeff},
            },
        } = puzzle;

        const points = useMemo(() => getRegionBorders(cells, 1), [cells]);

        const boundingBox = useMemo(() => getRegionBoundingBox(cells, 1), [cells]);
        const bottom = boundingBox.top + boundingBox.height;
        const right = useMemo(
            () => Math.max(...cells.filter(cell => cell.top === bottom - 1).map(cell => cell.left)) + 1,
            [cells, bottom]
        );

        const borderPadding = prioritizeSelection ? 0.15 : 0.1;
        const sumPadding = prioritizeSelection ? 0.17 : largeSum ? 0.12 : borderPadding;
        const sumDigitSize = prioritizeSelection || largeSum ? 0.25 : 0.15;

        return <>
            <polygon
                points={formatSvgPointsArray(
                    points
                        .map(({left: x, top: y}, index) => {
                            const {left: prevX, top: prevY} = incrementArrayItemByIndex(points, index, -1);
                            const {left: nextX, top: nextY} = incrementArrayItemByIndex(points, index);
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
                    puzzle={puzzle}
                    sum={sum}
                    size={sumDigitSize}
                    left={points[sumPointIndex].left + sumPadding - sumDigitSize * widthCoeff / 2}
                    top={points[sumPointIndex].top + sumPadding}
                    color={fontColor}
                />

                {showBottomSum && <KillerCageSum
                    puzzle={puzzle}
                    sum={sum}
                    size={sumDigitSize}
                    left={right - sumPadding - sumDigitSize * widthCoeff * (sum.toString().length - 0.5)}
                    top={bottom - sumPadding}
                    color={fontColor}
                />}
            </>}
        </>;
    },
};

interface KillerCageSumProps<T extends AnyPTM> extends Position {
    puzzle: PuzzleDefinition<T>;
    sum: string | number;
    size: number;
    color?: string;
}

const KillerCageSum = <T extends AnyPTM>({puzzle, sum, size, color = blackColor, left, top}: KillerCageSumProps<T>) => {
    const {
        typeManager: {
            digitComponentType: {
                svgContentComponent: DigitSvgContent,
                widthCoeff,
            },
        },
    } = puzzle;

    return <>
        <rect
            x={left}
            y={top - size / 2}
            width={size * widthCoeff * sum.toString().length}
            height={size}
            fill={"white"}
        />

        {typeof sum === "number" && sum.toString().split("").map((digit, index) => <DigitSvgContent
            key={`digit-${index}`}
            puzzle={puzzle}
            digit={Number(digit)}
            size={size}
            left={left + size * widthCoeff * (index + 0.5)}
            top={top}
            color={color}
        />)}

        {typeof sum === "string" && sum.split("").map((character, index) => <CenteredText
            key={`character-${index}`}
            size={size}
            left={left + size * widthCoeff * (index + 0.5)}
            top={top}
            fill={color}
        >
            {character}
        </CenteredText>)}
    </>;
};

export const DecorativeCageConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    sum?: string | number,
    showBottomSum?: boolean,
    sumPointIndex?: number,
    lineColor?: string,
    fontColor?: string
): Constraint<T, KillerCageProps> => ({
    name: "cage",
    tags: [cageTag],
    cells: parsePositionLiterals(cellLiterals),
    props: {
        sum,
        showBottomSum,
        sumPointIndex,
        lineColor,
        fontColor,
    },
    component: KillerCage,
});

export const KillerCageConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    sum?: number,
    showBottomSum?: boolean,
    sumPointIndex?: number,
    lineColor?: string,
    fontColor?: string
): Constraint<T, KillerCageProps> => ({
    ...DecorativeCageConstraint(cellLiterals, sum, showBottomSum, sumPointIndex, lineColor, fontColor),
    name: "killer cage",
    isObvious: true,
    isValidCell(
        cell,
        digits,
        cells,
        context,
        constraints,
        isFinalCheck,
        onlyObvious
    ) {
        const {puzzle, state} = context;

        if (!isValidCellForRegion(cells, cell, digits, puzzle, state)) {
            return false;
        }

        if (sum === undefined || onlyObvious) {
            return true;
        }

        let realSum = 0;

        for (const constraintCell of cells) {
            const constraintDigit = digits[constraintCell.top]?.[constraintCell.left];

            if (constraintDigit === undefined) {
                return true;
            }

            realSum += puzzle.typeManager.getDigitByCellData(constraintDigit, context, constraintCell);
        }

        const expectedSum = puzzle.typeManager.transformNumber
            ? puzzle.typeManager.transformNumber(sum, context, cells[0])
            : sum;

        return realSum === expectedSum;
    },
});

export const KillerCageConstraintByRect = <T extends AnyPTM>(
    topLeft: PositionLiteral,
    width: number,
    height: number,
    sum?: number,
    showBottomSum?: boolean,
    sumPointIndex?: number,
) => {
    const {top, left} = parsePositionLiteral(topLeft);

    return KillerCageConstraint<T>(
        indexes(height).flatMap(dy => indexes(width).map(dx => ({top: top + dy, left: left + dx}))),
        sum,
        showBottomSum,
        sumPointIndex,
    );
};
