import {Set} from "../../../types/struct/Set";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {formatSvgPointsArray} from "../../../types/layout/Position";
import {CellColor, cellColors} from "../../../types/sudoku/CellColor";

export interface CellBackgroundProps {
    colors: Set<CellColor>;
    size?: number;
}

export const CellBackground = ({colors, size = 1}: CellBackgroundProps) => {
    if (!colors.size) {
        return null;
    }

    colors = colors.sorted();

    return <AutoSvg
        width={size}
        height={size}
        clip={colors.size > 1}
    >
        <rect
            width={size}
            height={size}
            fill={cellColors[colors.first()]}
        />

        {colors.size > 1 && <>
            {colors.items.map((color, index) => !!index && <polygon
                key={index}
                points={formatSvgPointsArray(
                    [
                        [0, index - 0.5],
                        [1, index - 0.5],
                        [1, index],
                        [1, index + 0.5]
                    ]
                        .map(([y, i]) => [y * size * 2, Math.PI * (2 * i / colors.size - 0.25)])
                        .map(([y, a]) => ({
                            left: size / 2 + y * Math.cos(a),
                            top: size / 2 + y * Math.sin(a),
                        }))
                )}
                fill={cellColors[color]}
            />)}
        </>}
    </AutoSvg>;
};
