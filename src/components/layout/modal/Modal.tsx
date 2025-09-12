import { createPortal } from "react-dom";
import { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useEventListener } from "../../../hooks/useEventListener";
import { globalPaddingCoeff, headerHeight, textColor, textHeightCoeff } from "../../app/globals";
import { usePuzzleContainer } from "../../../contexts/PuzzleContainerContext";
import { runInAction } from "mobx";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    cellSize: number;
    onClose?: () => void;
    textAlign?: CSSProperties["textAlign"];
    borderless?: boolean;
    noHeader?: boolean;
    noPuzzleContainer?: boolean;
    children: ReactNode;
}

export const Modal = observer(function ModalFc({
    cellSize,
    onClose,
    textAlign = "center",
    borderless,
    noHeader,
    noPuzzleContainer,
    children,
    ...divProps
}: ModalProps) {
    profiler.trace();

    const padding = cellSize * globalPaddingCoeff;

    const puzzleContainer = usePuzzleContainer();

    useEventListener(window, "keydown", ({ code }) => {
        if (code === "Escape") {
            onClose?.();
        }
    });

    return createPortal(
        <div
            style={{
                zIndex: 1,
                position: "absolute",
                inset: 0,
                top: noHeader ? 0 : headerHeight,
                background: "rgba(0, 0, 0, 0.5)",
                fontFamily: "Lato, sans-serif",
            }}
        >
            <div
                style={{
                    zIndex: 2,
                    position: "absolute",
                    inset: 0,
                }}
                onClick={onClose && (() => runInAction(onClose))}
            />

            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...((noPuzzleContainer ? undefined : puzzleContainer) ?? { inset: 0 }),
                }}
            >
                <div
                    {...divProps}
                    style={{
                        zIndex: 3,
                        border: borderless ? undefined : `3px solid ${textColor}`,
                        backgroundColor: "#fff",
                        padding: borderless ? 0 : `${padding}px ${padding * 2}px`,
                        borderRadius: borderless ? 0 : padding / 3,
                        fontSize: cellSize * textHeightCoeff,
                        textAlign,
                        ...divProps.style,
                    }}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
});
