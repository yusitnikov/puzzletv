import {lightGreyColor} from "../../../app/globals";
import {SVGAttributes} from "react";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Position} from "../../../../types/layout/Position";

const width = 0.8;

export interface EvenProps extends Position, Omit<SVGAttributes<SVGRectElement>, "x" | "y"> {
}

export const Even = ({left, top, ...otherProps}: EvenProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.beforeSelection);

    return isLayer && <rect
        x={left - 0.5 - width / 2}
        y={top - 0.5 - width / 2}
        width={width}
        height={width}
        {...otherProps}
        fill={lightGreyColor}
    />;
};
