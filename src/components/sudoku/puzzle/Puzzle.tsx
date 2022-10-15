/** @jsxImportSource @emotion/react */
import React, {useMemo} from "react";
import {Size} from "../../../types/layout/Size";
import {Absolute} from "../../layout/absolute/Absolute";
import {Field} from "../field/Field";
import {SidePanel} from "../side-panel/SidePanel";
import {globalPaddingCoeff} from "../../app/globals";
import {getControlsWidthCoeff} from "../controls/Controls";
import styled from "@emotion/styled";
import {useWindowSize} from "../../../hooks/useWindowSize";
import {useGame} from "../../../hooks/sudoku/useGame";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {DigitComponentTypeContext} from "../../../contexts/DigitComponentTypeContext";
import {Title} from "../../layout/title/Title";
import {RegularDigitComponentType} from "../digit/RegularDigit";
import {useTranslate} from "../../../hooks/useTranslate";
import {PuzzleContainerContext} from "../../../contexts/PuzzleContainerContext";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {Modal} from "../../layout/modal/Modal";
import {Rect} from "../../../types/layout/Rect";
import {profiler} from "../../../utils/profiler";

const StyledContainer = styled("div", {
    shouldForwardProp(propName) {
        return propName !== "isDragMode";
    }
})(({isDragMode}: {isDragMode: boolean}) => ({
    position: "absolute",
    inset: 0,
    cursor: isDragMode ? "pointer" : undefined,
}));

export interface PuzzleProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
}

export const Puzzle = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {puzzle}: PuzzleProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    profiler.flush();

    const {
        title,
        author,
        typeManager: {
            digitComponentType = RegularDigitComponentType,
        },
        fieldSize: {fieldSize},
        fieldMargin = 0,
    } = puzzle;

    const translate = useTranslate();

    // region Size calculation
    const windowSize = useWindowSize();

    const isHorizontal = windowSize.width > windowSize.height;
    const maxWindowSize = Math.max(windowSize.width, windowSize.height);
    const minWindowSize = Math.min(windowSize.width, windowSize.height);

    const fieldSizeWithMargin = fieldSize + 2 * fieldMargin;
    const fieldSizeForSidePanel = 9;
    const panelCoeff = getControlsWidthCoeff(puzzle);
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
    const fieldInnerRect = useMemo<Rect>(() => ({
        left: padding,
        top: padding,
        width: sudokuSize,
        height: sudokuSize,
    }), [padding, sudokuSize]);
    const fieldOuterRect = useMemo<Rect>(() => ({
        ...fieldInnerRect,
        left: containerLeft + fieldInnerRect.left,
    }), [containerLeft, fieldInnerRect]);
    // endregion

    const context = useGame(puzzle, cellSize, cellSizeForSidePanel);

    const {state: gameState, multiPlayer} = context;

    const {isEnabled, isLoaded, isDoubledConnected, hostData} = multiPlayer;

    return <DigitComponentTypeContext.Provider value={digitComponentType}>
        <Title>
            {translate(title)}
            {author && <> {translate("by")} {translate(author)}</>}
            {" "}– Puzzle TV
        </Title>

        <StyledContainer
            isDragMode={gameState.cellWriteMode === CellWriteMode.move}
        >
            <PuzzleContainerContext.Provider value={fieldOuterRect}>
                <Absolute
                    left={containerLeft}
                    top={0}
                    {...containerSize}
                >
                    <Field
                        context={context}
                        rect={fieldInnerRect}
                    />

                    <SidePanel
                        context={context}
                        rect={{
                            left: isHorizontal ? controlsOffset : padding,
                            top: isHorizontal ? padding : controlsOffset,
                            width: isHorizontal ? controlsSize : sudokuSize,
                            height: isHorizontal ? sudokuSize : controlsSize,
                        }}
                        isHorizontal={isHorizontal}
                    />
                </Absolute>

                {isEnabled && <>
                    {!isLoaded && <Modal cellSize={cellSizeForSidePanel}>
                        <div>{translate("Loading")}...</div>
                    </Modal>}

                    {isLoaded && <>
                        {isDoubledConnected && <Modal cellSize={cellSizeForSidePanel}>
                            <div>{translate("You opened this puzzle in more than one tab")}!</div>
                            <div>{translate("Please leave only one active tab")}.</div>
                        </Modal>}

                        {!hostData && <Modal cellSize={cellSizeForSidePanel}>
                            <div>{translate("The host of the game is not connected")}!</div>
                            <div>{translate("Please wait for them to join")}.</div>
                        </Modal>}
                    </>}
                </>}
            </PuzzleContainerContext.Provider>
        </StyledContainer>
    </DigitComponentTypeContext.Provider>;
}
