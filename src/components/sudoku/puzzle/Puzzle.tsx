import { ReactElement, useMemo } from "react";
import { Size } from "../../../types/layout/Size";
import { Absolute } from "../../layout/absolute/Absolute";
import { Field } from "../field/Field";
import { SidePanel } from "../side-panel/SidePanel";
import { globalPaddingCoeff } from "../../app/globals";
import { getControlsSizeCoeff } from "../controls/Controls";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useGame } from "../../../hooks/sudoku/useGame";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import { Title } from "../../layout/title/Title";
import { useTranslate } from "../../../hooks/useTranslate";
import { PuzzleContainerContext } from "../../../contexts/PuzzleContainerContext";
import { Rect } from "../../../types/layout/Rect";
import { profiler } from "../../../utils/profiler";
import { useControlButtonsManager } from "../controls/ControlButtonsManager";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { PuzzleMultiPlayerWarnings } from "./PuzzleMultiPlayerWarnings";
import { usePureMemo } from "../../../hooks/usePureMemo";
import { observer } from "mobx-react-lite";

export interface PuzzleProps<T extends AnyPTM> {
    puzzle: PuzzleDefinition<T>;
}

export const Puzzle = observer(function Puzzle<T extends AnyPTM>({ puzzle }: PuzzleProps<T>) {
    profiler.trace();

    profiler.flush();

    const {
        title,
        author,
        fieldSize: { fieldSize },
        fieldMargin = 0,
    } = puzzle;

    const translate = useTranslate();

    // region Size calculation
    const windowSize = useWindowSize();

    const isHorizontal = windowSize.width > windowSize.height;
    const maxWindowSize = Math.max(windowSize.width, windowSize.height);
    const minWindowSize = Math.min(windowSize.width, windowSize.height);

    const controlButtonsManager = useControlButtonsManager(puzzle, isHorizontal);

    const fieldSizeWithMargin = fieldSize + 2 * fieldMargin;
    const fieldSizeForSidePanel = 9;
    const panelCoeff = getControlsSizeCoeff(controlButtonsManager.width);
    const maxCoeff = fieldSizeForSidePanel + panelCoeff + globalPaddingCoeff * 3;
    const minCoeff = fieldSizeForSidePanel + globalPaddingCoeff * 2;

    const cellSizeForSidePanel = Math.min(minWindowSize / minCoeff, maxWindowSize / maxCoeff);
    const sudokuSize = cellSizeForSidePanel * fieldSizeForSidePanel;
    const cellSize = sudokuSize / fieldSizeWithMargin;
    const padding = cellSizeForSidePanel * globalPaddingCoeff;
    const controlsSize = cellSizeForSidePanel * panelCoeff;
    const maxContainerSize = cellSizeForSidePanel * maxCoeff;
    const minContainerSize = cellSizeForSidePanel * minCoeff;

    const containerSize: Size = {
        width: isHorizontal ? maxContainerSize : minContainerSize,
        height: isHorizontal ? minContainerSize : maxContainerSize,
    };

    const controlsOffset = sudokuSize + padding * 2;

    const containerLeft = (windowSize.width - containerSize.width) / 2;
    const fieldInnerRect = useMemo<Rect>(
        () => ({
            left: padding,
            top: padding,
            width: sudokuSize,
            height: sudokuSize,
        }),
        [padding, sudokuSize],
    );
    const fieldOuterRect = useMemo<Rect>(
        () => ({
            ...fieldInnerRect,
            left: containerLeft + fieldInnerRect.left,
        }),
        [containerLeft, fieldInnerRect],
    );

    const sidePanelRect = usePureMemo({
        left: isHorizontal ? controlsOffset : padding,
        top: isHorizontal ? padding : controlsOffset,
        width: isHorizontal ? controlsSize : sudokuSize,
        height: isHorizontal ? sudokuSize : controlsSize,
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

            <PuzzleContainerContext.Provider value={fieldOuterRect}>
                <Absolute left={containerLeft} top={0} {...containerSize}>
                    <Field context={context} rect={fieldInnerRect} />

                    <SidePanel context={context} rect={sidePanelRect} isHorizontal={isHorizontal} />
                </Absolute>

                <PuzzleMultiPlayerWarnings context={context} />
            </PuzzleContainerContext.Provider>
        </>
    );
}) as <T extends AnyPTM>(props: PuzzleProps<T>) => ReactElement;
