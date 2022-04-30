import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {RotateRight} from "@emotion-icons/material";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlsProps} from "../../../components/sudoku/controls/Controls";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {RotatablePuzzleBoxGameState, RotatablePuzzleBoxProcessedGameState} from "../types/RotatablePuzzleBoxGameState";

export const RotatablePuzzleBoxMainControls = (
    {
        cellSize,
        isHorizontal,
        onStateChange,
    }: ControlsProps<number, RotatablePuzzleBoxGameState, RotatablePuzzleBoxProcessedGameState>
) => {
    const translate = useTranslate();

    const handleRotate = () => onStateChange(({angle}) => ({angle: angle + 1}));

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code} = ev;

        switch (code) {
            case "KeyR":
                handleRotate();
                ev.preventDefault();
                break;
        }
    });

    return <>
        <ControlButton
            left={isHorizontal ? 4 : 3}
            top={isHorizontal ? 3 : 4}
            cellSize={cellSize}
            onClick={handleRotate}
            title={`${translate("Rotate the puzzle")} (${translate("shortcut")}: R)`}
        >
            <RotateRight/>
        </ControlButton>
    </>;
};
