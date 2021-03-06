import {Rules} from "../rules/Rules";
import {
    Controls,
    ControlsProps,
    getControlsHeightCoeff,
    getControlsWidthCoeff
} from "../controls/Controls";
import {Absolute} from "../../layout/absolute/Absolute";
import {Size} from "../../../types/layout/Size";
import {globalPaddingCoeff} from "../../app/globals";
import {isPuzzleHasBottomRowControls} from "../../../types/sudoku/PuzzleDefinition";

export interface SidePanelProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>
    extends ControlsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
}

export const SidePanel = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {context, rect, isHorizontal}: SidePanelProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {puzzle, cellSize} = context;

    const hasBottomRowControls = isPuzzleHasBottomRowControls(puzzle);

    const padding = cellSize * globalPaddingCoeff;

    const controlsWidthCoeff = getControlsWidthCoeff(puzzle);
    const controlsHeightCoeff = getControlsHeightCoeff(puzzle);

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
            isHorizontal={isHorizontal || hasBottomRowControls}
        />
    </Absolute>;
};
