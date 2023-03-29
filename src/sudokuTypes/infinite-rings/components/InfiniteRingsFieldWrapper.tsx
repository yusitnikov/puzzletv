/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";
import {PropsWithChildren} from "react";
import {blackColor} from "../../../components/app/globals";
import {controlButtonOptions, controlButtonStyles} from "../../../components/sudoku/controls/ControlButton";
import {InfiniteRingsGameState, InfiniteRingsProcessedGameState} from "../types/InfiniteRingsGameState";
import {useEventListener} from "../../../hooks/useEventListener";
import {getInfiniteLoopRegionBorderWidth} from "./InfiniteRingsBorderLines";
import {useIsShowingAllInfiniteRings} from "../types/InfiniteRingsLayout";
import {useTranslate} from "../../../hooks/useTranslate";

const StyledButton = styled("button", controlButtonOptions)(controlButtonStyles);

export const InfiniteRingsFieldWrapper = <
    CellType,
    ExType extends InfiniteRingsGameState,
    ProcessedExType extends InfiniteRingsProcessedGameState
>(visibleRingsCountArg = 2) => function InfiniteRingsFieldWrapperComponent(
    {
        context: {
            puzzle: {fieldSize: {rowsCount: fieldSize}},
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
) {
    const translate = useTranslate();

    const [isShowingAllInfiniteRings] = useIsShowingAllInfiniteRings();
    const visibleRingsCount = isShowingAllInfiniteRings ? fieldSize / 2 - 1 : visibleRingsCountArg;

    const buttonFontSize = cellSize * 1.2 * Math.pow(0.5, visibleRingsCount);

    const borderWidth = getInfiniteLoopRegionBorderWidth(cellSize, visibleRingsCount);

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

            {isShowingAllInfiniteRings && <div style={{
                position: "absolute",
                inset: 0,
                opacity: 0.15,
            }}>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "25%",
                    background: blackColor,
                }}/>
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "25%",
                    background: blackColor,
                }}/>
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "25%",
                    height: "100%",
                    background: blackColor,
                }}/>
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "25%",
                    height: "100%",
                    background: blackColor,
                }}/>
                <div style={{
                    position: "absolute",
                    inset: `${50 - 50 / Math.pow(2, visibleRingsCountArg + 1)}%`,
                    background: blackColor,
                }}/>
            </div>}

            <div style={{
                position: "absolute",
                inset: `${50 * (1 - Math.pow(0.5, visibleRingsCount))}%`,
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
                    title={translate("zoom in")}
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
                    title={translate("zoom out")}
                >
                    -
                </StyledButton>
            </div>
        </div>
    </div>;
};
