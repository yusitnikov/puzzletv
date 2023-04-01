import {useTranslate} from "../../../hooks/useTranslate";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {useCallback} from "react";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {enterDigitAction} from "../../../types/sudoku/GameStateAction";
import {joinListSemantically} from "../../../utils/array";

export interface DigitControlButtonProps<CellType, ExType = {}, ProcessedExType = {}> {
    index: number;
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
}

export const DigitControlButton = <CellType, ExType = {}, ProcessedExType = {}>(
    {index, context}: DigitControlButtonProps<CellType, ExType, ProcessedExType>
) => {
    const translate = useTranslate();

    const {puzzle, state, onStateChange, cellSizeForSidePanel: cellSize} = context;

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
        isShowingSettings,
        processed: {
            cellWriteMode,
            cellWriteModeInfo: {
                isDigitMode,
                buttonContent: ButtonContent,
                getCurrentButton,
                setCurrentButton,
            },
        },
    } = state;

    const currentButton = getCurrentButton?.(context);
    const selectableButtonContent = currentButton !== undefined;

    const digit = index + 1;
    const digitKey = digit === 10 ? 0 : digit;
    const cellData = createCellDataByDisplayDigit(digit, state);
    let shortcuts = (isDigitMode && digitShortcuts[index]) || [];
    const shortcutTip = isDigitMode && digitShortcutTips[index];

    if (!isDigitMode || !disableDigitShortcuts) {
        shortcuts = [digitKey.toString(), ...shortcuts];
    }

    const shortcutTitles = shortcuts.map(shortcut => typeof shortcut === "string" ? shortcut : shortcut.title);
    const shortcutCodes = shortcuts.flatMap(shortcut => typeof shortcut === "string" ? [`Key${shortcut}`, `Digit${shortcut}`, `Numpad${shortcut}`] : shortcut.codes);

    let title = "";
    if (shortcuts.length) {
        title = `${translate("Shortcut")}: ${joinListSemantically(shortcutTitles, translate("or"))}`;
        if (shortcutTip) {
            title += ` (${translate(shortcutTip)})`;
        }
    }

    const handleDigit = useCallback(
        () => {
            if (setCurrentButton) {
                setCurrentButton(context, index);
            } else {
                onStateChange(enterDigitAction(digit, context));
            }
        },
        [setCurrentButton, onStateChange, digit, index, context]
    );

    useEventListener(window, "keydown", (ev: KeyboardEvent) => {
        if (isShowingSettings) {
            return;
        }

        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

        // Windows doesn't recognize Ctrl+Shift+0 (on the main keyboard), so accept Ctrl+Shift+Minus as a fallback
        if (shortcutCodes.includes(code) || (ctrlKey && shiftKey && shortcutCodes.includes("Digit0") && code === "Minus")) {
            handleDigit();
            ev.preventDefault();
        } else if ([`Digit${digitKey}`, `Numpad${digitKey}`].includes(code)) {
            // Prevent Ctrl+digit from navigating to another tab even if the digit shortcut is not supported
            ev.preventDefault();
        }
    });

    return <ControlButton
        left={index === 9 ? 1 : index % 3}
        top={(index - index % 3) / 3}
        cellSize={cellSize}
        fullHeight={!selectableButtonContent}
        innerBorderWidth={selectableButtonContent ? 1 : 0}
        checked={currentButton === index}
        opacityOnHover={cellWriteMode === CellWriteMode.color}
        onClick={handleDigit}
        title={title}
    >
        {contentSize => ButtonContent?.(context, cellData, contentSize, index) || <CellContent
            context={context}
            data={{usersDigit: cellData}}
            size={contentSize}
        />}
    </ControlButton>;
};
