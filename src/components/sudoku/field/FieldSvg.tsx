import {PropsWithChildren} from "react";
import {svgShadowStyle} from "../../app/globals";
import {Absolute} from "../../layout/absolute/Absolute";

export interface FieldSvgProps {
    fieldSize: number;
    cellSize: number;
}

export const FieldSvg = ({fieldSize, cellSize, children}: PropsWithChildren<FieldSvgProps>) => <Absolute
    tagName={"svg"}
    width={cellSize * fieldSize}
    height={cellSize * fieldSize}
    viewBox={`0 0 ${fieldSize} ${fieldSize}`}
    style={svgShadowStyle}
>
    {children}
</Absolute>;
