import {useTranslate} from "../../../hooks/useTranslate";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {useCallback} from "react";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {enterDigitAction} from "../../../types/sudoku/GameStateAction";
import {joinListSemantically} from "../../../utils/array";

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
        disableDigitShortcuts,
        digitShortcuts = [],
        digitShortcutTips = [],
    } = typeManager;

    const {
        cellWriteMode,
        cellWriteModeInfo: {isDigitMode, buttonContent: ButtonContent},
        isShowingSettings,
    } = state;

    const digit = index + 1;
    const cellData = createCellDataByDisplayDigit(digit, state);
    let shortcuts = isDigitMode && digitShortcuts[index] || [];
    const shortcutTip = isDigitMode && digitShortcutTips[index];

    if (!isDigitMode || !disableDigitShortcuts) {
        shortcuts = [digit.toString(), ...shortcuts];
    }
    let title = "";
    if (shortcuts.length) {
        title = `${translate("Shortcut")}: ${joinListSemantically(shortcuts, translate("or"))}`;
        if (shortcutTip) {
            title += ` (${translate(shortcutTip)})`;
        }
    }

    const handleDigit = useCallback(
        () => onStateChange(enterDigitAction(digit, context)),
        [onStateChange, digit, context]
    );

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        if (isShowingSettings) {
            return;
        }

        const {code} = ev;

        if (shortcuts.flatMap(shortcut => [`Key${shortcut}`, `Digit${shortcut}`, `Numpad${shortcut}`]).includes(code)) {
            handleDigit();
            ev.preventDefault();
        } else if ([`Digit${digit}`, `Numpad${digit}`].includes(code)) {
            // Prevent Ctrl+digit from navigating to another tab even if the digit shortcut is not supported
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
        {ButtonContent?.(context, cellData, cellSize, index) || <CellContent
            context={context}
            data={{usersDigit: cellData}}
            size={cellSize}
        />}
    </ControlButton>;
};
