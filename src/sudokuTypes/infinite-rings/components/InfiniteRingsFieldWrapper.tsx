/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { PuzzleContextProps } from "../../../types/sudoku/PuzzleContext";
import { PropsWithChildren } from "react";
import { blackColor } from "../../../components/app/globals";
import { controlButtonOptions, controlButtonStyles } from "../../../components/sudoku/controls/ControlButton";
import { gameStateHandleZoomClick, gameStateSetScaleLog } from "../../../types/sudoku/GameState";
import { getInfiniteLoopRegionBorderWidth } from "./InfiniteRingsBorderLines";
import { focusRingsSetting, isShowingAllInfiniteRings } from "../types/InfiniteRingsLayout";
import { useTranslate } from "../../../hooks/useTranslate";
import { indexes } from "../../../utils/indexes";
import { loop } from "../../../utils/math";
import { isTouchDevice } from "../../../utils/isTouchDevice";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { runInAction } from "mobx";
import { profiler } from "../../../utils/profiler";

const StyledButton = styled("button", controlButtonOptions)(controlButtonStyles);

const StyledCircleButton = styled("button", {
    shouldForwardProp(propName: PropertyKey) {
        return !["count", "index", "selected"].includes(propName as string);
    },
})(({ count, index, selected }: { count: number; index: number; selected: boolean }) => {
    const size = 100 / count;

    return [
        {
            position: "absolute",
            bottom: 0,
            left: `${index * size}%`,
            width: `${size}%`,
            height: `${size}%`,
            border: "none",
            outline: "none",
            background: "transparent",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            transition: "opacity 0.3s ease",
            opacity: selected ? 1 : 0.5,
        },
        !isTouchDevice && {
            "&:hover": {
                opacity: 1,
            },
        },
    ];
});
const StyledCircle = styled("div")({
    position: "absolute",
    inset: "25%",
    borderRadius: "50%",
    background: "#fff",
});

export const InfiniteRingsFieldWrapper = <T extends AnyPTM>(visibleRingsCountArg = 2) =>
    observer(function InfiniteRingsFieldWrapperFc({ context, children }: PropsWithChildren<PuzzleContextProps<T>>) {
        profiler.trace();

        const {
            puzzle: {
                fieldSize: { rowsCount: fieldSize },
            },
            scaleLog,
            cellSize,
            isReadonlyContext,
        } = context;

        const translate = useTranslate();

        const ringOffset = Math.round(scaleLog);
        const showingAllInfiniteRings = isShowingAllInfiniteRings(context, visibleRingsCountArg);
        const ringsCount = fieldSize / 2 - 1;
        const visibleRingsCount = showingAllInfiniteRings ? ringsCount : visibleRingsCountArg;
        const loopedRingOffset = loop(ringOffset, ringsCount);

        const buttonFontSize = cellSize * 1.2 * Math.pow(0.5, visibleRingsCount);

        const borderWidth = getInfiniteLoopRegionBorderWidth(cellSize, visibleRingsCount);

        return (
            <div
                style={{
                    position: "absolute",
                    inset: -borderWidth / 2,
                    overflow: "hidden",
                    border: `${borderWidth}px solid ${blackColor}`,
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: -borderWidth / 2,
                    }}
                >
                    {children}

                    {showingAllInfiniteRings && focusRingsSetting.get() && !isReadonlyContext && (
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                opacity: 0.15,
                                pointerEvents: "none",
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "25%",
                                    background: blackColor,
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "25%",
                                    background: blackColor,
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "25%",
                                    height: "100%",
                                    background: blackColor,
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: "25%",
                                    height: "100%",
                                    background: blackColor,
                                }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    inset: `${50 - 50 / Math.pow(2, visibleRingsCountArg + 1)}%`,
                                    background: blackColor,
                                }}
                            />
                        </div>
                    )}

                    <div
                        style={{
                            position: "absolute",
                            inset: `${50 * (1 - Math.pow(0.5, visibleRingsCount))}%`,
                            background: blackColor,
                            pointerEvents: "all",
                            fontSize: buttonFontSize,
                            lineHeight: `${buttonFontSize}px`,
                        }}
                    >
                        {!isReadonlyContext && (
                            <>
                                <StyledButton
                                    style={{
                                        position: "absolute",
                                        left: "5%",
                                        top: `${30 - 50 / ringsCount}%`,
                                        width: "40%",
                                        height: "40%",
                                    }}
                                    onClick={() => runInAction(() => gameStateHandleZoomClick(context, true))}
                                    title={translate("zoom in")}
                                >
                                    +
                                </StyledButton>

                                <StyledButton
                                    style={{
                                        position: "absolute",
                                        left: "55%",
                                        top: `${30 - 50 / ringsCount}%`,
                                        width: "40%",
                                        height: "40%",
                                    }}
                                    onClick={() => runInAction(() => gameStateHandleZoomClick(context, false))}
                                    title={translate("zoom out")}
                                >
                                    -
                                </StyledButton>

                                {indexes(ringsCount).map((index) => (
                                    <StyledCircleButton
                                        key={`circle-${index}`}
                                        count={ringsCount}
                                        index={index}
                                        selected={index === loopedRingOffset}
                                        onClick={() =>
                                            runInAction(() =>
                                                context.onStateChange(
                                                    gameStateSetScaleLog(
                                                        loop(index - ringOffset + ringsCount / 2, ringsCount) +
                                                            ringOffset -
                                                            ringsCount / 2,
                                                    ),
                                                ),
                                            )
                                        }
                                    >
                                        <StyledCircle />
                                    </StyledCircleButton>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    });
