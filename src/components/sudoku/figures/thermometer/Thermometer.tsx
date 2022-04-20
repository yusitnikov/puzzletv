import {RoundedPolyLine, RoundedPolyLineProps} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {lightGreyColor} from "../../../app/globals";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

export const Thermometer = (props: RoundedPolyLineProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.regular);

    return isLayer && <>
        <circle
            cx={props.points[0][0]}
            cy={props.points[0][1]}
            r={0.4}
            fill={lightGreyColor}
        />

        <RoundedPolyLine
            strokeWidth={0.35}
            stroke={lightGreyColor}
            {...props}
        />
    </>;
};
