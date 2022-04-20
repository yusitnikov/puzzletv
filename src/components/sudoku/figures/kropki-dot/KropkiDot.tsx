import {SVGAttributes} from "react";
import {blackColor} from "../../../app/globals";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Position} from "../../../../types/layout/Position";

export interface KropkiDotProps extends Position, Omit<SVGAttributes<SVGCircleElement>, "cx" | "cy"> {
    isFilled?: boolean;
}

export const KropkiDot = ({left, top, isFilled, ...circleProps}: KropkiDotProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.top);

    return isLayer && <circle
        cx={left - 0.5}
        cy={top - 0.5}
        r={0.2}
        strokeWidth={0.02}
        stroke={blackColor}
        fill={isFilled ? blackColor : "white"}
        {...circleProps}
    />;
};
