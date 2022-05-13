import {formatSvgPointsArray, Position} from "../../../types/layout/Position";
import {SVGAttributes, useMemo} from "react";
import {Rect} from "../../../types/layout/Rect";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {transformPointToUserAreaCoords} from "../../../types/sudoku/CustomCellBounds";

interface FieldCellShapeProps extends Partial<Rect>, Omit<SVGAttributes<SVGRectElement | SVGPolygonElement>, keyof Rect> {
    context?: PuzzleContext<any, any, any>;
    cellPosition?: Position;
}

export const FieldCellShape = ({context, cellPosition, left = 0, top = 0, width = 1, height = 1, ...props}: FieldCellShapeProps) => {
    const customCellBorders = useMemo<Position[][] | undefined>(() => {
        if (!context || !cellPosition) {
            return undefined;
        }

        const customCellBounds = context.puzzle.customCellBounds?.[cellPosition.top]?.[cellPosition.left];
        if (!customCellBounds) {
            return undefined;
        }

        return customCellBounds.borders.map(
            (border) => border.map(
                (point) => transformPointToUserAreaCoords(point, customCellBounds.userArea)
            )
        );
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
