import {lightGreyColor} from "../../../app/globals";
import {SVGAttributes} from "react";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

const width = 0.8;

export interface EvenProps extends Omit<SVGAttributes<SVGRectElement>, "x" | "y"> {
    cx: number;
    cy: number;
}

export const Even = ({cx, cy, ...otherProps}: EvenProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.beforeSelection);

    return isLayer && <rect
        x={cx - width / 2}
        y={cy - width / 2}
        width={width}
        height={width}
        {...otherProps}
        fill={lightGreyColor}
    />;
};
