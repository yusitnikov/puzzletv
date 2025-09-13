import { createPortal } from "react-dom";
import { HTMLAttributes, ReactNode } from "react";
import { useEventListener } from "../../../hooks/useEventListener";
import { globalPaddingCoeff, headerHeight, textColor, textHeightCoeff } from "../../app/globals";
import { usePuzzleContainer } from "../../../contexts/PuzzleContainerContext";
import { runInAction } from "mobx";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { Button, ButtonProps } from "../button/Button";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
    cellSize: number;
    onClose?: () => void;
    borderless?: boolean;
    noHeader?: boolean;
    noPuzzleContainer?: boolean;
    children: ReactNode;
    buttons?: ((Omit<ButtonProps, "children"> & { label: string }) | string)[];
    buttonsDirection?: "row" | "column";
    autoFocusButtonIndex?: number | false;
}

export const Modal = observer(function ModalFc({
    cellSize,
    onClose,
    borderless,
    noHeader,
    noPuzzleContainer,
    children,
    buttons = [],
    buttonsDirection = "row",
    autoFocusButtonIndex = 0,
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
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        gap: padding,
                        ...divProps.style,
                    }}
                >
                    {children}

                    {buttons.length !== 0 && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: buttonsDirection,
                                gap: `${padding}px ${cellSize * textHeightCoeff}px`,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {buttons.map((button, index) => {
                                let label: string;
                                let props: ButtonProps = {};
                                if (typeof button === "object" && "label" in button) {
                                    const { label: buttonLabel, ...buttonProps } = button;
                                    label = buttonLabel;
                                    props = buttonProps;
                                } else {
                                    label = button;
                                }

                                return (
                                    <Button
                                        key={index}
                                        type={"button"}
                                        cellSize={cellSize}
                                        autoFocus={index === autoFocusButtonIndex}
                                        onClick={onClose}
                                        {...props}
                                        style={{ padding: "0.5em 1em", ...props.style }}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
});
