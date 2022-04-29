import {blueColor, lighterBlueColor} from "../../app/globals";

export interface CellSelectionProps {
    size: number;
    isSecondary?: boolean;
}

export const CellSelection = ({size, isSecondary}: CellSelectionProps) => {
    const selectionBorderWidth = 0.1;
    const selectionBorderWidth2 = 2 / size;

    return <>
        <rect
            x={selectionBorderWidth / 2}
            y={selectionBorderWidth / 2}
            width={1 - selectionBorderWidth}
            height={1 - selectionBorderWidth}
            fill={"none"}
            strokeWidth={selectionBorderWidth}
            stroke={isSecondary ? lighterBlueColor : blueColor}
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
