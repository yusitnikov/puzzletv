import {Absolute} from "../../layout/absolute/Absolute";
import {blackColor, blueColor, greenColor, lightGreyColor} from "../../app/globals";
import {Set} from "../../../types/struct/Set";

const backgroundColors = [
    lightGreyColor,
    "#5f5f5f",
    blackColor,
    greenColor,
    "#d23be7",
    "#eb7532",
    "#e6261f",
    "#f7d038",
    blueColor,
];

export interface CellBackgroundProps {
    colors: Set<number>;
    size: number;
}

export const CellBackground = ({colors, size}: CellBackgroundProps) => {
    if (!colors.size) {
        return null;
    }

    colors = colors.sorted();

    return <Absolute
        width={size}
        height={size}
        style={{
            backgroundColor: backgroundColors[colors.first()],
        }}
    >
        {colors.size > 1 && <Absolute tagName={"svg"} width={size} height={size}>
            {colors.items.map((color, index) => !!index && <polygon
                key={index}
                points={
                    [
                        [0, index - 0.5],
                        [1, index - 0.5],
                        [1, index],
                        [1, index + 0.5]
                    ]
                        .map(([y, i]) => [y * size * 2, Math.PI * (2 * i / colors.size - 0.25)])
                        .map(([y, a]) => [
                            size / 2 + y * Math.cos(a),
                            size / 2 + y * Math.sin(a),
                        ])
                        .map(([x, y]) => `${x},${y}`)
                        .join(" ")
                }
                fill={backgroundColors[color]}
            />)}
        </Absolute>}
    </Absolute>;
};
