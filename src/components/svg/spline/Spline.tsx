import {SVGAttributes} from "react";
import {Position} from "../../../types/layout/Position";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

export interface SplineProps extends Omit<SVGAttributes<SVGPathElement>, "points"> {
    points: Position[];
}

export const Spline = observer(function Spline({points: [point1, ...points], ...props}: SplineProps) {
    profiler.trace();

    return <path
        {...props}
        d={[
            "M", point1.left, point1.top,
            ...points.slice(0, -1).flatMap(({left, top}, index) => {
                const {left: left2, top: top2} = points[index + 1];
                const isLast = index === points.length - 2;
                return [
                    "Q", left, top,
                    isLast ? left2 : (left + left2) / 2, isLast ? top2 : (top + top2) / 2,
                ];
            }),
        ].join(" ")}
    />;
});
