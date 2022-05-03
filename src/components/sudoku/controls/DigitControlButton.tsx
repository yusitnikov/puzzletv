import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {gameStateHandleDigit, ProcessedGameState} from "../../../types/sudoku/GameState";
import {MergeStateAction} from "../../../types/react/MergeStateAction";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {useCallback} from "react";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";
import {Set} from "../../../types/struct/Set";

export interface DigitControlButtonProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    index: number;

    cellSize: number;
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
}

export const DigitControlButton = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {index, cellSize, puzzle, state, onStateChange}: DigitControlButtonProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const translate = useTranslate();

    const {
        typeManager,
    } = puzzle;

    const {
        createCellDataByDisplayDigit,
        digitShortcuts = [],
        digitShortcutTips = [],
    } = typeManager;

    const {
        cellWriteMode,
    } = state;

    const digit = index + 1;
    const cellData = createCellDataByDisplayDigit(digit, state);
    const isColorMode = cellWriteMode === CellWriteMode.color;
    const shortcut = !isColorMode && digitShortcuts[index];
    const shortcutTip = !isColorMode && digitShortcutTips[index];

    let title = `${translate("Shortcut")}: ${digit}`;
    if (shortcut) {
        title = `${title} ${translate("or")} ${shortcut}`;
    }
    if (shortcutTip) {
        title = `${title} (${translate(shortcutTip)})`;
    }

    const handleDigit = useCallback(
        () => onStateChange(gameState => gameStateHandleDigit(typeManager, gameState, digit)),
        [onStateChange, typeManager]
    );

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        const {code} = ev;

        if (
            code === `Digit${digit}` ||
            code === `Numpad${digit}` ||
            (shortcut && code === `Key${shortcut}`)
        ) {
            handleDigit();
            ev.preventDefault();
        }
    });

    return <ControlButton
        left={index % 3}
        top={(index - index % 3) / 3}
        cellSize={cellSize}
        fullSize={true}
        opacityOnHover={isColorMode}
        onClick={handleDigit}
        title={title}
    >
        <CellContent
            puzzle={puzzle}
            data={{
                usersDigit: cellWriteMode === CellWriteMode.main ? cellData : undefined,
                cornerDigits: new Set(cellWriteMode === CellWriteMode.corner ? [cellData] : []),
                centerDigits: new Set(cellWriteMode === CellWriteMode.center ? [cellData] : []),
                colors: new Set(cellWriteMode === CellWriteMode.color ? [index] : []),
            }}
            size={cellSize}
        />
    </ControlButton>;
};
