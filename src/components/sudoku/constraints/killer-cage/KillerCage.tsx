import {ReactElement, useMemo} from "react";
import {blackColor} from "../../../app/globals";
import {
    formatSvgPointsArray,
    parsePositionLiteral,
    parsePositionLiterals,
    Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../../types/sudoku/Constraint";
import {getRegionBorders, getRegionBoundingBox} from "../../../../utils/regions";
import {isValidCellForRegion} from "../region/Region";
import {indexes} from "../../../../utils/indexes";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {incrementArrayItemByIndex} from "../../../../utils/array";
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";
import {PuzzleDefinition} from "../../../../types/sudoku/PuzzleDefinition";
import {useTransformAngle} from "../../../../contexts/TransformContext";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../../utils/profiler";

export const cageTag = "cage";

export interface KillerCageProps {
    sum?: string | number;
    showBottomSum?: boolean;
    sumPointIndex?: number;
    lineColor?: string;
    fontColor?: string;
    largeSum?: boolean;
    inverted?: boolean;
}

export const KillerCage: ConstraintPropsGenericFcMap<KillerCageProps> = {
    [FieldLayer.regular]: observer(function KillerCage<T extends AnyPTM>(
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
                inverted,
            },
        }: ConstraintProps<T, KillerCageProps>
    ) {
        profiler.trace();

        const {
            prioritizeSelection,
            typeManager: {compensateConstraintDigitAngle},
        } = puzzle;

        const points = useMemo(() => getRegionBorders(cells, 1), [cells]);

        const boundingBox = useMemo(() => getRegionBoundingBox(cells, 1), [cells]);
        const bottom = boundingBox.top + boundingBox.height;
        const right = useMemo(
            () => Math.max(...cells.filter(cell => cell.top === bottom - 1).map(cell => cell.left)) + 1,
            [cells, bottom]
        );

        const borderPadding = (inverted ? -1 : 1) * (prioritizeSelection ? 0.15 : 0.1);
        const sumPadding = prioritizeSelection ? 0.17 : largeSum ? 0.12 : borderPadding;
        const sumDigitSize = prioritizeSelection || largeSum ? 0.25 : 0.15;

        let angle = useTransformAngle();
        if (!compensateConstraintDigitAngle) {
            angle = 0;
        }

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
                    left={points[sumPointIndex].left + sumPadding}
                    top={points[sumPointIndex].top + sumPadding}
                    color={fontColor}
                    angle={angle}
                />

                {showBottomSum && <KillerCageSum
                    puzzle={puzzle}
                    sum={sum}
                    size={sumDigitSize}
                    left={right - sumPadding}
                    top={bottom - sumPadding}
                    color={fontColor}
                    angle={angle}
                    reverse={true}
                />}
            </>}
        </>;
    }),
};

interface KillerCageSumProps<T extends AnyPTM> extends Position {
    puzzle: PuzzleDefinition<T>;
    sum: string | number;
    size: number;
    color?: string;
    angle?: number;
    reverse?: boolean;
}

const KillerCageSum = observer(function KillerCageSum<T extends AnyPTM>(
    {puzzle, sum, size, color = blackColor, left, top, reverse, angle = 0}: KillerCageSumProps<T>
) {
    profiler.trace();

    const {
        typeManager: {
            digitComponentType: {
                svgContentComponent: DigitSvgContent,
                widthCoeff,
            },
        },
    } = puzzle;

    const width = size * widthCoeff * sum.toString().length;

    return <AutoSvg
        top={top}
        left={left}
        angle={-angle}
    >
        <AutoSvg left={(width - size * widthCoeff) / 2 * Math.cos((angle + (reverse ? 180 : 0) + 45) * Math.PI / 180) / Math.cos(Math.PI / 4) - width / 2}>
            <rect
                x={0}
                y={-size / 2}
                width={width}
                height={size}
                fill={["white", "#fff", "#ffffff"].includes(color.toLowerCase()) ? "#000" : "#fff"}
            />

            {typeof sum === "number" && sum.toString().split("").map((digit, index) => <DigitSvgContent
                key={`digit-${index}`}
                puzzle={puzzle}
                digit={Number(digit)}
                size={size}
                left={size * widthCoeff * (index + 0.5)}
                top={0}
                color={color}
            />)}

            {typeof sum === "string" && sum.split("").map((character, index) => <CenteredText
                key={`character-${index}`}
                size={size}
                left={size * widthCoeff * (index + 0.5)}
                top={0}
                fill={color}
            >
                {character}
            </CenteredText>)}
        </AutoSvg>
    </AutoSvg>;
}) as <T extends AnyPTM>(props: KillerCageSumProps<T>) => ReactElement;

export const DecorativeCageConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    sum?: string | number,
    showBottomSum?: boolean,
    sumPointIndex?: number,
    lineColor?: string,
    fontColor?: string,
    largeSum = false,
    inverted = false,
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
        largeSum,
        inverted,
    },
    component: KillerCage,
});

export const KillerCageConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    sum?: number,
    showBottomSum?: boolean,
    sumPointIndex?: number,
    lineColor?: string,
    fontColor?: string,
    largeSum = false,
    inverted = false,
): Constraint<T, KillerCageProps> => ({
    ...DecorativeCageConstraint(cellLiterals, sum, showBottomSum, sumPointIndex, lineColor, fontColor, largeSum, inverted),
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
        const {puzzle} = context;

        if (!isValidCellForRegion(cells, cell, digits, context)) {
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

export const isCageConstraint = <T extends AnyPTM>(item: Constraint<T, any>): item is Constraint<T, KillerCageProps> => !!item.tags?.includes(cageTag);
