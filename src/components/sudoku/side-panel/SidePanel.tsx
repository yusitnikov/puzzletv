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
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import {ReactElement} from "react";
import {profiler} from "../../../utils/profiler";

export const SidePanel = observer(function SidePanel<T extends AnyPTM>({context, rect, isHorizontal}: ControlsProps<T>) {
    profiler.trace();

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
}) as <T extends AnyPTM>(props: ControlsProps<T>) => ReactElement;
