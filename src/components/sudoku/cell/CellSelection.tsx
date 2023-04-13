import {blueColor, lighterBlueColor, yellowColor} from "../../app/globals";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {Position} from "../../../types/layout/Position";
import {getTransformedRectAverageSize} from "../../../types/layout/Rect";
import {FieldCellShape} from "../field/FieldCellShape";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {useTransformScale} from "../../../contexts/TransformScaleContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const CellSelectionColor = {
    mainCurrent: blueColor,
    mainPrevious: lighterBlueColor,
    secondary: yellowColor,
};

export interface CellSelectionProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    cellPosition: Position;
    color?: string;
    strokeWidth?: number;
}

export const CellSelection = <T extends AnyPTM>({context, cellPosition, color = CellSelectionColor.mainCurrent, strokeWidth = 1}: CellSelectionProps<T>) => {
    const scale = useTransformScale();

    let selectionBorderWidth = 0.1 * strokeWidth;
    const selectionBorderWidth2 = 2 / scale;

    const {
        areCustomBounds,
        transformedBounds: {userArea},
    } = context.cellsIndexForState.getAllCells()[cellPosition.top][cellPosition.left];

    if (areCustomBounds) {
        const cellTransformedSize = getTransformedRectAverageSize(userArea);

        selectionBorderWidth = Math.max(selectionBorderWidth * cellTransformedSize, 7 / scale);

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
