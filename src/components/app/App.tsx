/** @jsxImportSource @emotion/react */
import React from "react";
import {Rect} from "../../types/layout/Rect";
import {Absolute} from "../layout/absolute/Absolute";
import {Field} from "../sudoku/field/Field";
import {SidePanel} from "../sudoku/side-panel/SidePanel";
import {globalPaddingCoeff, textColor} from "./globals";
import {controlsWidthCoeff} from "../sudoku/controls/Controls";
import styled from "@emotion/styled";
import {useEventListener} from "../../hooks/useEventListener";
import {useWindowSize} from "../../hooks/useWindowSize";
import {useGameState} from "../../hooks/sudoku/useGameState";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";

const StyledContainer = styled(Absolute)({
    color: textColor,
    fontFamily: "Lato, sans-serif",
});

export const App = (puzzle: PuzzleDefinition) => {
    // region Size calculation
    const windowSize = useWindowSize();

    const isHorizontal = windowSize.width > windowSize.height;
    const maxWindowSize = Math.max(windowSize.width, windowSize.height);
    const minWindowSize = Math.min(windowSize.width, windowSize.height);

    const sudokuCoeff = 9;
    const panelCoeff = controlsWidthCoeff;
    const maxCoeff = sudokuCoeff + panelCoeff + globalPaddingCoeff * 3;
    const minCoeff = sudokuCoeff + globalPaddingCoeff * 2;

    const cellSize = Math.min(minWindowSize / minCoeff, maxWindowSize / maxCoeff);
    const padding = cellSize * globalPaddingCoeff;
    const sudokuSize = cellSize * sudokuCoeff;
    const controlsSize = cellSize * panelCoeff;
    const maxContainerSize = cellSize * maxCoeff;
    const minContainerSize = cellSize * minCoeff;

    const containerWidth = isHorizontal ? maxContainerSize : minContainerSize;
    const containerHeight = isHorizontal ? minContainerSize : maxContainerSize;
    const containerRect: Rect = {
        left: (windowSize.width - containerWidth) / 2,
        top: (windowSize.height - containerHeight) / 2,
        width: containerWidth,
        height: containerHeight,
    };

    const sudokuRect: Rect = {
        left: padding,
        top: padding,
        width: sudokuSize,
        height: sudokuSize,
    };

    const controlsOffset = sudokuSize + padding * 2;
    const controlsRect: Rect = {
        left: isHorizontal ? controlsOffset : padding,
        top: isHorizontal ? padding : controlsOffset,
        width: isHorizontal ? controlsSize : sudokuSize,
        height: isHorizontal ? sudokuSize : controlsSize,
    };
    // endregion

    const [gameState, mergeGameState] = useGameState(puzzle);

    useEventListener(window, "beforeunload", (ev: BeforeUnloadEvent) => {
        if (gameState.isReady) {
            ev.preventDefault();
            ev.returnValue = "";
            return "";
        }
    });

    return <StyledContainer {...containerRect}>
        <Field
            puzzle={puzzle}
            state={gameState}
            onStateChange={mergeGameState}
            rect={sudokuRect}
            cellSize={cellSize}
        />

        <SidePanel
            puzzle={puzzle}
            rect={controlsRect}
            cellSize={cellSize}
            isHorizontal={isHorizontal}
            state={gameState}
            onStateChange={mergeGameState}
        />
    </StyledContainer>;
}
