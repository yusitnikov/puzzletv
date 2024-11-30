import { memo } from "react";
import {
    formatSvgPointsArray,
    getLineVector,
    isSamePosition,
    normalizeVector,
    Position,
} from "../../../types/layout/Position";
import { parseColorWithOpacity } from "../../../utils/color";

export interface PolyLinePoint extends Position {
    radius?: number;
}

export interface RoundedPolyLineProps {
    points: PolyLinePoint[];
    strokeWidth: number;
    stroke: string;
    rounded?: boolean;
}

export const RoundedPolyLine = ({ points, strokeWidth, stroke, rounded = true }: RoundedPolyLineProps) => {
    if (points.length === 0) {
        return null;
    }

    const defaultRadius = strokeWidth / 2;

    const firstRadius = points[0].radius ?? defaultRadius;
    const areAllSameWidth = points.every(({ radius = defaultRadius }) => radius === firstRadius);

    if (areAllSameWidth && !rounded) {
        return isSamePosition(points[0], points[points.length - 1]) ? (
            <polygon
                points={formatSvgPointsArray(points.slice(1))}
                strokeWidth={firstRadius * 2}
                stroke={stroke}
                fill={"none"}
            />
        ) : (
            <polyline
                points={formatSvgPointsArray(points)}
                strokeWidth={firstRadius * 2}
                stroke={stroke}
                fill={"none"}
            />
        );
    }

    const { rgb, a } = parseColorWithOpacity(stroke);

    return (
        <g opacity={a}>
            {points.map((start, index) => {
                const end = points[index + 1];
                if (!end) {
                    return undefined;
                }

                return (
                    <RoundedLineSegment
                        key={`line-${index}`}
                        start={start}
                        end={end}
                        defaultRadius={defaultRadius}
                        color={rgb}
                    />
                );
            })}

            {/*note: rendering circles even if `rounded` is false is intended, because it's the case when the line widths are different*/}
            {points.map(({ top, left, radius = defaultRadius }, index) => {
                return <circle key={`circle-${index}`} cx={left} cy={top} r={radius} fill={rgb} />;
            })}
        </g>
    );
};

interface RoundedLineSegmentProps {
    start: PolyLinePoint;
    end: PolyLinePoint;
    defaultRadius: number;
    color: string;
}

const RoundedLineSegment = memo<RoundedLineSegmentProps>(
    ({ start, end, defaultRadius, color }) => {
        const { left: x1, top: y1, radius: r1 = defaultRadius } = start;
        const { left: x2, top: y2, radius: r2 = defaultRadius } = end;

        if (r1 === r2) {
            return <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={r1 * 2} stroke={color} />;
        }

        const direction = normalizeVector(getLineVector({ start, end }));

        return (
            <polygon
                points={formatSvgPointsArray(
                    [
                        { p: start, r: r1 },
                        { p: end, r: r2 },
                        { p: end, r: -r2 },
                        { p: start, r: -r1 },
                    ].map(({ p: { top, left }, r }) => ({
                        top: top + r * direction.left,
                        left: left - r * direction.top,
                    })),
                )}
                fill={color}
                stroke={"none"}
                strokeWidth={0}
            />
        );
    },
    (prevProps, nextProps) => JSON.stringify(prevProps) === JSON.stringify(nextProps),
);
