/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { PuzzleContextProps } from "../../../types/sudoku/PuzzleContext";
import { textColor } from "../../../components/app/globals";
import { controlButtonOptions, controlButtonStyles } from "../../../components/sudoku/controls/ControlButton";
import { useTranslate } from "../../../hooks/useTranslate";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { FullCubePTM } from "../types/FullCubePTM";
import { gameStateHandleRotateFullCube } from "../types/FullCubeGameState";
import { vectorOx, vectorOy, vectorOz } from "../../../types/layout/Position3D";
import { KeyboardArrowUp, KeyboardArrowDown, KeyboardArrowRight, KeyboardArrowLeft } from "@emotion-icons/material";
import { useEventListener } from "../../../hooks/useEventListener";

const StyledButton = styled("button", {
    ...controlButtonOptions,
    shouldForwardProp(propName) {
        return controlButtonOptions.shouldForwardProp(propName) && propName !== "style";
    },
})([
    controlButtonStyles,
    ({ style }) => ({
        ...style,
        position: "absolute",
        pointerEvents: "all",
        transform: `translate(-50%, -50%) ${style?.transform}`,
        border: `1px solid ${textColor}`,
        width: "1em",
        height: "1em",
        boxSizing: "content-box",
        padding: "0.25em",
        lineHeight: "1em",
    }),
]);

export const FullCubeControls = observer(function FullCubeControlsFc({ context }: PuzzleContextProps<FullCubePTM>) {
    profiler.trace();

    const {
        puzzle: {
            fieldSize: { fieldSize },
        },
        cellSize,
        isReadonlyContext,
    } = context;

    const translate = useTranslate();
    const buttonTitle = (key: string) => `${translate("Rotate the puzzle")} (${translate("shortcut")}: ${key})`;

    const leftUp = () => context.onStateChange((context) => gameStateHandleRotateFullCube(context, vectorOx, 90));
    const leftDown = () => context.onStateChange((context) => gameStateHandleRotateFullCube(context, vectorOx, -90));
    const rightUp = () => context.onStateChange((context) => gameStateHandleRotateFullCube(context, vectorOz, -90));
    const rightDown = () => context.onStateChange((context) => gameStateHandleRotateFullCube(context, vectorOz, 90));
    const right = () => context.onStateChange((context) => gameStateHandleRotateFullCube(context, vectorOy, 90));
    const left = () => context.onStateChange((context) => gameStateHandleRotateFullCube(context, vectorOy, -90));

    useEventListener(window, "keydown", (ev) => {
        if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
            return;
        }

        switch (ev.code) {
            case "KeyQ":
                leftUp();
                ev.preventDefault();
                break;
            case "KeyA":
                leftDown();
                ev.preventDefault();
                break;
            case "KeyR":
                rightUp();
                ev.preventDefault();
                break;
            case "KeyF":
                rightDown();
                ev.preventDefault();
                break;
            case "KeyS":
                left();
                ev.preventDefault();
                break;
            case "KeyD":
                right();
                ev.preventDefault();
                break;
        }
    });

    if (isReadonlyContext) {
        return null;
    }

    return (
        <div
            style={{
                fontSize: cellSize / 2,
            }}
        >
            <StyledButton
                style={{
                    left: cellSize * (fieldSize / 4 - 0.55),
                    top: cellSize * ((fieldSize * 7) / 8 + 0.6),
                    transform: `skewY(${skewAngle}deg)`,
                }}
                onClick={leftUp}
                title={buttonTitle("Q")}
            >
                <KeyboardArrowUp />
            </StyledButton>
            <StyledButton
                style={{
                    left: cellSize * (fieldSize / 4 + 0.55),
                    top: cellSize * ((fieldSize * 7) / 8 + 1.15),
                    transform: `skewY(${skewAngle}deg)`,
                }}
                onClick={leftDown}
                title={buttonTitle("A")}
            >
                <KeyboardArrowDown />
            </StyledButton>

            <StyledButton
                style={{
                    left: cellSize * ((fieldSize * 3) / 4 - 0.55),
                    top: cellSize * ((fieldSize * 7) / 8 + 1.15),
                    transform: `skewY(-${skewAngle}deg)`,
                }}
                onClick={rightUp}
                title={buttonTitle("R")}
            >
                <KeyboardArrowUp />
            </StyledButton>
            <StyledButton
                style={{
                    left: cellSize * ((fieldSize * 3) / 4 + 0.55),
                    top: cellSize * ((fieldSize * 7) / 8 + 0.6),
                    transform: `skewY(-${skewAngle}deg)`,
                }}
                onClick={rightDown}
                title={buttonTitle("F")}
            >
                <KeyboardArrowDown />
            </StyledButton>

            <StyledButton
                style={{
                    left: cellSize * (fieldSize + 0.8),
                    top: cellSize * (fieldSize / 2 - 0.95),
                    transform: `skewY(-${skewAngle}deg)`,
                }}
                onClick={right}
                title={buttonTitle("D")}
            >
                <KeyboardArrowRight />
            </StyledButton>
            <StyledButton
                style={{
                    left: cellSize * (fieldSize + 0.8),
                    top: cellSize * (fieldSize / 2 + 0.15),
                    transform: `skewY(-${skewAngle}deg)`,
                }}
                onClick={left}
                title={buttonTitle("S")}
            >
                <KeyboardArrowLeft />
            </StyledButton>
        </div>
    );
});

const skewAngle = (Math.atan(0.5) * 180) / Math.PI;
