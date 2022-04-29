import {PropsWithChildren} from "react";
import {svgShadowStyle} from "../../app/globals";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";

export interface FieldSvgProps {
    fieldSize: number;
    fieldMargin?: number;
    cellSize: number;
    useShadow?: boolean;
}

export const FieldSvg = ({fieldSize, fieldMargin = 0, cellSize, useShadow = true, children}: PropsWithChildren<FieldSvgProps>) => {
    const extraMargin = fieldSize;

    fieldMargin += extraMargin;

    return <AutoSvg
        left={-cellSize * extraMargin}
        top={-cellSize * extraMargin}
        width={cellSize * (fieldSize + 2 * fieldMargin)}
        height={cellSize * (fieldSize + 2 * fieldMargin)}
        viewBox={`${-fieldMargin} ${-fieldMargin} ${fieldSize + 2 * fieldMargin} ${fieldSize + 2 * fieldMargin}`}
        style={useShadow ? svgShadowStyle : undefined}
    >
        {children}
    </AutoSvg>;
};
