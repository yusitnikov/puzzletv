import {ControlButton, controlButtonPaddingCoeff} from "../../../components/sudoku/controls/ControlButton";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {ChessPiece} from "../types/ChessPiece";
import {ChessGameState} from "../types/ChessGameState";
import {ChessColor} from "../types/ChessColor";
import {Absolute} from "../../../components/layout/absolute/Absolute";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {ArrowLeft} from "@emotion-icons/fluentui-system-filled";
import {useCallback, useState} from "react";
import {useTranslate} from "../../../contexts/LanguageCodeContext";

export const ChessMainControls = (
    {
        cellSize,
        state: {cellWriteMode, selectedColor},
        onStateChange,
    }: ControlsProps<ChessPiece, ChessGameState, ChessGameState>
) => {
    const translate = useTranslate();

    const [usedColorSelectionOnce, setUsedColorSelectionOnce] = useState(false);

    const handleToggleColor = useCallback(() => {
        onStateChange(({selectedColor}) => ({
            selectedColor: selectedColor === ChessColor.white ? ChessColor.black : ChessColor.white,
        }));

        setUsedColorSelectionOnce(true);
    }, [onStateChange, setUsedColorSelectionOnce]);

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code, ctrlKey, metaKey} = ev;

        switch (code) {
            case "KeyC":
                if (!ctrlKey && !metaKey) {
                    handleToggleColor();
                    ev.preventDefault();
                }
                break;
        }
    });

    if (cellWriteMode === CellWriteMode.color) {
        return null;
    }

    return <>
        {!usedColorSelectionOnce && <Absolute
            left={cellSize}
            top={cellSize * 2 * (1 + controlButtonPaddingCoeff)}
            width={cellSize * 2 * (1 + controlButtonPaddingCoeff)}
            style={{
                fontSize: cellSize * 0.3,
                lineHeight: `${cellSize * 0.3}px`,
            }}
        >
            <Absolute
                left={cellSize * 0.5}
                width={cellSize * (1.5 + 2 * controlButtonPaddingCoeff)}
                height={cellSize}
                style={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {translate("Chess piece color")}
            </Absolute>

            <Absolute
                top={cellSize * 0.25}
                width={cellSize * 0.5}
                height={cellSize * 0.5}
            >
                <ArrowLeft/>
            </Absolute>
        </Absolute>}

        <ControlButton
            left={0}
            top={2}
            cellSize={cellSize}
            onClick={handleToggleColor}
            title={`${translate("Chess piece color")} (${translate("click to toggle")}, ${translate("shortcut")}: C)`}
        >
            {(contentSize) => <Absolute
                width={contentSize}
                height={contentSize}
                borderWidth={1}
                style={{
                    backgroundColor: selectedColor === ChessColor.white ? "#fff" : "#000"
                }}
            />}
        </ControlButton>
    </>;
};
