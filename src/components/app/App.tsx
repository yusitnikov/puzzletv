/** @jsxImportSource @emotion/react */
import React from "react";
import {Rect} from "../../types/layout/Rect";
import {Absolute} from "../layout/absolute/Absolute";
import {Field} from "../sudoku/field/Field";
import {SidePanel} from "../sudoku/side-panel/SidePanel";
import {globalPaddingCoeff, textColor} from "./globals";
import {controlsWidthCoeff} from "../sudoku/controls/Controls";
import styled from "@emotion/styled";
import {fillFieldStateInitialDigits} from "../../types/sudoku/FieldState";
import {useEventListener} from "../../hooks/useEventListener";
import {useWindowSize} from "../../hooks/useWindowSize";
import {GermanWhispers} from "../sudoku/figures/german-whispers/GermanWhispers";
import {Thermometer} from "../sudoku/figures/thermometer/Thermometer";
import {Arrow} from "../sudoku/figures/arrow/Arrow";
import {KillerCage} from "../sudoku/figures/killer-cage/KillerCage";
import {KropkiDot} from "../sudoku/figures/kropki-dot/KropkiDot";
import {XMark} from "../sudoku/figures/x-mark/XMark";
import {useGameState} from "../../hooks/sudoku/useGameState";
import {isStartAngle} from "../../utils/rotation";

const initialState = fillFieldStateInitialDigits({
    0: {
        0: {digit: 6},
    },
    4: {
        2: {digit: 6},
    },
    5: {
        0: {digit: 9},
    },
    8: {
        4: {digit: 5},
        5: {digit: 2},
    },
});

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

    const [gameState, mergeGameState] = useGameState(initialState);

    const isReady = !isStartAngle(gameState.angle);

    useEventListener(window, "beforeunload", (ev: BeforeUnloadEvent) => {
        if (isReady) {
            ev.preventDefault();
            ev.returnValue = "";
            return "";
        }
    });

    return <StyledContainer {...containerRect}>
        <Field
            state={gameState}
            onStateChange={mergeGameState}
            isReady={isReady}
            rect={sudokuRect}
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
            state={gameState}
            onStateChange={mergeGameState}
            isReady={isReady}
        />
    </StyledContainer>;
}
