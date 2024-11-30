import { formatSvgPointsArray, normalizeVector, Position } from "../../../types/layout/Position";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";

export interface ArrowEndProps {
    position: Position;
    direction: Position;
    arrowSize: number;
    lineWidth: number;
    color: string;
}

export const ArrowEnd = observer(function ArrowEnd({
    position: { left, top },
    direction,
    arrowSize,
    lineWidth,
    color,
}: ArrowEndProps) {
    profiler.trace();

    const { top: dirTop, left: dirLeft } = normalizeVector(direction);

    return (
        <polyline
            strokeWidth={lineWidth}
            stroke={color}
            fill={"none"}
            points={formatSvgPointsArray([
                {
                    top: top + arrowSize * (-dirTop - dirLeft),
                    left: left + arrowSize * (-dirLeft + dirTop),
                },
                { top, left },
                {
                    top: top + arrowSize * (-dirTop + dirLeft),
                    left: left + arrowSize * (-dirLeft - dirTop),
                },
            ])}
        />
    );
});
