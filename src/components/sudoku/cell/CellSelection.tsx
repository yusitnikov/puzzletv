import {blueColor, lighterBlueColor, yellowColor} from "../../app/globals";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {getVectorLength, Position} from "../../../types/layout/Position";
import {FieldCellShape} from "../field/FieldCellShape";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";

export const CellSelectionColor = {
    mainCurrent: blueColor,
    mainPrevious: lighterBlueColor,
    secondary: yellowColor,
};

export interface CellSelectionProps {
    context: PuzzleContext<any, any, any>;
    cellPosition: Position;
    size: number;
    color?: string;
    strokeWidth?: number;
}

export const CellSelection = ({context, cellPosition, size, color = CellSelectionColor.mainCurrent, strokeWidth = 1}: CellSelectionProps) => {
    let selectionBorderWidth = 0.1 * strokeWidth;
    let selectionBorderWidth2 = 2 / size;

    const {areCustomBounds, getTransformedBounds} = context.cellsIndex.allCells[cellPosition.top][cellPosition.left];

    if (areCustomBounds) {
        const {rightVector, bottomVector} = getTransformedBounds(context.state).userArea;
        const cellTransformedSize = (getVectorLength(rightVector) + getVectorLength(bottomVector)) / 2;

        selectionBorderWidth = Math.max(selectionBorderWidth * cellTransformedSize, 7);
        selectionBorderWidth2 = 2;

        return <AutoSvg
            clip={<FieldCellShape
                context={context}
                cellPosition={cellPosition}
            />}
        >
            <FieldCellShape
                context={context}
                cellPosition={cellPosition}
                stroke={"#fff"}
                strokeWidth={selectionBorderWidth + selectionBorderWidth2}
            />;

            <FieldCellShape
                context={context}
                cellPosition={cellPosition}
                stroke={color}
                strokeWidth={selectionBorderWidth}
            />;
        </AutoSvg>;
    }

    return <>
        <rect
            x={selectionBorderWidth / 2}
            y={selectionBorderWidth / 2}
            width={1 - selectionBorderWidth}
            height={1 - selectionBorderWidth}
            fill={"none"}
            strokeWidth={selectionBorderWidth}
            stroke={color}
        />
        <rect
            x={selectionBorderWidth + selectionBorderWidth2 / 2}
            y={selectionBorderWidth + selectionBorderWidth2 / 2}
            width={1 - selectionBorderWidth * 2 - selectionBorderWidth2}
            height={1 - selectionBorderWidth * 2 - selectionBorderWidth2}
            fill={"none"}
            strokeWidth={selectionBorderWidth2}
            stroke={"#fff"}
        />
    </>;
};
