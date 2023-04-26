import {useTranslate} from "../../../hooks/useTranslate";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {useCallback} from "react";
import {useEventListener} from "../../../hooks/useEventListener";
import {ControlButton} from "./ControlButton";
import {CellContent} from "../cell/CellContent";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {enterDigitAction, getNextActionId} from "../../../types/sudoku/GameStateAction";
import {joinListSemantically} from "../../../utils/array";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export interface DigitControlButtonProps<T extends AnyPTM> {
    index: number;
    // how many digits do we have in the current mode
    count: number;
    context: PuzzleContext<T>;
}

export const DigitControlButton = <T extends AnyPTM>({index, count, context}: DigitControlButtonProps<T>) => {
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
        flipKeypad,
        processed: {
            cellWriteMode,
            cellWriteModeInfo: {
                isDigitMode,
                secondaryButtonContent: ButtonContent,
                getCurrentSecondaryButton,
                setCurrentSecondaryButton,
            },
        },
    } = state;

    const currentButton = getCurrentSecondaryButton?.(context);
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
            if (setCurrentSecondaryButton) {
                setCurrentSecondaryButton(context, index);
            } else {
                onStateChange(enterDigitAction(digit, context, getNextActionId()));
            }
        },
        [setCurrentSecondaryButton, onStateChange, digit, index, context]
    );

    useEventListener(window, "keydown", (ev) => {
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

    const top = (index - index % 3) / 3;
    const rowsCount = Math.min(3, Math.ceil(count / 3));

    return <ControlButton
        left={index === 9 ? 1 : index % 3}
        top={flipKeypad && top < rowsCount ? (rowsCount - 1 - top) : top}
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
