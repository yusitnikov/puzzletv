import { formatSvgPointsArray, Position } from "../../../types/layout/Position";
import { ReactElement, SVGAttributes } from "react";
import { getTransformedRectAverageSize, Rect } from "../../../types/layout/Rect";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { usePureMemo } from "../../../hooks/usePureMemo";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

interface GridCellShapeProps<T extends AnyPTM>
    extends Partial<Rect>,
        Omit<SVGAttributes<SVGRectElement | SVGPolygonElement | SVGPolylineElement | SVGEllipseElement>, keyof Rect> {
    context?: PuzzleContext<T>;
    cellPosition?: Position;
    line?: Position[];
    polygon?: Position[];
    point?: Position;
    noClip?: boolean;
}

export const GridCellShape = observer(function GridCellShapeFc<T extends AnyPTM>({
    context,
    cellPosition,
    line,
    polygon,
    point,
    noClip,
    left = 0,
    top = 0,
    width = 1,
    height = 1,
    ...props
}: GridCellShapeProps<T>) {
    profiler.trace();

    cellPosition = usePureMemo(cellPosition);

    const customCellBounds =
        context && cellPosition && context.puzzleIndex.allCells[cellPosition.top][cellPosition.left].areCustomBounds
            ? context.getCellTransformedBounds(cellPosition.top, cellPosition.left)
            : undefined;

    const clip = noClip ? undefined : <GridCellShape context={context} cellPosition={cellPosition} />;

    // Note: the actual condition here is just `if (!customCellBounds)`.
    // Everything else is just a hint for typescript.
    if (!context || !cellPosition || !customCellBounds) {
        return (
            <rect
                x={(cellPosition?.left ?? 0) + left}
                y={(cellPosition?.top ?? 0) + top}
                width={width}
                height={height}
                fill={"none"}
                stroke={"none"}
                strokeWidth={0}
                {...props}
            />
        );
    }

    if (line) {
        const cellTransformedSize = getTransformedRectAverageSize(customCellBounds.userArea);

        const sizeCoeff = context.puzzle.typeManager.gridFitsWrapper ? 1 : 1 / context.cellSize;

        return (
            <AutoSvg clip={clip}>
                <polyline
                    points={formatSvgPointsArray(line)}
                    fill={"none"}
                    stroke={"none"}
                    opacity={0.5}
                    strokeWidth={Math.max(0.25 * cellTransformedSize, 10 * sizeCoeff)}
                    {...props}
                    style={{
                        ...props.style,
                        pointerEvents: "stroke",
                    }}
                />
            </AutoSvg>
        );
    }

    if (polygon) {
        return (
            <AutoSvg clip={clip}>
                <polygon
                    points={formatSvgPointsArray(polygon)}
                    fill={"none"}
                    stroke={"none"}
                    strokeWidth={0}
                    opacity={0.5}
                    {...props}
                />
            </AutoSvg>
        );
    }

    if (point) {
        return (
            <AutoSvg clip={clip}>
                <ellipse
                    cx={point.left}
                    cy={point.top}
                    rx={width}
                    ry={height}
                    fill={"none"}
                    stroke={"none"}
                    strokeWidth={0}
                    opacity={0.5}
                    {...props}
                />
            </AutoSvg>
        );
    }

    return (
        <>
            {customCellBounds.borders.map((border, index) => (
                <polygon
                    key={`part-${index}`}
                    points={formatSvgPointsArray(border)}
                    fill={"none"}
                    clipRule={"evenodd"}
                    stroke={"none"}
                    strokeWidth={0}
                    {...props}
                />
            ))}
        </>
    );
}) as <T extends AnyPTM>(props: GridCellShapeProps<T>) => ReactElement;
