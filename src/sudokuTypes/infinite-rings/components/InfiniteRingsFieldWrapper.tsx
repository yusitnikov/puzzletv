/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";
import {PropsWithChildren} from "react";
import {blackColor} from "../../../components/app/globals";
import {controlButtonOptions, controlButtonStyles} from "../../../components/sudoku/controls/ControlButton";
import {setInfiniteRingOffset} from "../types/InfiniteRingsGameState";
import {useEventListener} from "../../../hooks/useEventListener";
import {getInfiniteLoopRegionBorderWidth} from "./InfiniteRingsBorderLines";
import {useIsShowingAllInfiniteRings} from "../types/InfiniteRingsLayout";
import {useTranslate} from "../../../hooks/useTranslate";
import {indexes} from "../../../utils/indexes";
import {loop} from "../../../utils/math";
import {isTouchDevice} from "../../../utils/isTouchDevice";

const StyledButton = styled("button", controlButtonOptions)(controlButtonStyles);

const StyledCircleButton = styled("button", {
    shouldForwardProp(propName: PropertyKey) {
        return !["count", "index", "selected"].includes(propName as string);
    },
})(({count, index, selected}: {count: number, index: number, selected: boolean}) => {
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

export const InfiniteRingsFieldWrapper = <CellType, ExType, ProcessedExType>(
    visibleRingsCountArg = 2
) => function InfiniteRingsFieldWrapperComponent(
    {context, children}: PropsWithChildren<PuzzleContextProps<CellType, ExType, ProcessedExType>>
) {
    const {
        puzzle: {fieldSize: {rowsCount: fieldSize}},
        state: {
            processed: {scaleLog},
            isShowingSettings,
        },
        onStateChange,
        cellSize,
        isReadonlyContext,
    } = context;

    const translate = useTranslate();

    const ringOffset = Math.round(scaleLog);
    const [isShowingAllInfiniteRings] = useIsShowingAllInfiniteRings(context, visibleRingsCountArg);
    const ringsCount = fieldSize / 2 - 1;
    const visibleRingsCount = isShowingAllInfiniteRings ? ringsCount : visibleRingsCountArg;
    const loopedRingOffset = loop(ringOffset, ringsCount);

    const buttonFontSize = cellSize * 1.2 * Math.pow(0.5, visibleRingsCount);

    const borderWidth = getInfiniteLoopRegionBorderWidth(cellSize, visibleRingsCount);

    useEventListener(window, "keydown", (ev) => {
        if (isShowingSettings) {
            return;
        }

        switch ((ev.shiftKey ? "Shift+" : "") + ev.code) {
            case "NumpadAdd":
            case "Shift+Equal":
                onStateChange(setInfiniteRingOffset(context, ringOffset + 1));
                ev.preventDefault();
                break;
            case "Minus":
            case "NumpadSubtract":
                onStateChange(setInfiniteRingOffset(context, ringOffset - 1));
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

            {isShowingAllInfiniteRings && !isReadonlyContext && <div style={{
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
                {!isReadonlyContext && <>
                    <StyledButton
                        style={{
                            position: "absolute",
                            left: "5%",
                            top: `${30 - 50 / ringsCount}%`,
                            width: "40%",
                            height: "40%",
                        }}
                        onClick={() => onStateChange(setInfiniteRingOffset(context, ringOffset + 1))}
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
                        onClick={() => onStateChange(setInfiniteRingOffset(context, ringOffset - 1))}
                        title={translate("zoom out")}
                    >
                        -
                    </StyledButton>

                    {indexes(ringsCount).map((index) => <StyledCircleButton
                        key={`circle-${index}`}
                        count={ringsCount}
                        index={index}
                        selected={index === loopedRingOffset}
                        onClick={() => onStateChange(setInfiniteRingOffset(
                            context,
                            loop(index - ringOffset + ringsCount / 2, ringsCount) + ringOffset - ringsCount / 2
                        ))}
                    >
                        <StyledCircle/>
                    </StyledCircleButton>)}
                </>}
            </div>
        </div>
    </div>;
};
