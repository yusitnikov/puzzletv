import {formatSvgPointsArray, Position} from "../../../types/layout/Position";
import {SVGAttributes, useMemo} from "react";
import {getTransformedRectAverageSize, Rect} from "../../../types/layout/Rect";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {usePureMemo} from "../../../hooks/usePureMemo";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

interface FieldCellShapeProps<T extends AnyPTM> extends Partial<Rect>, Omit<SVGAttributes<SVGRectElement | SVGPolygonElement | SVGPolylineElement>, keyof Rect> {
    context?: PuzzleContext<T>;
    cellPosition?: Position;
    line?: Position[];
}

export const FieldCellShape = <T extends AnyPTM>({context, cellPosition, line, left = 0, top = 0, width = 1, height = 1, ...props}: FieldCellShapeProps<T>) => {
    cellPosition = usePureMemo(cellPosition);

    const customCellBounds = useMemo(() => {
        if (!context || !cellPosition) {
            return undefined;
        }

        const {areCustomBounds, transformedBounds} = context.cellsIndexForState.getAllCells()[cellPosition.top][cellPosition.left];

        return areCustomBounds ? transformedBounds : undefined;
    }, [context, cellPosition]);

    if (!context || !cellPosition || !customCellBounds) {
        return <rect
            x={left}
            y={top}
            width={width}
            height={height}
            fill={"none"}
            stroke={"none"}
            strokeWidth={0}
            {...props}
        />;
    }

    if (line) {
        const cellTransformedSize = getTransformedRectAverageSize(customCellBounds.userArea);

        const sizeCoeff = context.puzzle.fieldFitsWrapper
            ? 1
            : 1 / context.cellSize;

        return <AutoSvg clip={<FieldCellShape context={context} cellPosition={cellPosition}/>}>
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
        </AutoSvg>;
    }

    return <>
        {customCellBounds.borders.map((border, index) => <polygon
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
