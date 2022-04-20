import {lightGreyColor, textColor} from "../../../app/globals";
import {SVGAttributes} from "react";
import {useFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";

const arrowWidth = 0.1;
const arrowHeight = 0.05;

export interface MinMaxProps extends Omit<SVGAttributes<SVGRectElement>, "x" | "y"> {
    cx: number;
    cy: number;
}

export const MinMax = ({cx, cy, coeff, ...otherProps}: MinMaxProps & {coeff: number}) => {
    const layer = useFieldLayer();

    return <>
        {layer === FieldLayer.beforeSelection && <rect
            x={cx - 0.5}
            y={cy - 0.5}
            width={1}
            height={1}
            {...otherProps}
            fill={lightGreyColor}
            fillOpacity={0.5}
        />}

        {layer === FieldLayer.regular && <>
            <Arrow cx={cx} cy={cy} dx={1} dy={0} coeff={coeff}/>
            <Arrow cx={cx} cy={cy} dx={-1} dy={0} coeff={coeff}/>
            <Arrow cx={cx} cy={cy} dx={0} dy={1} coeff={coeff}/>
            <Arrow cx={cx} cy={cy} dx={0} dy={-1} coeff={coeff}/>
        </>}
    </>;
};

export const Min = (props: MinMaxProps) => <MinMax coeff={-1} {...props}/>;

export const Max = (props: MinMaxProps) => <MinMax coeff={1} {...props}/>;

interface ArrowProps {
    cx: number;
    cy: number;
    dx: number;
    dy: number;
    coeff: number;
}

const Arrow = ({cx, cy, dx, dy, coeff}: ArrowProps) => {
    const start = 0.5 - arrowHeight * (1.5 - 0.5 * coeff);
    cx += start * dx;
    cy += start * dy;
    dx *= coeff;
    dy *= coeff;

    return <polyline
        points={
            [
                [cx - arrowHeight * dx + arrowWidth * dy, cy - arrowHeight * dy + arrowWidth * dx],
                [cx, cy],
                [cx - arrowHeight * dx - arrowWidth * dy, cy - arrowHeight * dy - arrowWidth * dx],
            ]
                .map(([x, y]) => `${x},${y}`)
                .join(" ")
        }
        stroke={textColor}
        strokeWidth={arrowHeight / 2}
        fill={"none"}
    />;
};
