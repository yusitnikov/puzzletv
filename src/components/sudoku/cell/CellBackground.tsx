import {SetInterface} from "../../../types/struct/Set";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {formatSvgPointsArray, Position} from "../../../types/layout/Position";
import {CellColorValue, resolveCellColorValue} from "../../../types/sudoku/CellColor";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FieldCellShape} from "../field/FieldCellShape";
import {getRegionBoundingBox} from "../../../utils/regions";
import {getTransformedRectCenter, Rect} from "../../../types/layout/Rect";

export interface CellBackgroundProps {
    context: PuzzleContext<any, any, any>;
    cellPosition?: Position;
    colors: SetInterface<CellColorValue>;
    size?: number;
}

export const CellBackground = ({context, cellPosition, colors, size = 1}: CellBackgroundProps) => {
    colors = colors.sorted();

    const cellInfo = cellPosition && context.cellsIndex.allCells[cellPosition.top][cellPosition.left];
    const customBounds = cellInfo?.getTransformedBounds?.(context.state);
    const areCustomBounds = cellInfo?.areCustomBounds && !!customBounds;

    const customCellRect: Rect = areCustomBounds
        ? getRegionBoundingBox(customBounds.borders.flat())
        : {
            left: 0,
            top: 0,
            width: size,
            height: size,
        };
    const customCellCenter: Position = areCustomBounds
        ? getTransformedRectCenter(customBounds.userArea)
        : {
            left: size / 2,
            top: size / 2,
        };
    const customCellRadius = Math.max(
        customCellCenter.left - customCellRect.left,
        customCellRect.left + customCellRect.width - customCellCenter.left,
        customCellCenter.top - customCellRect.top,
        customCellRect.top + customCellRect.height - customCellCenter.top,
    );

    if (!colors.size) {
        return null;
    }

    return <AutoSvg
        width={size}
        height={size}
        clip={(colors.size > 1 || !!cellInfo?.areCustomBounds) && <FieldCellShape context={context} cellPosition={cellPosition}/>}
        style={{opacity: context.state.backgroundOpacity}}
    >
        <rect
            x={customCellRect.left}
            y={customCellRect.top}
            width={customCellRect.width}
            height={customCellRect.height}
            fill={resolveCellColorValue(colors.first()!)}
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
                            left: customCellCenter.left + y * Math.cos(a),
                            top: customCellCenter.top + y * Math.sin(a),
                        }))
                )}
                fill={resolveCellColorValue(color)}
            />)}
        </>}
    </AutoSvg>;
};
