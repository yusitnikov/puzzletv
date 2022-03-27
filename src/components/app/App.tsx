/** @jsxImportSource @emotion/react */
import React, {useEffect, useState} from "react";
import {Rect} from "../../types/layout/Rect";
import {Absolute} from "../layout/absolute/Absolute";
import {Field} from "../sudoku/field/Field";
import {SidePanel} from "../sudoku/side-panel/SidePanel";
import {globalPaddingCoeff, textColor} from "./globals";
import {controlsWidthCoeff} from "../sudoku/controls/Controls";
import styled from "@emotion/styled";
import {CellWriteMode} from "../../types/sudoku/CellWriteMode";
import {
    FieldStateHistory, fieldStateHistoryAddState,
    fieldStateHistoryGetCurrent, fieldStateHistoryRedo,
    fieldStateHistoryUndo
} from "../../types/sudoku/FieldStateHistory";
import {createEmptyFieldState, processFieldStateCells} from "../../types/sudoku/FieldState";
import {noSelectedCells, SelectedCells} from "../../types/sudoku/SelectedCells";
import {CellState} from "../../types/sudoku/CellState";
import {RotatableDigit} from "../../types/sudoku/RotatableDigit";

const getScreenSize = (noTime?: boolean) => ({
    width: window.innerWidth,
    height: window.innerHeight,
    lastResize: noTime ? 0 : Date.now(),
})

const StyledContainer = styled(Absolute)({
    color: textColor,
    fontFamily: "Lato, sans-serif",
});

export const App = () => {
    // region Size calculation
    const [windowSize, setWindowSize] = useState(() => getScreenSize(true));
    useEffect(() => {
        const eventHandler = () => setWindowSize(getScreenSize());
        window.addEventListener("resize", eventHandler);
        return () => window.removeEventListener("resize", eventHandler);
    }, [setWindowSize]);

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

    const [history, setHistory] = useState<FieldStateHistory>(() => {
        const state = createEmptyFieldState();
        state.cells[0][0] = {
            ...state.cells[0][0],
            initialDigit: {digit: 6},
        };
        state.cells[4][2] = {
            ...state.cells[4][2],
            initialDigit: {digit: 6},
        };
        state.cells[5][0] = {
            ...state.cells[5][0],
            initialDigit: {digit: 9},
        };
        state.cells[8][4] = {
            ...state.cells[8][4],
            initialDigit: {digit: 5},
        };
        state.cells[8][5] = {
            ...state.cells[8][5],
            initialDigit: {digit: 2},
        };

        return {
            states: [state],
            currentIndex: 0
        };
    });
    const fieldState = fieldStateHistoryGetCurrent(history);

    const [selectedCells, setSelectedCells] = useState<SelectedCells>(noSelectedCells);

    const processSelectedCells = (processor: (cellState: CellState) => CellState) => setHistory(fieldStateHistoryAddState(
        history,
        state => processFieldStateCells(state, selectedCells.items, processor)
    ));

    const animationSpeed = 1000;

    const [cellWriteMode, setCellWriteMode] = useState(CellWriteMode.main);

    const [angle, setAngle] = useState(90);
    const isStartAngle = angle === 90;

    const [isStickyMode, setIsStickyMode] = useState(false);

    return <StyledContainer {...containerRect}>
        <Field
            isReady={!isStartAngle}
            state={fieldState}
            selectedCells={selectedCells}
            onSelectedCellsChange={setSelectedCells}
            rect={sudokuRect}
            angle={angle}
            animationSpeed={
                // Disable animation during window resize
                Date.now() > windowSize.lastResize + animationSpeed
                    ? animationSpeed
                    : 0
            }
            cellSize={cellSize}
        />

        <SidePanel
            rect={controlsRect}
            cellSize={cellSize}
            isHorizontal={isHorizontal}
            cellWriteMode={cellWriteMode}
            onCellWriteModeChange={setCellWriteMode}
            onDigit={(digit) => processSelectedCells(cell => {
                if (!isStickyMode && angle % 360 && [6, 9].includes(digit)) {
                    digit = 15 - digit;
                }

                const rotatableDigit: RotatableDigit = {
                    digit,
                    sticky: isStickyMode,
                };

                switch (cellWriteMode) {
                    case CellWriteMode.main: return {...cell, usersDigit: rotatableDigit};
                    case CellWriteMode.center: return {...cell, centerDigits: cell.centerDigits.toggle(rotatableDigit)};
                    case CellWriteMode.corner: return {...cell, cornerDigits: cell.cornerDigits.toggle(rotatableDigit)};
                    case CellWriteMode.color: return {...cell, colors: cell.colors.toggle(digit - 1)};
                }

                return cell;
            })}
            onClear={() => processSelectedCells(cell => {
                if (cell.usersDigit) {
                    return {...cell, usersDigit: undefined};
                }

                if (cell.centerDigits.size) {
                    return {...cell, centerDigits: cell.centerDigits.clear()};
                }

                if (cell.cornerDigits.size) {
                    return {...cell, cornerDigits: cell.cornerDigits.clear()};
                }

                if (cell.colors.size) {
                    return {...cell, colors: cell.colors.clear()};
                }

                return cell;
            })}
            onUndo={() => setHistory(fieldStateHistoryUndo)}
            onRedo={() => setHistory(fieldStateHistoryRedo)}
            isReady={!isStartAngle}
            onRotate={() => setAngle(angle + (isStartAngle ? 90 : 180))}
            isStickyMode={isStickyMode}
            onToggleStickyMode={() => setIsStickyMode(!isStickyMode)}
        />
    </StyledContainer>;
}
