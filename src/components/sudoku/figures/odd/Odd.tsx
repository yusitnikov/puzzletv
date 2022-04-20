import {lightGreyColor} from "../../../app/globals";
import {SVGAttributes} from "react";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

export const Odd = (props: SVGAttributes<SVGCircleElement>) => {
    const isLayer = useIsFieldLayer(FieldLayer.beforeSelection);

    return isLayer && <circle
        {...props}
        r={0.4}
        fill={lightGreyColor}
    />;
};
