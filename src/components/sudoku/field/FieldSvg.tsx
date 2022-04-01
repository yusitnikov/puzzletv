import {PropsWithChildren} from "react";
import {svgShadowStyle} from "../../app/globals";
import {Absolute} from "../../layout/absolute/Absolute";

export interface FieldSvgProps {
    cellSize: number;
}

export const FieldSvg = ({cellSize, children}: PropsWithChildren<FieldSvgProps>) => <Absolute
    tagName={"svg"}
    width={cellSize * 9}
    height={cellSize * 9}
    viewBox={"0 0 9 9"}
    style={svgShadowStyle}
>
    {children}
</Absolute>;
