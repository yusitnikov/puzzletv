import {createPortal} from "react-dom";
import {CSSProperties, ReactNode} from "react";
import {useEventListener} from "../../../hooks/useEventListener";
import {globalPaddingCoeff, textColor, textHeightCoeff} from "../../app/globals";
import {usePuzzleContainer} from "../../../contexts/PuzzleContainerContext";

export interface ModalProps {
    cellSize: number;
    onClose: () => void;
    textAlign?: CSSProperties["textAlign"];
    children: ReactNode;
}

export const Modal = ({cellSize, onClose, textAlign = "center", children}: ModalProps) => {
    const padding = cellSize * globalPaddingCoeff;

    const puzzleContainer = usePuzzleContainer();

    useEventListener(window, "keydown", ({code}: KeyboardEvent) => {
        if (code === "Escape") {
            onClose();
        }
    });

    return createPortal(
        <div
            style={{
                zIndex: 1,
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0, 0, 0, 0.5)",
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
                    zIndex: 3,
                    border: `3px solid ${textColor}`,
                    backgroundColor: "#fff",
                    padding: `${padding}px ${padding * 2}px`,
                    borderRadius: padding / 3,
                    fontSize: cellSize * textHeightCoeff,
                    textAlign,
                }}
            >
                {children}
            </div>
        </div>,
        puzzleContainer
    );
};
