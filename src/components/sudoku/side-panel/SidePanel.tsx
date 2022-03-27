import {Rules} from "../rules/Rules";
import {Controls, controlsHeightCoeff, ControlsProps, controlsWidthCoeff} from "../controls/Controls";
import {Absolute} from "../../layout/absolute/Absolute";
import {Size} from "../../../types/layout/Size";
import {globalPaddingCoeff} from "../../app/globals";

export interface SidePanelProps extends ControlsProps {
}

export const SidePanel = ({rect, cellSize, isHorizontal, ...controlsProps}: SidePanelProps) => {
    const padding = cellSize * globalPaddingCoeff;

    const controlsSize: Size = {
        width: cellSize * (isHorizontal ? controlsWidthCoeff : controlsHeightCoeff),
        height: cellSize * (isHorizontal ? controlsHeightCoeff : controlsWidthCoeff),
    };
    const controlsPosition = {
        left: rect.width - controlsSize.width,
        top: rect.height - controlsSize.height,
    };

    return <Absolute {...rect}>
        <Rules
            rect={{
                left: 0,
                top: 0,
                width: isHorizontal
                    ? rect.width
                    : controlsPosition.left - padding,
                height: isHorizontal
                    ? controlsPosition.top - padding
                    : rect.height,
            }}
            cellSize={cellSize}
        />

        <Controls
            rect={{...controlsPosition, ...controlsSize}}
            cellSize={cellSize}
            isHorizontal={isHorizontal}
            {...controlsProps}
        />
    </Absolute>;
};
