/** @jsxImportSource @emotion/react */
import React from "react";
import {Size} from "../../../types/layout/Size";
import {Absolute} from "../../layout/absolute/Absolute";
import {Field} from "../field/Field";
import {SidePanel} from "../side-panel/SidePanel";
import {globalPaddingCoeff, textColor} from "../../app/globals";
import {controlsWidthCoeff} from "../controls/Controls";
import styled from "@emotion/styled";
import {useWindowSize} from "../../../hooks/useWindowSize";
import {useGame} from "../../../hooks/sudoku/useGame";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {DigitComponentTypeContext} from "../../../contexts/DigitComponentTypeContext";
import {Title} from "../../layout/title/Title";
import {RegularDigitComponentType} from "../digit/RegularDigit";

const StyledContainer = styled(Absolute)({
    color: textColor,
    fontFamily: "Lato, sans-serif",
});

export interface PuzzleProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
}

export const Puzzle = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {puzzle}: PuzzleProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {
        title,
        author,
        typeManager: {
            digitComponentType = RegularDigitComponentType,
        },
        fieldSize: {fieldSize},
        fieldMargin = 0,
    } = puzzle;

    // region Size calculation
    const windowSize = useWindowSize();

    const isHorizontal = windowSize.width > windowSize.height;
    const maxWindowSize = Math.max(windowSize.width, windowSize.height);
    const minWindowSize = Math.min(windowSize.width, windowSize.height);

    const fieldSizeWithMargin = fieldSize + 2 * fieldMargin;
    const panelCoeff = controlsWidthCoeff;
    const maxCoeff = fieldSizeWithMargin + panelCoeff + globalPaddingCoeff * 3;
    const minCoeff = fieldSizeWithMargin + globalPaddingCoeff * 2;

    const cellSize = Math.min(minWindowSize / minCoeff, maxWindowSize / maxCoeff);
    const padding = cellSize * globalPaddingCoeff;
    const sudokuSize = cellSize * fieldSizeWithMargin;
    const controlsSize = cellSize * panelCoeff;
    const maxContainerSize = cellSize * maxCoeff;
    const minContainerSize = cellSize * minCoeff;

    const containerSize: Size = {
        width: isHorizontal ? maxContainerSize : minContainerSize,
        height: isHorizontal ? minContainerSize : maxContainerSize,
    };

    const controlsOffset = sudokuSize + padding * 2;
    // endregion

    const [gameState, mergeGameState] = useGame(puzzle);

    return <DigitComponentTypeContext.Provider value={digitComponentType}>
        <Title>
            {title}
            {author && <> by {author}</>}
        </Title>

        <StyledContainer
            left={(windowSize.width - containerSize.width) / 2}
            top={(windowSize.height - containerSize.height) / 2}
            {...containerSize}
        >
            <Field
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