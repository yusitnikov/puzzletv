import {SetInterface} from "../../../types/struct/Set";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {formatSvgPointsArray, Position} from "../../../types/layout/Position";
import {CellColorValue, resolveCellColorValue} from "../../../types/sudoku/CellColor";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FieldCellShape} from "../field/FieldCellShape";
import {getRegionBoundingBox} from "../../../utils/regions";
import {getTransformedRectCenter, Rect} from "../../../types/layout/Rect";
import {profiler} from "../../../utils/profiler";
import {usePureMemo} from "../../../hooks/usePureMemo";

export interface CellBackgroundProps {
    context: PuzzleContext<any, any, any>;
    cellPosition?: Position;
    colors: SetInterface<CellColorValue>;
    size?: number;
    noOpacity?: boolean;
}

export const CellBackground = ({context, cellPosition, colors, noOpacity, size = 1}: CellBackgroundProps) => {
    colors = colors.sorted();
    cellPosition = usePureMemo(cellPosition);

    const cellInfo = cellPosition && context.cellsIndexForState.getAllCells()[cellPosition.top][cellPosition.left];
    const customBounds = usePureMemo(() => cellInfo?.transformedBounds, [cellInfo]);
    const areCustomBounds = cellInfo?.areCustomBounds && !!customBounds;

    const customCellRect: Rect = usePureMemo(
        () => areCustomBounds
            ? getRegionBoundingBox(customBounds.borders.flat())
            : {
                left: 0,
                top: 0,
                width: size,
                height: size,
            },
        [areCustomBounds, customBounds, size]
    );
    const customCellCenter: Position = usePureMemo(
        () => areCustomBounds
            ? getTransformedRectCenter(customBounds.userArea)
            : {
                left: size / 2,
                top: size / 2,
            },
        [areCustomBounds, customBounds, size]
    );
    const customCellRadius = Math.max(
        customCellCenter.left - customCellRect.left,
        customCellRect.left + customCellRect.width - customCellCenter.left,
        customCellCenter.top - customCellRect.top,
        customCellRect.top + customCellRect.height - customCellCenter.top,
    );

    if (!colors.size) {
        return null;
    }

    // TODO: don't pass context
    return <CellBackgroundByData
        context={context}
        cellPosition={cellPosition}
        colors={colors}
        size={size}
        clip={colors.size > 1 || !!cellInfo?.areCustomBounds}
        opacity={noOpacity ? 1 : context.state.backgroundOpacity}
        customCellRect={customCellRect}
        customCellCenter={customCellCenter}
        customCellRadius={customCellRadius}
    />;
};

export interface CellBackgroundByDataProps {
    context: PuzzleContext<any, any, any>;

    cellPosition?: Position;
    colors: SetInterface<CellColorValue>;
    size: number;
    clip: boolean;
    opacity: number;
    customCellRect: Rect;
    customCellCenter: Position;
    customCellRadius: number;
}

export const CellBackgroundByData = profiler.memo("CellBackgroundByData", (
    {context, cellPosition, colors, size, clip, opacity, customCellRect, customCellCenter, customCellRadius}: CellBackgroundByDataProps
) => {
    return <AutoSvg
        width={size}
        height={size}
        clip={clip && <FieldCellShape context={context} cellPosition={cellPosition}/>}
        style={{opacity}}
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
});
