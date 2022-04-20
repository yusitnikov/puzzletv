import {SVGAttributes} from "react";
import {blackColor} from "../../../app/globals";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

export interface KropkiDotProps extends SVGAttributes<SVGCircleElement> {
    isFilled?: boolean;
}

export const KropkiDot = ({isFilled, ...circleProps}: KropkiDotProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.top);

    return isLayer && <circle
        r={0.2}
        strokeWidth={0.02}
        stroke={blackColor}
        fill={isFilled ? blackColor : "white"}
        {...circleProps}
    />;
};
