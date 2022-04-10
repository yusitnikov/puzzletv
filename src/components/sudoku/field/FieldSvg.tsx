import {PropsWithChildren} from "react";
import {svgShadowStyle} from "../../app/globals";
import {Absolute} from "../../layout/absolute/Absolute";

export interface FieldSvgProps {
    fieldSize: number;
    fieldMargin?: number;
    cellSize: number;
}

export const FieldSvg = ({fieldSize, fieldMargin = 0, cellSize, children}: PropsWithChildren<FieldSvgProps>) => <Absolute
    tagName={"svg"}
    width={cellSize * (fieldSize + 2 * fieldMargin)}
    height={cellSize * (fieldSize + 2 * fieldMargin)}
    viewBox={`${-fieldMargin} ${-fieldMargin} ${fieldSize + 2 * fieldMargin} ${fieldSize + 2 * fieldMargin}`}
    style={svgShadowStyle}
>
    {children}
</Absolute>;
