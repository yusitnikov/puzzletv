import {ControlButton, controlButtonPaddingCoeff} from "../../../components/sudoku/controls/ControlButton";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {ChessPiece} from "../types/ChessPiece";
import {ChessGameState} from "../types/ChessGameState";
import {ChessColor} from "../types/ChessColor";
import {Absolute} from "../../../components/layout/absolute/Absolute";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {ArrowCurveDownLeft} from "@emotion-icons/fluentui-system-filled";
import {useState} from "react";
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

    const handleToggleColor = () => {
        onStateChange(({selectedColor}) => ({
            selectedColor: selectedColor === ChessColor.white ? ChessColor.black : ChessColor.white,
        }));

        setUsedColorSelectionOnce(true);
    };

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

    return <>
        {cellWriteMode !== CellWriteMode.color && !usedColorSelectionOnce && <Absolute
            top={cellSize * (2 + 3 * controlButtonPaddingCoeff)}
            width={cellSize * (3 + 2 * controlButtonPaddingCoeff)}
            style={{
                fontSize: cellSize * 0.3,
                lineHeight: `${cellSize * 0.3}px`,
            }}
        >
            {translate("Chess piece color")}

            <Absolute
                left={cellSize * 0.25}
                top={cellSize * 0.4}
                width={cellSize * 0.5}
                height={cellSize * 0.5}
            >
                <ArrowCurveDownLeft/>
            </Absolute>
        </Absolute>}

        <ControlButton
            left={0}
            top={3}
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
