import {Fragment, memo} from "react";
import {formatSvgPointsArray, getLineVector, normalizeVector, Position} from "../../../types/layout/Position";

export interface PolyLinePoint extends Position {
    radius?: number;
}

export interface RoundedPolyLineProps {
    points: PolyLinePoint[];
    strokeWidth: number;
    stroke: string;
}

export const RoundedPolyLine = ({points, strokeWidth, stroke}: RoundedPolyLineProps) => {
    const defaultRadius = strokeWidth / 2;

    return <>
        <circle key={"first-circle"} cx={points[0].left} cy={points[0].top}
                r={points[0].radius ?? defaultRadius} fill={stroke}/>

        {points.map((start, index) => {
            const end = points[index + 1];
            if (!end) {
                return undefined;
            }

            return <Fragment key={`line-${index}`}>
                <RoundedLineSegment start={start} end={end} defaultRadius={defaultRadius} color={stroke}/>

                <circle cx={end.left} cy={end.top} r={end.radius ?? defaultRadius} fill={stroke}/>
            </Fragment>;
        })}
    </>;
};

interface RoundedLineSegmentProps {
    start: PolyLinePoint;
    end: PolyLinePoint;
    defaultRadius: number;
    color: string;
}

const RoundedLineSegment = memo<RoundedLineSegmentProps>(
    ({start, end, defaultRadius, color}) => {
        const {left: x1, top: y1, radius: r1 = defaultRadius} = start;
        const {left: x2, top: y2, radius: r2 = defaultRadius} = end;

        if (r1 === r2) {
            return <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={r1 * 2} stroke={color}/>;
        }

        const direction = normalizeVector(getLineVector({start, end}));

        return <polygon
            points={formatSvgPointsArray([
                {p: start, r: r1},
                {p: end, r: r2},
                {p: end, r: -r2},
                {p: start, r: -r1},
            ].map(({p: {top, left}, r}) => ({
                top: top + r * direction.left,
                left: left - r * direction.top,
            })))}
            fill={color}
            stroke={"none"}
            strokeWidth={0}
        />;
    },
    (prevProps, nextProps) => JSON.stringify(prevProps) === JSON.stringify(nextProps)
);
