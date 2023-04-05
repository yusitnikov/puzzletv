import {createPortal} from "react-dom";
import {CSSProperties, ReactNode} from "react";
import {useEventListener} from "../../../hooks/useEventListener";
import {globalPaddingCoeff, headerHeight, textColor, textHeightCoeff} from "../../app/globals";
import {usePuzzleContainer} from "../../../contexts/PuzzleContainerContext";

export interface ModalProps {
    cellSize: number;
    onClose?: () => void;
    textAlign?: CSSProperties["textAlign"];
    borderless?: boolean;
    children: ReactNode;
}

export const Modal = ({cellSize, onClose, textAlign = "center", borderless, children}: ModalProps) => {
    const padding = cellSize * globalPaddingCoeff;

    const puzzleContainer = usePuzzleContainer();

    useEventListener(window, "keydown", ({code}) => {
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
                top: headerHeight,
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
                onClick={onClose}
            />

            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...(puzzleContainer ?? {inset: 0}),
                }}
            >
                <div
                    style={{
                        zIndex: 3,
                        border: borderless ? undefined : `3px solid ${textColor}`,
                        backgroundColor: "#fff",
                        padding: borderless ? 0 : `${padding}px ${padding * 2}px`,
                        borderRadius: borderless ? 0 : padding / 3,
                        fontSize: cellSize * textHeightCoeff,
                        textAlign,
                    }}
                >
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
