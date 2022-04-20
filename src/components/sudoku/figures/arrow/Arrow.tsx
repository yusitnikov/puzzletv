import {RoundedPolyLine, RoundedPolyLineProps} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {lightGreyColor} from "../../../app/globals";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

const lineWidth = 0.1;
const arrowSize = 0.35;

export const Arrow = (props: RoundedPolyLineProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.regular);

    const [lastX, lastY] = props.points[props.points.length - 1];
    const [prevX, prevY] = props.points[props.points.length - 2];
    let dirX = lastX - prevX;
    let dirY = lastY - prevY;
    const dirLength = Math.hypot(dirX, dirY);
    dirX /= dirLength;
    dirY /= dirLength;

    return isLayer && <>
        <RoundedPolyLine
            strokeWidth={lineWidth}
            stroke={lightGreyColor}
            {...props}
        />

        <RoundedPolyLine
            strokeWidth={lineWidth}
            stroke={lightGreyColor}
            {...props}
            points={[
                [lastX + arrowSize * (-dirX + dirY), lastY + arrowSize * (-dirY - dirX)],
                [lastX, lastY],
                [lastX + arrowSize * (-dirX - dirY), lastY + arrowSize * (-dirY + dirX)],
            ]}
        />

        <circle
            cx={props.points[0][0]}
            cy={props.points[0][1]}
            r={0.4}
            strokeWidth={lineWidth}
            stroke={lightGreyColor}
            fill={"white"}
        />
    </>;
};
