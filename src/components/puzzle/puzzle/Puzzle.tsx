import { ReactElement, useMemo } from "react";
import { Size } from "../../../types/layout/Size";
import { Absolute } from "../../layout/absolute/Absolute";
import { Grid } from "../grid/Grid";
import { SidePanel } from "../side-panel/SidePanel";
import { globalPaddingCoeff } from "../../app/globals";
import { getControlsSizeCoeff } from "../controls/Controls";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useGame } from "../../../hooks/puzzle/useGame";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { Title } from "../../layout/title/Title";
import { PuzzleContainerContext } from "../../../contexts/PuzzleContainerContext";
import { Rect } from "../../../types/layout/Rect";
import { profiler } from "../../../utils/profiler";
import { useControlButtonsManager } from "../controls/ControlButtonsManager";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { PuzzleMultiPlayerWarnings } from "./PuzzleMultiPlayerWarnings";
import { usePureMemo } from "../../../hooks/usePureMemo";
import { observer } from "mobx-react-lite";
import { translate } from "../../../utils/translate";

export interface PuzzleProps<T extends AnyPTM> {
    puzzle: PuzzleDefinition<T>;
}

export const Puzzle = observer(function Puzzle<T extends AnyPTM>({ puzzle }: PuzzleProps<T>) {
    profiler.trace();

    profiler.flush();

    const {
        title,
        author,
        gridSize: { gridSize },
        gridMargin = 0,
    } = puzzle;

    // region Size calculation
    const windowSize = useWindowSize();

    const isHorizontal = windowSize.width > windowSize.height;
    const maxWindowSize = Math.max(windowSize.width, windowSize.height);
    const minWindowSize = Math.min(windowSize.width, windowSize.height);

    const controlButtonsManager = useControlButtonsManager(puzzle, isHorizontal);

    const gridSizeWithMargin = gridSize + 2 * gridMargin;
    const gridSizeForSidePanel = 9;
    const panelCoeff = getControlsSizeCoeff(controlButtonsManager.width);
    const maxCoeff = gridSizeForSidePanel + panelCoeff + globalPaddingCoeff * 3;
    const minCoeff = gridSizeForSidePanel + globalPaddingCoeff * 2;

    const cellSizeForSidePanel = Math.min(minWindowSize / minCoeff, maxWindowSize / maxCoeff);
    const gridSquareSize = cellSizeForSidePanel * gridSizeForSidePanel;
    const cellSize = gridSquareSize / gridSizeWithMargin;
    const padding = cellSizeForSidePanel * globalPaddingCoeff;
    const controlsSize = cellSizeForSidePanel * panelCoeff;
    const maxContainerSize = cellSizeForSidePanel * maxCoeff;
    const minContainerSize = cellSizeForSidePanel * minCoeff;

    const containerSize: Size = {
        width: isHorizontal ? maxContainerSize : minContainerSize,
        height: isHorizontal ? minContainerSize : maxContainerSize,
    };

    const controlsOffset = gridSquareSize + padding * 2;

    const containerLeft = (windowSize.width - containerSize.width) / 2;
    const gridInnerRect = useMemo<Rect>(
        () => ({
            left: padding,
            top: padding,
            width: gridSquareSize,
            height: gridSquareSize,
        }),
        [padding, gridSquareSize],
    );
    const gridOuterRect = useMemo<Rect>(
        () => ({
            ...gridInnerRect,
            left: containerLeft + gridInnerRect.left,
        }),
        [containerLeft, gridInnerRect],
    );

    const sidePanelRect = usePureMemo({
        left: isHorizontal ? controlsOffset : padding,
        top: isHorizontal ? padding : controlsOffset,
        width: isHorizontal ? controlsSize : gridSquareSize,
        height: isHorizontal ? gridSquareSize : controlsSize,
    });
    // endregion

    const context = useGame(puzzle, cellSize, cellSizeForSidePanel);

    return (
        <>
            <Title>
                {translate(title).replace("\n", " ")}
                {author && (
                    <>
                        {" "}
                        {translate("by")} {translate(author)}
                    </>
                )}{" "}
                – Puzzle TV
            </Title>

            <PuzzleContainerContext.Provider value={gridOuterRect}>
                <Absolute left={containerLeft} top={0} {...containerSize}>
                    <Grid context={context} rect={gridInnerRect} />

                    <SidePanel context={context} rect={sidePanelRect} isHorizontal={isHorizontal} />
                </Absolute>

                <PuzzleMultiPlayerWarnings context={context} />
            </PuzzleContainerContext.Provider>
        </>
    );
}) as <T extends AnyPTM>(props: PuzzleProps<T>) => ReactElement;
