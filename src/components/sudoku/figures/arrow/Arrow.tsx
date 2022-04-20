import {RoundedPolyLine, RoundedPolyLineProps} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {lightGreyColor} from "../../../app/globals";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

const lineWidth = 0.1;
const arrowSize = 0.35;

export const Arrow = ({points, ...props}: RoundedPolyLineProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.regular);

    points = points.map(([x, y]) => [x - 0.5, y - 0.5]);

    const [lastX, lastY] = points[points.length - 1];
    const [prevX, prevY] = points[points.length - 2];
    let dirX = lastX - prevX;
    let dirY = lastY - prevY;
    const dirLength = Math.hypot(dirX, dirY);
    dirX /= dirLength;
    dirY /= dirLength;

    return isLayer && <>
        <RoundedPolyLine
            points={points}
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
            cx={points[0][0]}
            cy={points[0][1]}
            r={0.4}
            strokeWidth={lineWidth}
            stroke={lightGreyColor}
            fill={"white"}
        />
    </>;
};
