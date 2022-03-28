import {SVGAttributes} from "react";
import {blackColor} from "../../../app/globals";
import {digitSpaceCoeff, DigitSvgContent} from "../../digit/Digit";
import {Position} from "../../../../types/layout/Position";

const borderPadding = 0.1;
const sumDigitSize = 0.15;

export interface KillerCageProps extends Omit<SVGAttributes<SVGPolygonElement>, "points"> {
    points: [number, number][];
    sum?: number;
    bottomSumPointIndex?: number;
}

export const KillerCage = ({points, sum, bottomSumPointIndex, ...polygonProps}: KillerCageProps) => <>
    <polygon
        points={
            points
                .map(([x, y], index) => {
                    const [prevX, prevY] = points[(index + points.length - 1) % points.length];
                    const [nextX, nextY] = points[(index + 1) % points.length];
                    const prevDirX = Math.sign(x - prevX);
                    const prevDirY = Math.sign(y - prevY);
                    const nextDirX = Math.sign(nextX - x);
                    const nextDirY = Math.sign(nextY - y);

                    return [
                        x + borderPadding * (nextDirY + prevDirY),
                        y - borderPadding * (nextDirX + prevDirX)
                    ];
                })
                .map(([x, y]) => `${x},${y}`)
                .join(" ")
        }
        strokeWidth={0.02}
        strokeDasharray={0.15}
        stroke={blackColor}
        fill={"none"}
        {...polygonProps}
    />

    {sum && <>
        <KillerCageSum
            sum={sum}
            left={points[0][0] + borderPadding - sumDigitSize * digitSpaceCoeff / 2}
            top={points[0][1] + borderPadding}
        />

        {bottomSumPointIndex && <KillerCageSum
            sum={sum}
            left={points[bottomSumPointIndex][0] - borderPadding - sumDigitSize * digitSpaceCoeff * (sum.toString().length - 0.5)}
            top={points[bottomSumPointIndex][1] - borderPadding}
        />}
    </>}
</>;

interface KillerCageSumProps extends Position {
    sum: number;
}

const KillerCageSum = ({sum, left, top}: KillerCageSumProps) => <>
    <rect
        x={left}
        y={top - sumDigitSize / 2}
        width={sumDigitSize * digitSpaceCoeff * sum.toString().length}
        height={sumDigitSize}
        fill={"white"}
    />

    {sum.toString().split("").map((digit, index) => <DigitSvgContent
        key={`digit-${index}`}
        digit={Number(digit)}
        size={sumDigitSize}
        left={left + sumDigitSize * digitSpaceCoeff * (index + 0.5)}
        top={top}
    />)}
</>;
