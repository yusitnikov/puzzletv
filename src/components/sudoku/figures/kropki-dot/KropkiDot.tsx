import {SVGAttributes} from "react";
import {blackColor} from "../../../app/globals";

export interface KropkiDotProps extends SVGAttributes<SVGCircleElement> {
    isFilled?: boolean;
}

export const KropkiDot = ({isFilled, ...circleProps}: KropkiDotProps) => <circle
    r={0.2}
    strokeWidth={0.02}
    stroke={blackColor}
    fill={isFilled ? blackColor : "white"}
    {...circleProps}
/>;
