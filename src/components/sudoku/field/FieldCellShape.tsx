import {formatSvgPointsArray, Position} from "../../../types/layout/Position";
import {SVGAttributes, useMemo} from "react";
import {Rect} from "../../../types/layout/Rect";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {usePureMemo} from "../../../hooks/usePureMemo";

interface FieldCellShapeProps extends Partial<Rect>, Omit<SVGAttributes<SVGRectElement | SVGPolygonElement>, keyof Rect> {
    context?: PuzzleContext<any, any, any>;
    cellPosition?: Position;
}

export const FieldCellShape = ({context, cellPosition, left = 0, top = 0, width = 1, height = 1, ...props}: FieldCellShapeProps) => {
    cellPosition = usePureMemo(cellPosition);

    const customCellBorders: Position[][] | undefined = useMemo(() => {
        if (!context || !cellPosition) {
            return undefined;
        }

        const {areCustomBounds, getTransformedBounds} = context.cellsIndex.allCells[cellPosition.top][cellPosition.left];

        return areCustomBounds ? getTransformedBounds(context.state).borders : undefined;
    }, [context, cellPosition]);

    return <>
        {!customCellBorders && <rect
            x={left}
            y={top}
            width={width}
            height={height}
            fill={"none"}
            stroke={"none"}
            strokeWidth={0}
            {...props}
        />}

        {customCellBorders?.map((border, index) => <polygon
            key={`part-${index}`}
            points={formatSvgPointsArray(border)}
            fill={"none"}
            clipRule={"evenodd"}
            stroke={"none"}
            strokeWidth={0}
            {...props}
        />)}
    </>;
};
