import { SVGAttributes } from "react";
import { Position } from "../../../types/layout/Position";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface SplineLoopProps extends Omit<SVGAttributes<SVGPathElement>, "points"> {
    points: Position[];
}

export const SplineLoop = observer(function SplineLoop({ points, ...props }: SplineLoopProps) {
    profiler.trace();

    return (
        <path
            {...props}
            d={[
                "M",
                (points[0].left + points[points.length - 1].left) / 2,
                (points[0].top + points[points.length - 1].top) / 2,
                ...points.flatMap(({ left, top }, index) => {
                    const { left: left2, top: top2 } = points[(index + 1) % points.length];
                    return ["Q", left, top, (left + left2) / 2, (top + top2) / 2];
                }),
                "z",
            ].join(" ")}
        />
    );
});
