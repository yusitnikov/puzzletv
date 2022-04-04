import {Rules} from "../rules/Rules";
import {Controls, controlsHeightCoeff, ControlsProps, controlsWidthCoeff} from "../controls/Controls";
import {Absolute} from "../../layout/absolute/Absolute";
import {Size} from "../../../types/layout/Size";
import {globalPaddingCoeff} from "../../app/globals";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";

export interface SidePanelProps<CellType> extends ControlsProps<CellType> {
    puzzle: PuzzleDefinition<CellType>;
}

export const SidePanel = <CellType,>({puzzle, rect, cellSize, isHorizontal, ...controlsProps}: SidePanelProps<CellType>) => {
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
            puzzle={puzzle}
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
