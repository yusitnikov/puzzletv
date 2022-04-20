import {RoundedPolyLine, RoundedPolyLineProps} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

export const GermanWhispers = ({points, ...props}: RoundedPolyLineProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.regular);

    points = points.map(([x, y]) => [x - 0.5, y - 0.5]);

    return isLayer && <RoundedPolyLine
        points={points}
        strokeWidth={0.15}
        stroke={"#0f0"}
        {...props}
    />;
};
