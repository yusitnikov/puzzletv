import {PropsWithChildren} from "react";
import {svgShadowStyle} from "../../app/globals";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {FieldSize} from "../../../types/sudoku/FieldSize";

export interface FieldSvgProps {
    fieldSize: FieldSize;
    fieldMargin?: number;
    cellSize: number;
    useShadow?: boolean;
}

export const FieldSvg = ({fieldSize: {fieldSize, rowsCount, columnsCount}, fieldMargin = 0, cellSize, useShadow = true, children}: PropsWithChildren<FieldSvgProps>) => {
    const extraMargin = fieldSize;

    fieldMargin += extraMargin;

    const totalWidth = fieldSize + 2 * fieldMargin;

    return <AutoSvg
        left={-cellSize * extraMargin}
        top={-cellSize * extraMargin}
        width={cellSize * totalWidth}
        height={cellSize * totalWidth}
        viewBox={`${(columnsCount - fieldSize) / 2 - fieldMargin} ${(rowsCount - fieldSize) / 2 - fieldMargin} ${totalWidth} ${totalWidth}`}
        style={useShadow ? svgShadowStyle : undefined}
    >
        {children}
    </AutoSvg>;
};
