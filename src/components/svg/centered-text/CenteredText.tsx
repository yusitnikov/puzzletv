import {SVGAttributes} from "react";
import {Position} from "../../../types/layout/Position";

export interface CenteredTextProps extends Partial<Position>, Omit<SVGAttributes<SVGTextElement>, "x" | "y"> {
    size: number;
}

export const CenteredText = ({left = 0, top = 0, size, fill = "currentColor", style, children, ...otherProps}: CenteredTextProps) => <text
    x={left}
    y={top + size * 0.37}
    textAnchor={"middle"}
    style={{
        ...style,
        fontSize: `${size}px`,
        lineHeight: `${size}px`,
    }}
    fill={fill}
    {...otherProps}
>
    {typeof children === "string" ? children.replace(/ /g, "\xa0") : children}
</text>;
