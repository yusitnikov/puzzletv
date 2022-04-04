/** @jsxImportSource @emotion/react */
import React from "react";
import {Size} from "../../types/layout/Size";
import {Absolute} from "../layout/absolute/Absolute";
import {Field} from "../sudoku/field/Field";
import {SidePanel} from "../sudoku/side-panel/SidePanel";
import {globalPaddingCoeff, textColor} from "./globals";
import {controlsWidthCoeff} from "../sudoku/controls/Controls";
import styled from "@emotion/styled";
import {useWindowSize} from "../../hooks/useWindowSize";
import {useGame} from "../../hooks/sudoku/useGame";
import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {SudokuTypeManager} from "../../types/sudoku/SudokuTypeManager";
import {DigitComponentTypeContext} from "../../contexts/DigitComponentTypeContext";

const sudokuCoeff = 9;
const panelCoeff = controlsWidthCoeff;
const maxCoeff = sudokuCoeff + panelCoeff + globalPaddingCoeff * 3;
const minCoeff = sudokuCoeff + globalPaddingCoeff * 2;

const StyledContainer = styled(Absolute)({
    color: textColor,
    fontFamily: "Lato, sans-serif",
});

export interface AppProps<CellType> {
    typeManager: SudokuTypeManager<CellType>;
    puzzle: PuzzleDefinition<CellType>;
}

export const App = <CellType,>({typeManager, puzzle}: AppProps<CellType>) => {
    // region Size calculation
    const windowSize = useWindowSize();

    const isHorizontal = windowSize.width > windowSize.height;
    const maxWindowSize = Math.max(windowSize.width, windowSize.height);
    const minWindowSize = Math.min(windowSize.width, windowSize.height);

    const cellSize = Math.min(minWindowSize / minCoeff, maxWindowSize / maxCoeff);
    const padding = cellSize * globalPaddingCoeff;
    const sudokuSize = cellSize * sudokuCoeff;
    const controlsSize = cellSize * panelCoeff;
    const maxContainerSize = cellSize * maxCoeff;
    const minContainerSize = cellSize * minCoeff;

    const containerSize: Size = {
        width: isHorizontal ? maxContainerSize : minContainerSize,
        height: isHorizontal ? minContainerSize : maxContainerSize,
    };

    const controlsOffset = sudokuSize + padding * 2;
    // endregion

    const [gameState, mergeGameState] = useGame(typeManager, puzzle);

    return <DigitComponentTypeContext.Provider value={typeManager.digitComponentType}>
        <StyledContainer
            left={(windowSize.width - containerSize.width) / 2}
            top={(windowSize.height - containerSize.height) / 2}
            {...containerSize}
        >
            <Field
                typeManager={typeManager}
                puzzle={puzzle}
                state={gameState}
                onStateChange={mergeGameState}
                rect={{
                    left: padding,
                    top: padding,
                    width: sudokuSize,
                    height: sudokuSize,
                }}
                cellSize={cellSize}
            />

            <SidePanel
                typeManager={typeManager}
                puzzle={puzzle}
                rect={{
                    left: isHorizontal ? controlsOffset : padding,
                    top: isHorizontal ? padding : controlsOffset,
                    width: isHorizontal ? controlsSize : sudokuSize,
                    height: isHorizontal ? sudokuSize : controlsSize,
                }}
                cellSize={cellSize}
                isHorizontal={isHorizontal}
                state={gameState}
                onStateChange={mergeGameState}
            />
        </StyledContainer>
    </DigitComponentTypeContext.Provider>;
}
