/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";
import {PropsWithChildren} from "react";
import {blackColor, getRegionBorderWidth} from "../../../components/app/globals";
import {controlButtonOptions, controlButtonStyles} from "../../../components/sudoku/controls/ControlButton";
import {InfiniteRingsGameState, InfiniteRingsProcessedGameState} from "../types/InfiniteRingsGameState";
import {useEventListener} from "../../../hooks/useEventListener";

const StyledButton = styled("button", controlButtonOptions)(controlButtonStyles);

export const InfiniteRingsFieldWrapper = <CellType, ExType extends InfiniteRingsGameState, ProcessedExType extends InfiniteRingsProcessedGameState>(
    {
        context: {
            state: {
                selectedCells,
                extension: {ringOffset},
                isShowingSettings,
            },
            onStateChange,
            cellSize,
        },
        children,
    }: PropsWithChildren<PuzzleContextProps<CellType, ExType, ProcessedExType>>
) => {
    const buttonFontSize = cellSize * 0.3;

    const borderWidth = Math.ceil(getRegionBorderWidth(cellSize) * cellSize / 2) * 2;

    const setRingOffset = (ringOffset: number) => onStateChange({
        extension: {ringOffset} as Partial<ExType>,
        selectedCells: selectedCells.clear(),
    });

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        if (isShowingSettings) {
            return;
        }

        switch ((ev.shiftKey ? "Shift+" : "") + ev.code) {
            case "NumpadAdd":
            case "Shift+Equal":
                setRingOffset(ringOffset + 1);
                ev.preventDefault();
                break;
            case "Minus":
            case "NumpadSubtract":
                setRingOffset(ringOffset - 1);
                ev.preventDefault();
                break;
        }
    });

    return <div style={{
        position: "absolute",
        inset: -borderWidth / 2,
        overflow: "hidden",
        border: `${borderWidth}px solid ${blackColor}`,
    }}>
        <div style={{
            position: "absolute",
            inset: -borderWidth / 2,
        }}>
            {children}

            {/*middle border lines*/}
            <div style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: borderWidth,
                margin: "auto",
                background: blackColor,
            }}/>
            <div style={{
                position: "absolute",
                inset: 0,
                width: borderWidth,
                height: "100%",
                margin: "auto",
                background: blackColor,
            }}/>

            <div style={{
                position: "absolute",
                inset: "37.5%",
                background: blackColor,
                pointerEvents: "all",
                fontSize: buttonFontSize,
                lineHeight: `${buttonFontSize}px`,
            }}>
                <StyledButton
                    style={{
                        position: "absolute",
                        left: "5%",
                        top: "30%",
                        width: "40%",
                        height: "40%",
                    }}
                    onClick={() => setRingOffset(ringOffset + 1)}
                >
                    +
                </StyledButton>

                <StyledButton
                    style={{
                        position: "absolute",
                        left: "55%",
                        top: "30%",
                        width: "40%",
                        height: "40%",
                    }}
                    onClick={() => setRingOffset(ringOffset - 1)}
                >
                    -
                </StyledButton>
            </div>
        </div>
    </div>;
};
