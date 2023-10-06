/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";
import {textColor} from "../../../components/app/globals";
import {controlButtonOptions, controlButtonStyles} from "../../../components/sudoku/controls/ControlButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {observer} from "mobx-react-lite";
import {runInAction} from "mobx";
import {profiler} from "../../../utils/profiler";
import {FullCubePTM} from "../types/FullCubePTM";
import {gameStateHandleRotateFullCube} from "../types/FullCubeGameState";
import {initialCoordsBase3D} from "../../../types/layout/Position3D";
import {KeyboardArrowUp, KeyboardArrowDown, KeyboardArrowRight, KeyboardArrowLeft} from "@emotion-icons/material";
import {useEventListener} from "../../../hooks/useEventListener";

const StyledButton = styled("button", controlButtonOptions)([
    controlButtonStyles,
    {
        pointerEvents: "all",
        transform: "translate(-50%, -50%)",
        border: `1px solid ${textColor}`,
        width: "1em",
        height: "1em",
        boxSizing: "content-box",
        padding: "0.25em",
        lineHeight: "1em",
    },
]);

export const FullCubeControls = observer(function FullCubeControlsFc(
    {context}: PuzzleContextProps<FullCubePTM>
) {
    profiler.trace();

    const {
        puzzle: {fieldSize: {fieldSize}},
        cellSize,
        isReadonlyContext,
    } = context;

    const translate = useTranslate();
    const buttonTitle = (key: string) => `${translate("Rotate the puzzle")} (${translate("shortcut")}: ${key})`;

    const leftUp = () => runInAction(() => gameStateHandleRotateFullCube(context, initialCoordsBase3D.ox, 90));
    const leftDown = () => runInAction(() => gameStateHandleRotateFullCube(context, initialCoordsBase3D.ox, -90));
    const rightUp = () => runInAction(() => gameStateHandleRotateFullCube(context, initialCoordsBase3D.oz, -90));
    const rightDown = () => runInAction(() => gameStateHandleRotateFullCube(context, initialCoordsBase3D.oz, 90));
    const right = () => runInAction(() => gameStateHandleRotateFullCube(context, initialCoordsBase3D.oy, 90));
    const left = () => runInAction(() => gameStateHandleRotateFullCube(context, initialCoordsBase3D.oy, -90));

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

    return <div style={{
        fontSize: cellSize / 2,
    }}>
        <StyledButton
            style={{
                position: "absolute",
                left: cellSize * (fieldSize / 4 - 0.55),
                top: cellSize * (fieldSize * 7 / 8 + 0.6),
            }}
            onClick={leftUp}
            title={buttonTitle("Q")}
        >
            <KeyboardArrowUp/>
        </StyledButton>
        <StyledButton
            style={{
                position: "absolute",
                left: cellSize * (fieldSize / 4 + 0.55),
                top: cellSize * (fieldSize * 7 / 8 + 1.15),
            }}
            onClick={leftDown}
            title={buttonTitle("A")}
        >
            <KeyboardArrowDown/>
        </StyledButton>

        <StyledButton
            style={{
                position: "absolute",
                left: cellSize * (fieldSize * 3 / 4 - 0.55),
                top: cellSize * (fieldSize * 7 / 8 + 1.15),
            }}
            onClick={rightUp}
            title={buttonTitle("R")}
        >
            <KeyboardArrowUp/>
        </StyledButton>
        <StyledButton
            style={{
                position: "absolute",
                left: cellSize * (fieldSize * 3 / 4 + 0.55),
                top: cellSize * (fieldSize * 7 / 8 + 0.6),
            }}
            onClick={rightDown}
            title={buttonTitle("F")}
        >
            <KeyboardArrowDown/>
        </StyledButton>

        <StyledButton
            style={{
                position: "absolute",
                left: cellSize * (fieldSize + 0.6),
                top: cellSize * (fieldSize / 2 - 0.55),
            }}
            onClick={right}
            title={buttonTitle("D")}
        >
            <KeyboardArrowRight/>
        </StyledButton>
        <StyledButton
            style={{
                position: "absolute",
                left: cellSize * (fieldSize + 0.6),
                top: cellSize * (fieldSize / 2 + 0.55),
            }}
            onClick={left}
            title={buttonTitle("S")}
        >
            <KeyboardArrowLeft/>
        </StyledButton>
    </div>;
});
