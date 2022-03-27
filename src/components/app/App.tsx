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

    const animationSpeed = 500;

    const [cellWriteMode, setCellWriteMode] = useState(CellWriteMode.main);

    const [angle, setAngle] = useState(90);
    const isStartAngle = angle === 90;

    const [isStickyMode, setIsStickyMode] = useState(false);

    return <StyledContainer {...containerRect}>
        <Field
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
            onDigit={() => console.log("Digit not implemented yet...")}
            onClear={() => console.log("Clear not implemented yet...")}
            onUndo={() => console.log("Undo not implemented yet...")}
            onRedo={() => console.log("Redo not implemented yet...")}
            isReady={!isStartAngle}
            onRotate={() => setAngle(angle + (isStartAngle ? 90 : 180))}
            isStickyMode={isStickyMode}
            onToggleStickyMode={() => setIsStickyMode(!isStickyMode)}
        />
    </StyledContainer>;
}
