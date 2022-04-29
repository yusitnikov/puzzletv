import {blueColor, lighterBlueColor, yellowColor} from "../../app/globals";

export const CellSelectionColor = {
    mainCurrent: blueColor,
    mainPrevious: lighterBlueColor,
    secondary: yellowColor,
};

export interface CellSelectionProps {
    size: number;
    color?: string;
    strokeWidth?: number;
}

export const CellSelection = ({size, color = CellSelectionColor.mainCurrent, strokeWidth = 1}: CellSelectionProps) => {
    const selectionBorderWidth = 0.1 * strokeWidth;
    const selectionBorderWidth2 = 2 / size;

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
