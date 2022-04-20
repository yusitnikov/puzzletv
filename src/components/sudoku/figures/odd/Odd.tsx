import {lightGreyColor} from "../../../app/globals";
import {SVGAttributes} from "react";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Position} from "../../../../types/layout/Position";

export interface OddProps extends Position, Omit<SVGAttributes<SVGCircleElement>, "cx" | "cy"> {
}

export const Odd = ({left, top, ...props}: OddProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.beforeSelection);

    return isLayer && <circle
        cx={left - 0.5}
        cy={top - 0.5}
        {...props}
        r={0.4}
        fill={lightGreyColor}
    />;
};
