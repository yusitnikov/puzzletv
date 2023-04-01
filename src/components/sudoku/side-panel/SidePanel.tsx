import {Rules} from "../rules/Rules";
import {
    Controls,
    ControlsProps,
    getControlsSizeCoeff
} from "../controls/Controls";
import {Absolute} from "../../layout/absolute/Absolute";
import {Size} from "../../../types/layout/Size";
import {globalPaddingCoeff} from "../../app/globals";
import {useControlButtonsManager} from "../controls/ControlButtonsManager";

export interface SidePanelProps<CellType, ExType = {}, ProcessedExType = {}>
    extends ControlsProps<CellType, ExType, ProcessedExType> {
}

export const SidePanel = <CellType, ExType = {}, ProcessedExType = {}>(
    {context, rect, isHorizontal}: SidePanelProps<CellType, ExType, ProcessedExType>
) => {
    const {puzzle, cellSizeForSidePanel: cellSize} = context;

    const controlButtonsManager = useControlButtonsManager(puzzle, isHorizontal);

    const padding = cellSize * globalPaddingCoeff;

    const controlsWidthCoeff = getControlsSizeCoeff(controlButtonsManager.width);
    const controlsHeightCoeff = getControlsSizeCoeff(controlButtonsManager.height);

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
            context={context}
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
        />

        <Controls
            context={context}
            rect={{...controlsPosition, ...controlsSize}}
            isHorizontal={isHorizontal}
        />
    </Absolute>;
};
