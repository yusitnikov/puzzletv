import {Fragment, SVGAttributes} from "react";

export interface RoundedPolyLineProps extends Omit<SVGAttributes<SVGLineElement>, "points"> {
    points: [number, number][];
}

export const RoundedPolyLine = ({points, ...lineProps}: RoundedPolyLineProps) => <>
    <circle key={"first-circle"} cx={points[0][0]} cy={points[0][1]} r={(lineProps.strokeWidth! as number) / 2} fill={lineProps.stroke}/>

    {points.map(([x1, y1], index) => {
        if (!points[index + 1]) {
            return undefined;
        }

        const [x2, y2] = points[index + 1];

        return <Fragment key={`line-${index}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} {...lineProps}/>

            <circle cx={x2} cy={y2} r={(lineProps.strokeWidth! as number) / 2} fill={lineProps.stroke}/>
        </Fragment>;
    })}
</>;
