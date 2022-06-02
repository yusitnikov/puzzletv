import {formatSvgPointsArray, normalizeVector, Position} from "../../../types/layout/Position";
import {RoundedPolyLine} from "../rounded-poly-line/RoundedPolyLine";

export interface ArrowEndProps {
    position: Position;
    direction: Position;
    arrowSize: number;
    lineWidth: number;
    color: string;
}

export const ArrowEnd = ({position: {left, top}, direction, arrowSize, lineWidth, color}: ArrowEndProps) => {
    const {top: dirTop, left: dirLeft} = normalizeVector(direction);

    return <polyline
        strokeWidth={lineWidth}
        stroke={color}
        fill={"none"}
        points={formatSvgPointsArray([
            {
                top: top + arrowSize * (-dirTop - dirLeft),
                left: left + arrowSize * (-dirLeft + dirTop),
            },
            {top, left},
            {
                top: top + arrowSize * (-dirTop + dirLeft),
                left: left + arrowSize * (-dirLeft - dirTop),
            },
        ])}
    />;
};
