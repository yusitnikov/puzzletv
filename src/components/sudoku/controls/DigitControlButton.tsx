import {gameStateHandleDigit} from "../../../types/sudoku/GameState";
import {useTranslate} from "../../../contexts/LanguageCodeContext";
import {CellWriteMode, isDigitWriteMode} from "../../../types/sudoku/CellWriteMode";
import {useCallback} from "react";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";
import {Set} from "../../../types/struct/Set";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

export interface DigitControlButtonProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    index: number;
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
}

export const DigitControlButton = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {index, context}: DigitControlButtonProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const translate = useTranslate();

    const {puzzle, state, onStateChange, cellSize} = context;

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
    const isDigitMode = isDigitWriteMode(cellWriteMode);
    const shortcut = isDigitMode && digitShortcuts[index];
    const shortcutTip = isDigitMode && digitShortcutTips[index];

    let title = `${translate("Shortcut")}: ${digit}`;
    if (shortcut) {
        title = `${title} ${translate("or")} ${shortcut}`;
    }
    if (shortcutTip) {
        title = `${title} (${translate(shortcutTip)})`;
    }

    const handleDigit = useCallback(
        () => onStateChange(gameState => gameStateHandleDigit(typeManager, gameState, digit)),
        [onStateChange, typeManager, digit]
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
        opacityOnHover={cellWriteMode === CellWriteMode.color}
        onClick={handleDigit}
        title={title}
    >
        <CellContent
            context={context}
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
