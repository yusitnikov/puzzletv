import {SVGAttributes} from "react";
import {Position} from "../../../types/layout/Position";

export interface CenteredTextProps extends Partial<Position>, Omit<SVGAttributes<SVGTextElement>, "x" | "y"> {
    size: number;
}

export const CenteredText = ({left = 0, top = 0, size, fill = "currentColor", style, children, ...otherProps}: CenteredTextProps) => <text
    x={left}
    y={top}
    textAnchor={"middle"}
    dominantBaseline={"middle"}
    alignmentBaseline={"central"}
    style={{
        ...style,
        fontSize: `${size}px`,
        lineHeight: `${size}px`,
    }}
    fill={fill}
    {...otherProps}
>
    {children}
</text>;
