/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";
import {PropsWithChildren} from "react";
import {blackColor} from "../../../components/app/globals";
import {controlButtonOptions, controlButtonStyles} from "../../../components/sudoku/controls/ControlButton";
import {InfiniteRingsGameState, InfiniteRingsProcessedGameState} from "../types/InfiniteRingsGameState";
import {useEventListener} from "../../../hooks/useEventListener";

const StyledButton = styled("button", controlButtonOptions)(controlButtonStyles);

export const InfiniteRingsFieldWrapper = <CellType, ExType extends InfiniteRingsGameState, ProcessedExType extends InfiniteRingsProcessedGameState>(
    {
        context: {
            puzzle: {fieldSize: {rowsCount: fieldSize}},
            state: {
                selectedCells,
                extension: {ringOffset},
                processedExtension: {ringOffset: animatedRingOffset},
                isShowingSettings,
            },
            onStateChange,
            cellSize,
        },
        children,
    }: PropsWithChildren<PuzzleContextProps<CellType, ExType, ProcessedExType>>
) => {
    const ringsCount = fieldSize / 2 - 1;
    const buttonFontSize = cellSize * 0.3;

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

    const scaleCoeff1 = Math.pow(2, ((animatedRingOffset % ringsCount) + ringsCount) % ringsCount);
    const scaleCoeff2 = scaleCoeff1 / Math.pow(2, ringsCount);

    return <div style={{
        position: "absolute",
        inset: -1,
        overflow: "hidden",
    }}>
        <div style={{
            position: "absolute",
            inset: 1,
        }}>
            <div style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${scaleCoeff1})`,
            }}>
                {children}
            </div>
            <div style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${scaleCoeff2})`,
            }}>
                {children}
            </div>

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
