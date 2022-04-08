import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {ChessPiece} from "../types/ChessPiece";
import {ChessGameState} from "../types/ChessGameState";
import {ChessColor} from "../types/ChessColor";
import {Absolute} from "../../../components/layout/absolute/Absolute";

export const ChessMainControls = (
    {
        cellSize,
        state: {selectedColor},
        onStateChange,
    }: ControlsProps<ChessPiece, ChessGameState, ChessGameState>
) => {
    const handleToggleColor = () => onStateChange(({selectedColor}) => ({
        selectedColor: selectedColor === ChessColor.white ? ChessColor.black : ChessColor.white,
    }));

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code} = ev;

        switch (code) {
            case "KeyC":
                handleToggleColor();
                ev.preventDefault();
                break;
        }
    });

    return <ControlButton
        left={0}
        top={3}
        cellSize={cellSize}
        onClick={handleToggleColor}
        title={"Chess piece color (click to toggle, shortcut: C)"}
    >
        {(contentSize) => <Absolute
            width={contentSize}
            height={contentSize}
            borderWidth={1}
            style={{
                backgroundColor: selectedColor === ChessColor.white ? "#fff" : "#000"
            }}
        />}
    </ControlButton>;
};
