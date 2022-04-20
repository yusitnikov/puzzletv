import {RoundedPolyLine, RoundedPolyLineProps} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {darkGreyColor} from "../../../app/globals";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

const lineWidth = 0.1;
const arrowSize = 0.35;
const circleRadius = 0.4;

export interface ArrowProps extends RoundedPolyLineProps {
    transparentCircle?: boolean;
}

export const Arrow = ({points, transparentCircle, ...props}: ArrowProps) => {
    const isLayer = useIsFieldLayer(FieldLayer.regular);

    points = points.map(([x, y]) => [x - 0.5, y - 0.5]);

    const [[x1, y1], [x2, y2]] = points;
    let dx = x2 - x1;
    let dy = y2 - y1;
    const dLength = Math.hypot(dx, dy);
    dx /= dLength;
    dy /= dLength;
    points[0] = [
        x1 + circleRadius * dx,
        y1 + circleRadius * dy,
    ];

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
            stroke={darkGreyColor}
            {...props}
        />

        <RoundedPolyLine
            strokeWidth={lineWidth}
            stroke={darkGreyColor}
            {...props}
            points={[
                [lastX + arrowSize * (-dirX + dirY), lastY + arrowSize * (-dirY - dirX)],
                [lastX, lastY],
                [lastX + arrowSize * (-dirX - dirY), lastY + arrowSize * (-dirY + dirX)],
            ]}
        />

        <circle
            cx={x1}
            cy={y1}
            r={circleRadius}
            strokeWidth={lineWidth}
            stroke={darkGreyColor}
            fill={transparentCircle ? "none" : "#fff"}
        />
    </>;
};
