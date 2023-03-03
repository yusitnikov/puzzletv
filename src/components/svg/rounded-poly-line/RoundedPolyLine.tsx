import {Fragment, SVGAttributes} from "react";
import {Position} from "../../../types/layout/Position";

export interface PolyLinePoint extends Position {
    radius?: number;
}

export interface RoundedPolyLineProps extends Omit<SVGAttributes<SVGLineElement>, "points"> {
    points: PolyLinePoint[];
}

export const RoundedPolyLine = ({points, strokeWidth, ...lineProps}: RoundedPolyLineProps) => {
    const defaultRadius = (strokeWidth! as number) / 2;

    return <>
        <circle key={"first-circle"} cx={points[0].left} cy={points[0].top}
                r={points[0].radius ?? defaultRadius} fill={lineProps.stroke}/>

        {points.map(({left: x1, top: y1, radius: r1 = defaultRadius}, index) => {
            if (!points[index + 1]) {
                return undefined;
            }

            const {left: x2, top: y2, radius: r2 = defaultRadius} = points[index + 1];

            return <Fragment key={`line-${index}`}>
                {/*TODO: support points with different radius*/}
                <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={Math.min(r1, r2) * 2} {...lineProps}/>

                <circle cx={x2} cy={y2} r={r2} fill={lineProps.stroke}/>
            </Fragment>;
        })}
    </>;
};
