import {PropsWithChildren} from "react";
import {svgShadowStyle} from "../../app/globals";
import {Absolute} from "../../layout/absolute/Absolute";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {FieldLayerContext} from "../../../contexts/FieldLayerContext";

export interface FieldSvgProps {
    fieldSize: number;
    fieldMargin?: number;
    cellSize: number;
    layer: FieldLayer;
}

export const FieldSvg = ({fieldSize, fieldMargin = 0, cellSize, layer, children}: PropsWithChildren<FieldSvgProps>) => <Absolute
    tagName={"svg"}
    width={cellSize * (fieldSize + 2 * fieldMargin)}
    height={cellSize * (fieldSize + 2 * fieldMargin)}
    viewBox={`${-fieldMargin} ${-fieldMargin} ${fieldSize + 2 * fieldMargin} ${fieldSize + 2 * fieldMargin}`}
    style={svgShadowStyle}
>
    <FieldLayerContext.Provider value={layer}>
        {children}
    </FieldLayerContext.Provider>
</Absolute>;
