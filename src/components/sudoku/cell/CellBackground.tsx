import {Set} from "../../../types/struct/Set";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {formatSvgPointsArray, getRectPoints, Position} from "../../../types/layout/Position";
import {CellColor, cellColors} from "../../../types/sudoku/CellColor";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FieldCellShape} from "../field/FieldCellShape";
import {useMemo} from "react";
import {transformRectToUserAreaCoords} from "../../../types/sudoku/CustomCellBounds";
import {getRegionBoundingBox} from "../../../utils/regions";
import {Rect} from "../../../types/layout/Rect";

export interface CellBackgroundProps {
    context?: PuzzleContext<any, any, any>;
    cellPosition?: Position;
    colors: Set<CellColor>;
    size?: number;
}

export const CellBackground = ({context, cellPosition, colors, size = 1}: CellBackgroundProps) => {
    colors = colors.sorted();

    const customCellBounds = context && cellPosition && context.puzzle.customCellBounds?.[cellPosition.top]?.[cellPosition.left];
    const customCellRect = useMemo<Rect>(
        () => customCellBounds
            ? transformRectToUserAreaCoords(
                getRegionBoundingBox(customCellBounds.borders.flat()),
                customCellBounds.userArea
            )
            : {
                left: 0,
                top: 0,
                width: size,
                height: size,
            },
        [customCellBounds, size]
    );
    const customCellRadius = Math.max(
        size / 2 - customCellRect.left,
        customCellRect.left + customCellRect.width - size / 2,
        size / 2 - customCellRect.top,
        customCellRect.top + customCellRect.height - size / 2,
    );

    if (!colors.size) {
        return null;
    }

    return <AutoSvg
        width={size}
        height={size}
        clip={(colors.size > 1 || !!customCellBounds) && <FieldCellShape context={context} cellPosition={cellPosition}/>}
        style={{opacity: 0.5}}
    >
        <polygon
            points={formatSvgPointsArray(getRectPoints(customCellRect))}
            fill={cellColors[colors.first()]}
            stroke={"none"}
            strokeWidth={0}
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
                        .map(([y, i]) => [y * customCellRadius * 4, Math.PI * (2 * i / colors.size - 0.25)])
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
