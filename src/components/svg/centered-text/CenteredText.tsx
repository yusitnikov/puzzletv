import { SVGAttributes } from "react";
import { Position } from "../../../types/layout/Position";

export interface CenteredTextProps extends Partial<Position>, Omit<SVGAttributes<SVGTextElement>, "x" | "y"> {
    size: number;
}

export const CenteredText = ({
    left = 0,
    top = 0,
    size,
    fill = "currentColor",
    style,
    children,
    ...otherProps
}: CenteredTextProps) => {
    let linesCount = 1;

    // SVG text offset
    top += size * 0.37;

    if (typeof children === "string") {
        children = children.replace(/ /g, "\xa0");

        const lines = children.toString().split("\n");
        linesCount = lines.length;
        if (linesCount > 1) {
            children = lines.map((line, index) => (
                <tspan key={index} x={left} y={top + (index - (linesCount - 1) / 2) * size}>
                    {line}
                </tspan>
            ));
        }
    }

    return (
        <text
            x={left}
            y={top}
            textAnchor={"middle"}
            style={{
                ...style,
                fontSize: `${size}px`,
                lineHeight: `${size}px`,
            }}
            fill={fill}
            {...otherProps}
        >
            {children}
        </text>
    );
};
