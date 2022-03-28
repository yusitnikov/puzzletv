import {RoundedPolyLine, RoundedPolyLineProps} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {lightGreyColor} from "../../../app/globals";

export const Thermometer = (props: RoundedPolyLineProps) => <>
    <circle
        cx={props.points[0][0]}
        cy={props.points[0][1]}
        r={0.4}
        fill={lightGreyColor}
    />

    <RoundedPolyLine
        strokeWidth={0.35}
        stroke={lightGreyColor}
        {...props}
    />
</>;
