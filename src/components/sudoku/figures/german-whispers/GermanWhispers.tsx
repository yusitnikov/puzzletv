import {RoundedPolyLine, RoundedPolyLineProps} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

export const GermanWhispers = (props: RoundedPolyLineProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.regular);

    return isLayer && <RoundedPolyLine
        strokeWidth={0.15}
        stroke={"#0f0"}
        {...props}
    />;
};
