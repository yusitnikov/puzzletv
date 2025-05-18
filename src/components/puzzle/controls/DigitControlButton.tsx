import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { ReactElement, useCallback } from "react";
import { useEventListener } from "../../../hooks/useEventListener";
import { ControlButton } from "./ControlButton";
import { CellContent } from "../cell/CellContent";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { enterDigitAction, getNextActionId } from "../../../types/puzzle/GameStateAction";
import { joinListSemantically } from "../../../utils/array";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { translate } from "../../../utils/translate";
import { createSimpleKeyInfo } from "../../../types/puzzle/KeyInfo";

export interface DigitControlButtonProps<T extends AnyPTM> {
    index: number;
    context: PuzzleContext<T>;
}

export const DigitControlButton = observer(function DigitControlButton<T extends AnyPTM>({
    index,
    context,
}: DigitControlButtonProps<T>) {
    profiler.trace();

    const {
        puzzle: {
            typeManager: { createCellDataByDisplayDigit, disableDigitShortcuts, digitShortcuts = [] },
            supportZero,
        },
        inputMode,
        inputModeInfo: {
            isDigitMode,
            secondaryButtonContent: ButtonContent,
            getCurrentSecondaryButton,
            setCurrentSecondaryButton,
        },
        cellSizeForSidePanel: cellSize,
        digitsCountInCurrentMode: count,
    } = context;

    const currentButton = getCurrentSecondaryButton?.(context);
    const selectableButtonContent = currentButton !== undefined;

    let digit = index + 1;
    if (supportZero && isDigitMode && digit === count) {
        digit = 0;
    }
    const digitKey = digit === 10 ? 0 : digit;
    const cellData = createCellDataByDisplayDigit(digit, context);
    let shortcuts = ((isDigitMode && digitShortcuts[index]) || []).map((shortcut) =>
        typeof shortcut === "string" ? createSimpleKeyInfo(shortcut) : shortcut,
    );

    if (!isDigitMode || !disableDigitShortcuts) {
        shortcuts = [createSimpleKeyInfo(digitKey.toString()), ...shortcuts];
    }

    const shortcutCodes = shortcuts.flatMap((shortcut) => shortcut.codes);

    let title = "";
    if (shortcuts.length) {
        title = `${translate("Shortcut")}: ${joinListSemantically(
            shortcuts.map(({ title }) => (typeof title === "string" ? title : translate(title))),
            translate("or"),
        )}`;
    }

    const handleDigit = useCallback(() => {
        if (setCurrentSecondaryButton) {
            setCurrentSecondaryButton(context, index);
        } else {
            context.onStateChange(enterDigitAction(digit, getNextActionId()));
        }
    }, [context, setCurrentSecondaryButton, digit, index]);

    useEventListener(window, "keydown", (ev) => {
        if (settings.isOpened) {
            return;
        }

        const { code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey } = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;

        // Windows doesn't recognize Ctrl+Shift+0 (on the main keyboard), so accept Ctrl+Shift+Minus as a fallback
        if (
            shortcutCodes.includes(code) ||
            (ctrlKey && shiftKey && shortcutCodes.includes("Digit0") && code === "Minus")
        ) {
            handleDigit();
            ev.preventDefault();
        } else if ([`Digit${digitKey}`, `Numpad${digitKey}`].includes(code)) {
            // Prevent Ctrl+digit from navigating to another tab even if the digit shortcut is not supported
            ev.preventDefault();
        }
    });

    const top = (index - (index % 3)) / 3;
    const rowsCount = Math.min(3, Math.ceil(count / 3));

    return (
        <ControlButton
            left={index === 9 ? 1 : index % 3}
            top={settings.flipKeypad.get() && top < rowsCount ? rowsCount - 1 - top : top}
            cellSize={cellSize}
            fullHeight={!selectableButtonContent}
            innerBorderWidth={selectableButtonContent ? 1 : 0}
            checked={currentButton === index}
            opacityOnHover={inputMode === PuzzleInputMode.color}
            onClick={handleDigit}
            title={title}
        >
            {(contentSize) =>
                ButtonContent?.(context, cellData, contentSize, index) || (
                    <CellContent context={context} data={{ usersDigit: cellData }} size={contentSize} />
                )
            }
        </ControlButton>
    );
}) as <T extends AnyPTM>(props: DigitControlButtonProps<T>) => ReactElement;
