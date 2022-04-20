import {RoundedPolyLine, RoundedPolyLineProps} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {lightGreyColor} from "../../../app/globals";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

export const Thermometer = ({points, ...props}: RoundedPolyLineProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.regular);

    points = points.map(([x, y]) => [x - 0.5, y - 0.5]);

    return isLayer && <>
        <circle
            cx={points[0][0]}
            cy={points[0][1]}
            r={0.4}
            fill={lightGreyColor}
        />

        <RoundedPolyLine
            points={points}
            strokeWidth={0.35}
            stroke={lightGreyColor}
            {...props}
        />
    </>;
};
