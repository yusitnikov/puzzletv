/** @jsxImportSource @emotion/react */
import React, {useState} from "react";
import {Rect} from "../../types/layout/Rect";
import {Absolute} from "../layout/absolute/Absolute";
import {Field} from "../sudoku/field/Field";
import {SidePanel} from "../sudoku/side-panel/SidePanel";
import {globalPaddingCoeff, textColor} from "./globals";
import {controlsWidthCoeff} from "../sudoku/controls/Controls";
import styled from "@emotion/styled";
import {CellWriteMode} from "../../types/sudoku/CellWriteMode";
import {
    FieldStateHistory,
    fieldStateHistoryAddState,
    fieldStateHistoryGetCurrent,
    fieldStateHistoryRedo,
    fieldStateHistoryUndo
} from "../../types/sudoku/FieldStateHistory";
import {
    createEmptyFieldState,
    areAllFieldStateCells,
    processFieldStateCells, isAnyFieldStateCell
} from "../../types/sudoku/FieldState";
import {noSelectedCells, SelectedCells} from "../../types/sudoku/SelectedCells";
import {CellState} from "../../types/sudoku/CellState";
import {RotatableDigit} from "../../types/sudoku/RotatableDigit";
import {indexes08} from "../../utils/indexes";
import {useEventListener} from "../../hooks/useEventListener";
import {useControlKeysState} from "../../hooks/useControlKeysState";
import {useWindowSize} from "../../hooks/useWindowSize";
import {GermanWhispers} from "../sudoku/figures/german-whispers/GermanWhispers";
import {Thermometer} from "../sudoku/figures/thermometer/Thermometer";
import {Arrow} from "../sudoku/figures/arrow/Arrow";
import {KillerCage} from "../sudoku/figures/killer-cage/KillerCage";
import {KropkiDot} from "../sudoku/figures/kropki-dot/KropkiDot";
import {XMark} from "../sudoku/figures/x-mark/XMark";
import {AnimationSpeed} from "../../types/sudoku/AnimationSpeed";
import {useIsFullScreen} from "../../hooks/useIsFullScreen";
import {toggleFullScreen} from "../../utils/fullScreen";

const StyledContainer = styled(Absolute)({
    color: textColor,
    fontFamily: "Lato, sans-serif",
});

