import {Absolute} from "../../layout/absolute/Absolute";
import {blueColor, lighterBlueColor} from "../../app/globals";

export interface CellSelectionProps {
    size: number;
    isSecondary?: boolean;
}

export const CellSelection = ({size, isSecondary}: CellSelectionProps) => {
    const selectionBorderWidth = size * 0.1;
    const selectionBorderWidth2 = 2;

    return <>
        <Absolute
            left={selectionBorderWidth / 2}
            top={selectionBorderWidth / 2}
            width={size - selectionBorderWidth}
            height={size - selectionBorderWidth}
            borderWidth={selectionBorderWidth}
            borderColor={isSecondary ? lighterBlueColor : blueColor}
        />
        <Absolute
            left={selectionBorderWidth + selectionBorderWidth2 / 2}
            top={selectionBorderWidth + selectionBorderWidth2 / 2}
            width={size - selectionBorderWidth * 2 - selectionBorderWidth2}
            height={size - selectionBorderWidth * 2 - selectionBorderWidth2}
            borderWidth={selectionBorderWidth2}
            borderColor={"#fff"}
        />
    </>;
};
