import {Fragment, SVGAttributes} from "react";
import {Position} from "../../../types/layout/Position";

export interface RoundedPolyLineProps extends Omit<SVGAttributes<SVGLineElement>, "points"> {
    points: Position[];
}

export const RoundedPolyLine = ({points, ...lineProps}: RoundedPolyLineProps) => <>
    <circle key={"first-circle"} cx={points[0].left} cy={points[0].top} r={(lineProps.strokeWidth! as number) / 2} fill={lineProps.stroke}/>

    {points.map(({left: x1, top: y1}, index) => {
        if (!points[index + 1]) {
            return undefined;
        }

        const {left: x2, top: y2} = points[index + 1];

        return <Fragment key={`line-${index}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} {...lineProps}/>

            <circle cx={x2} cy={y2} r={(lineProps.strokeWidth! as number) / 2} fill={lineProps.stroke}/>
        </Fragment>;
    })}
</>;