export const App = () => {
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

    const {isCtrlDown, isShiftDown} = useControlKeysState();

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

    const areAllSelectedCells = (predicate: (cellState: CellState) => boolean) =>
        areAllFieldStateCells(fieldState, selectedCells.items, predicate);

    const isAnySelectedCell = (predicate: (cellState: CellState) => boolean) =>
        isAnyFieldStateCell(fieldState, selectedCells.items, predicate);

    const [animationSpeed, setAnimationSpeed] = useState(AnimationSpeed.regular);

    const [persistentCellWriteMode, setPersistentCellWriteMode] = useState(CellWriteMode.main);
    const tempCellWriteMode = isCtrlDown
        ? (isShiftDown ? CellWriteMode.color : CellWriteMode.center)
        : (isShiftDown ? CellWriteMode.corner : undefined);
    const cellWriteMode = tempCellWriteMode ?? persistentCellWriteMode;

    const [angle, setAngle] = useState(-90);
    const isStartAngle = angle === -90;
    const isReady = !isStartAngle;

    const [isStickyMode, setIsStickyMode] = useState(false);

    const isFullScreen = useIsFullScreen();

    // region Sudoku event handlers
    const handleDigit = (digit: number) => {
        if (cellWriteMode !== CellWriteMode.color && !isStickyMode && angle % 360 && [6, 9].includes(digit)) {
            digit = 15 - digit;
        }

        const rotatableDigit: RotatableDigit = {
            digit,
            sticky: isStickyMode,
        };

        switch (cellWriteMode) {
            case CellWriteMode.main:
                processSelectedCells(cell => ({
                    ...cell,
                    usersDigit: rotatableDigit,
                    centerDigits: cell.centerDigits.clear(),
                    cornerDigits: cell.cornerDigits.clear(),
                }));
                break;
            case CellWriteMode.center:
                const areAllCentersEnabled = areAllSelectedCells(cell => cell.centerDigits.contains(rotatableDigit));
                processSelectedCells(cell => ({...cell, centerDigits: cell.centerDigits.toggle(rotatableDigit, !areAllCentersEnabled)}));
                break;
            case CellWriteMode.corner:
                const areAllCornersEnabled = areAllSelectedCells(cell => cell.cornerDigits.contains(rotatableDigit));
                processSelectedCells(cell => ({...cell, cornerDigits: cell.cornerDigits.toggle(rotatableDigit, !areAllCornersEnabled)}));
                break;
            case CellWriteMode.color:
                processSelectedCells(cell => ({...cell, colors: cell.colors.toggle(digit - 1)}));
                break;
        }
    }

    const handleClear = () => {
        const clearCenter = () => processSelectedCells(cell => ({...cell, centerDigits: cell.centerDigits.clear()}));
        const clearCorner = () => processSelectedCells(cell => ({...cell, cornerDigits: cell.cornerDigits.clear()}));
        const clearColor = () => processSelectedCells(cell => ({...cell, colors: cell.colors.clear()}));

        switch (cellWriteMode) {
            case CellWriteMode.main:
                if (isAnySelectedCell(cell => !!cell.usersDigit)) {
                    processSelectedCells(cell => ({...cell, usersDigit: undefined}));
                } else if (isAnySelectedCell(cell => !!cell.centerDigits.size)) {
                    clearCenter();
                } else if (isAnySelectedCell(cell => !!cell.cornerDigits.size)) {
                    clearCorner();
                } else {
                    clearColor();
                }
                break;
            case CellWriteMode.center:
                clearCenter();
                break;
            case CellWriteMode.corner:
                clearCorner()
                break;
            case CellWriteMode.color:
                clearColor();
                break;
        }
    };

    const handleUndo = () => setHistory(fieldStateHistoryUndo);

    const handleRedo = () => setHistory(fieldStateHistoryRedo);

    const handleRotate = () => setAngle(angle + (isStartAngle ? 90 : 180));

    const handleToggleStickyMode = () => setIsStickyMode(!isStickyMode);

    const handleAnimationSpeedToggle = () => {
        switch (animationSpeed) {
            case AnimationSpeed.regular:
                setAnimationSpeed(AnimationSpeed.immediate);
                break;
            case AnimationSpeed.immediate:
                setAnimationSpeed(AnimationSpeed.slow);
                break;
            case AnimationSpeed.slow:
                setAnimationSpeed(AnimationSpeed.regular);
                break;
        }
    };

    const handleToggleFullScreen = toggleFullScreen;
    // endregion

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey, shiftKey} = ev;

        if (isReady) {
            for (const index of indexes08) {
                const digit = index + 1;
                if (code === `Digit${digit}` || code === `Numpad${digit}`) {
                    handleDigit(digit);
                    ev.preventDefault();
                }
            }
        }

        switch (code) {
            case "KeyR":
                handleRotate();
                ev.preventDefault();
                break;
            case "KeyS":
                handleToggleStickyMode();
                ev.preventDefault();
                break;
            case "Delete":
            case "Backspace":
                handleClear();
                ev.preventDefault();
                break;
            case "KeyZ":
                if (ctrlKey) {
                    if (shiftKey) {
                        handleRedo();
                        ev.preventDefault();
                    } else {
                        handleUndo();
                        ev.preventDefault();
                    }
                }
                break;
            case "KeyY":
                if (ctrlKey && !shiftKey) {
                    handleRedo();
                    ev.preventDefault();
                }
                break;
            case "KeyA":
                if (ctrlKey && !shiftKey && isReady) {
                    setSelectedCells(selectedCells.set(
                        indexes08.flatMap(top => indexes08.map(left => ({left, top})))
                    ));
                    ev.preventDefault();
                }
                break;
            case "Escape":
                if (!ctrlKey && !shiftKey) {
                    setSelectedCells(selectedCells.clear());
                    ev.preventDefault();
                }
                break;
            case "PageUp":
                setPersistentCellWriteMode((persistentCellWriteMode + 3) % 4);
                ev.preventDefault();
                break;
            case "PageDown":
                setPersistentCellWriteMode((persistentCellWriteMode + 1) % 4);
                ev.preventDefault();
                break;
        }
    });

    useEventListener(window, "beforeunload", (ev: BeforeUnloadEvent) => {
        if (isReady) {
            ev.preventDefault();
            ev.returnValue = "";
            return "";
        }
    });

    return <StyledContainer {...containerRect}>
        <Field
            isReady={isReady}
            state={fieldState}
            selectedCells={selectedCells}
            onSelectedCellsChange={setSelectedCells}
            rect={sudokuRect}
            angle={angle}
            animationSpeed={animationSpeed}
            cellSize={cellSize}
            topChildren={<>
                <XMark left={7} top={7.5}/>

                <KropkiDot cx={7.5} cy={7} isFilled={true}/>

                <XMark left={8} top={6.5}/>
            </>}
        >
            <Thermometer points={[
                [7.5, 1.5],
                [6.5, 2.5],
            ]}/>

            <Thermometer points={[
                [1.5, 0.5],
                [1.5, 1.5],
            ]}/>

            <Arrow points={[
                [8.5, 4.5],
                [6.5, 4.5],
                [6.5, 3.5],
            ]}/>

            <GermanWhispers points={[
                [5.5, 1.5],
                [4.5, 2.5],
                [7.5, 2.5],
            ]}/>

            <KillerCage
                sum={12}
                bottomSumPointIndex={2}
                points={[
                    [0, 4],
                    [0, 6],
                    [1, 6],
                    [1, 5],
                    [2, 5],
                    [2, 4],
                ]}
            />

            <KillerCage
                sum={22}
                bottomSumPointIndex={4}
                points={[
                    [5, 7],
                    [5, 8],
                    [4, 8],
                    [4, 9],
                    [6, 9],
                    [6, 8],
                    [7, 8],
                    [7, 7],
                ]}
            />
        </Field>

        <SidePanel
            rect={controlsRect}
            cellSize={cellSize}
            isHorizontal={isHorizontal}
            cellWriteMode={cellWriteMode}
            onCellWriteModeChange={setPersistentCellWriteMode}
            onDigit={handleDigit}
            onClear={handleClear}
            onUndo={handleUndo}
            onRedo={handleRedo}
            isReady={isReady}
            onRotate={handleRotate}
            isStickyMode={isStickyMode}
            onToggleStickyMode={handleToggleStickyMode}
            animationSpeed={animationSpeed}
            onAnimationSpeedToggle={handleAnimationSpeedToggle}
            isFullScreen={isFullScreen}
            onToggleFullScreen={handleToggleFullScreen}
        />
    </StyledContainer>;
}
